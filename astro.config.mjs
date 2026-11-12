// @ts-check
import { defineConfig } from 'astro/config';

// Static output — Cloudflare Pages serves the `dist/` directory directly.
// No adapter is needed: the whole site is prerendered HTML + CSS.
export default defineConfig({
  site: 'https://cloudlorica.uk',
  build: {
    format: 'directory',
  },
  devToolbar: {
    enabled: false,
  },
});
