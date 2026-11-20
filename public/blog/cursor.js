// Pixel lightning-bolt cursor, as a real CSS cursor image.
// The browser draws it like any system cursor, so it never lags behind the
// mouse (the old version moved a page element on every mousemove, which always
// trailed the pointer by a frame or more). Lime normally, white over links and
// buttons, with a dark 1px edge so it stays visible on light grain.
// The top-left tip is the hotspot. Touch devices keep their default.

const BOLT = [
  '#......',
  '.##....',
  '..###..',
  '...###.',
  '.######',
  '..###..',
  '...###.',
  '....###',
];
const PX = 2;   // css px per pixel

function cursorUrl(fill) {
  const rects = (color, off) => BOLT.flatMap((row, y) => [...row].map((c, x) => (c === '#'
    ? `<rect x='${x * PX + off}' y='${y * PX + off}' width='${PX}' height='${PX}' fill='${color}'/>` : ''))).join('');
  const w = BOLT[0].length * PX + 1, h = BOLT.length * PX + 1;
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' shape-rendering='crispEdges'>`
    + rects('rgba(0,0,0,0.85)', 1) + rects(fill, 0) + '</svg>';
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") 0 0`;
}

export function initCursor() {
  if (document.getElementById('bolt-cursor')) return;
  const INTERACTIVE = ':is(a, button, [role="button"], summary, label, select)';
  const style = document.createElement('style');
  style.id = 'bolt-cursor';
  style.textContent = `@media (hover: hover) and (pointer: fine) {
  html, html * { cursor: ${cursorUrl('#a5ff3f')}, auto !important; }
  ${INTERACTIVE}, ${INTERACTIVE} * { cursor: ${cursorUrl('#fafafa')}, pointer !important; }
}`;
  document.head.appendChild(style);
}
