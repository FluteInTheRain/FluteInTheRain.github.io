import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // SITE_URL and BASE_PATH are injected by Docker / CI; defaults keep local dev working without env vars.
  site: process.env.SITE_URL || 'https://www.example.com',
  base: process.env.BASE_PATH || '/',
  vite: {
    plugins: [tailwindcss()],
  },
  output: 'static',
  compressHTML: true, 
  // 'attribute' scopes component styles via data-astro-* attributes instead of mangled class names,
  // which is more predictable when targeting elements from global CSS or JavaScript.
  scopedStyleStrategy: 'attribute',
});
