// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://rydr.info',
  // emit about.html, projects.html, ... so every existing link and bookmark keeps working
  build: { format: 'file' },
  // keep the spaces between words and inline links in multi-line paragraphs
  compressHTML: false,
  devToolbar: { enabled: false },
});
