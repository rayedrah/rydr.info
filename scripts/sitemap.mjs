// Writes dist/sitemap.xml after `astro build`: every real page of the site and
// the Brain Log (which is copied in from public/blog). Search engines read it
// to find all pages, not just the ones linked from the home page.
// Runs as part of `npm run build` (see package.json), so it is always current.
import { readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const SITE = 'https://rydr.info';
const DIST = 'dist';
const SKIP = new Set(['404.html', 'blog/404.html']);

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith('.html') ? [p] : [];
  });
}

const urls = walk(DIST)
  .map((p) => relative(DIST, p).split(sep).join('/'))
  .filter((p) => !SKIP.has(p) && !/^(banner|og-card|gallery|sounds|bolttest|grainbg)/.test(p))
  .map((p) => (p === 'index.html' ? '/' : p.endsWith('/index.html') ? '/' + p.slice(0, -'index.html'.length) : '/' + p))
  .sort((a, b) => a.split('/').length - b.split('/').length || a.localeCompare(b));

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${SITE}${u}</loc></url>`).join('\n')}
</urlset>
`;
writeFileSync(join(DIST, 'sitemap.xml'), xml);
console.log(`sitemap.xml: ${urls.length} pages`);
