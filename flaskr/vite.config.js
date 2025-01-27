import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: './static',                       // Specify the root directory for Vite
  build: {
    outDir: './dist',          // Output directory for bundled files
    emptyOutDir: true,               // Clear the output directory before bundling
    rollupOptions: {
      input: {
        main: resolve(__dirname, './static/src/main.js'),  // Main entry point
      }
    },
    manifest: true,
  },
  server: {
    host: '0.0.0.0', // Allow connections from outside the container
    watch: {
      usePolling: true, // Needed for changes to be detected inside Docker
    },
  },
});
