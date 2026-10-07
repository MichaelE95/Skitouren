import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { tourStorePlugin } from './vite-plugin-tour-store';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tourStorePlugin()],
  base: './', // Ensures assets load cleanly on GitHub Pages subpaths
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'maplibre': ['maplibre-gl'],
          'vendor': ['react', 'react-dom']
        }
      }
    }
  },
  server: {
    port: 3000,
    open: true,
    watch: {
      // Tour files are written by the dev plugin; the app reloads them itself
      ignored: ['**/public/tours/**']
    }
  }
});
