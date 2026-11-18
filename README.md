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
- `src/styles/site.css` page, component and intro styles; `contact-popup.css` the contact windows
- `src/scripts/` grain shader, home intro (grain-textured name), heading scramble, pixel bolt cursor,
  hover pixel art, terminal, contact popup
- `src/data/` site content (`site.js`) and the pixel-art pieces (`ascii-art.js`)
- `public/` copied as is: `icon/`, `fonts/`, `resume.pdf`, `CNAME`, and the built blog

## Blog

Brain Log lives at [rydr.info/blog](https://rydr.info/blog). Notes come from Obsidian, the generator is in `brainlog/`, and the built pages are in `public/blog/`. See `brainlog/README.md` for how to publish. The blog reuses the site's grain and cursor: `build.py` copies `src/scripts/grain.js` and `cursor.js` into the build, so rebuild the blog after changing either.

## Scramble a heading

Add `data-scramble` to any element: its letters decode on load and re-scramble on hover.
