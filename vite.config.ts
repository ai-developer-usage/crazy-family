import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base ('./') keeps asset URLs working whether the site is served
// from a domain root or a GitHub Pages project subpath (e.g. /crazy-family/).
// Combined with HashRouter, this needs no server-side rewrite rules.
export default defineConfig({
  base: './',
  plugins: [react()],
});
