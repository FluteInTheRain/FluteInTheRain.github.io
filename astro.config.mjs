import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://fluteintherain.github.io',
  base: '/',
  redirects: {
    '/blog/go-fundamentals-toolchain-modules-packages-types/': '/blog/go-first-program-modules-packages/',
    '/blog/go-fundamentals-composite-types-structs-methods-interfaces/': '/blog/go-structs-methods-interfaces/',
    '/blog/go-fundamentals-errors-concurrency-goroutines-channels-testing/': '/blog/go-goroutines-channels-select/',
  },
  integrations: [mdx(), react(), sitemap()],
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light-high-contrast', dark: 'github-dark' },
      defaultColor: false,
      wrap: true,
    },
  },
});
