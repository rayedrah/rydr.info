# rydr.info
websitee !!

Built with [Astro](https://astro.build) and deployed to GitHub Pages by `.github/workflows/deploy.yml` on every push to `main`.

## Run it locally

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static site in dist/
```

## Layout

- `src/pages/` one `.astro` file per page (`about.astro` builds to `about.html`, so old links still work)
- `src/layouts/Base.astro` shared head, nav, footer
- `src/styles/site.css` page, component and intro styles
- `src/scripts/` grain shader (`grain.js`), home intro (`intro.js`), dithered 3D icons (`objects.js`),
  ASCII heading wave (`textglitch.js`), UI sounds (`sfx.js`), pixel bolt cursor, terminal (`site.js`)
- `src/data/site.js` all site content: links, projects, experience, education, certifications, skills
- `public/` copied as is: `icon/`, `fonts/`, `resume.pdf`, `CNAME`, and the built blog

## Blog

Brain Log lives at [rydr.info/blog](https://rydr.info/blog). Notes come from Obsidian, the generator is in `brainlog/`, and the built pages are in `public/blog/`. See `brainlog/README.md` for how to publish. The blog reuses the site's scripts: `build.py` copies `grain.js`, `cursor.js`, `sfx.js`, `objects.js` and `textglitch.js` from `src/scripts/` into the build, so rebuild the blog after changing any of them.

## Heading effect

Add `data-tglitch` to any heading: it builds up through an ASCII density ramp on load and replays a quick wave on hover.

## 3D icons

`<canvas data-object="bolt">` (bolt, brain, computer, lock, key, flag, server, keysword, router, ...) draws a dithered, spinning object. The shapes are in `src/scripts/objects.js` (`SHAPES`). Put it inside an element with `data-object-host` and the links in that element trigger its glitch on hover.

## Resume

Replace `public/resume.pdf`, then change the `?v=` date on `resume` in `src/data/site.js` so browsers don't show a cached copy.
