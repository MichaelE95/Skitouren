import type { Plugin } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';

/**
 * Dev-only tour store (Q11). While `npm run dev` is running, the app saves tours
 * straight into public/tours/ (GPX file + tours.json), so adding a tour = git commit.
 * "Push to GitHub" commits ONLY public/tours/ and pushes, which triggers the Pages deploy.
 * Not part of the production build; the hosted site falls back to a localStorage overlay.
 */
const ID_RE = /^[a-z0-9-]{1,80}$/;
const TOURS_PATH = 'public/tours';

function git(args: string[], cwd: string): Promise<{ code: number; out: string }> {
  return new Promise(resolve => {
    execFile('git', args, { cwd, windowsHide: true, timeout: 120000 }, (err, stdout, stderr) => {
      const code = err ? (typeof (err as any).code === 'number' ? (err as any).code : 1) : 0;
      resolve({ code, out: `${stdout}${stderr}`.trim() });
    });
  });
}

async function repoStatus(cwd: string) {
  const changes = await git(['status', '--porcelain', '--', TOURS_PATH], cwd);
  const ahead = await git(['rev-list', '--count', '@{u}..HEAD'], cwd);
  return {
    uncommitted: changes.out.split('\n').filter(Boolean).length,
    unpushed: ahead.code === 0 ? parseInt(ahead.out, 10) || 0 : 0,
    hasUpstream: ahead.code === 0
  };
}

export function tourStorePlugin(): Plugin {
  const root = process.cwd();
  const dir = path.resolve(root, 'public', 'tours');
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
        if (!req.url?.startsWith('/__tours/')) return next();
        const sendJson = (status: number, data: unknown) => {
          res.statusCode = status;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
        };
        if (req.method === 'GET' && req.url === '/__tours/status') {
          try {
            return sendJson(200, await repoStatus(root));
          } catch (err) {
            return sendJson(500, { error: String(err) });
          }
        }
        if (req.method !== 'POST') return next();
        if (req.url === '/__tours/publish') {
          const log: string[] = [];
          const add = await git(['add', '-A', '--', TOURS_PATH], root);
          log.push(add.out);
          if (add.code !== 0) return sendJson(500, { error: 'git add failed', output: log.join('\n') });
          const staged = await git(['diff', '--cached', '--quiet', '--', TOURS_PATH], root);
          let committed = false;
          if (staged.code !== 0) {
            const date = new Date().toISOString().slice(0, 16).replace('T', ' ');
            const commit = await git(['commit', '-m', `Update tours (${date})`, '--', TOURS_PATH], root);
            log.push(commit.out);
            if (commit.code !== 0) return sendJson(500, { error: 'git commit failed', output: log.join('\n') });
            committed = true;
          }
          const status = await repoStatus(root);
          let pushed = false;
          if (status.unpushed > 0 || !status.hasUpstream) {
            const push = await git(status.hasUpstream ? ['push'] : ['push', '-u', 'origin', 'HEAD'], root);
            log.push(push.out);
            if (push.code !== 0) return sendJson(500, { error: 'git push failed', output: log.join('\n') });
            pushed = true;
          }
          return sendJson(200, { committed, pushed, output: log.filter(Boolean).join('\n') });
        }
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

