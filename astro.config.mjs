// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://example.com', // PLACEHOLDER — owner to replace with real domain
  integrations: [sitemap()],
});
