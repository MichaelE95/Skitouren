import type { Plugin } from 'vite';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Dev-only tour store (Q11). While `npm run dev` is running, the app saves tours
 * straight into public/tours/ (GPX file + tours.json), so adding a tour = git commit.
 * Not part of the production build; the hosted site falls back to a localStorage overlay.
 */
const ID_RE = /^[a-z0-9-]{1,80}$/;

export function tourStorePlugin(): Plugin {
  const dir = path.resolve(process.cwd(), 'public', 'tours');
  const jsonPath = path.join(dir, 'tours.json');

  const readTours = (): any[] => {
    if (!fs.existsSync(jsonPath)) return [];
    return JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  };
  const writeTours = (tours: any[]) => {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(jsonPath, JSON.stringify(tours, null, 2) + '\n', 'utf8');
  };

  return {
    name: 'skitour-tour-store',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.method !== 'POST' || !req.url?.startsWith('/__tours/')) return next();
        try {
          const body = JSON.parse(await readBody(req));
          if (req.url === '/__tours/save') {
            const { tour, gpxText } = body;
            if (!tour || !ID_RE.test(tour.id)) throw new Error('Invalid tour id');
            if (tour.gpxFile !== `${tour.id}.gpx`) throw new Error('gpxFile must be <id>.gpx');
            const gpxPath = path.join(dir, tour.gpxFile);
            if (gpxText) {
              fs.mkdirSync(dir, { recursive: true });
              fs.writeFileSync(gpxPath, gpxText, 'utf8'); // original file content, unchanged
            } else if (!fs.existsSync(gpxPath)) {
              throw new Error('GPX file missing for this tour');
            }
            const tours = readTours().filter(t => t.id !== tour.id);
            tours.push(tour);
            tours.sort((a, b) => String(a.peakName).localeCompare(String(b.peakName), 'de'));
            writeTours(tours);
          } else if (req.url === '/__tours/delete') {
            const { id } = body;
            if (!ID_RE.test(id)) throw new Error('Invalid tour id');
            writeTours(readTours().filter(t => t.id !== id));
            const gpxPath = path.join(dir, `${id}.gpx`);
            if (fs.existsSync(gpxPath)) fs.unlinkSync(gpxPath);
          } else {
            return next();
          }
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end('{"ok":true}');
        } catch (err) {
          res.statusCode = 400;
          res.end(err instanceof Error ? err.message : String(err));
        }
      });
    }
  };
}

function readBody(req: import('node:http').IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    req.setEncoding('utf8');
    req.on('data', chunk => {
      data += chunk;
      if (data.length > 20_000_000) reject(new Error('Body too large'));
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

