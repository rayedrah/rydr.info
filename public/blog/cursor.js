// Pixel lightning-bolt cursor. Replaces the system cursor on mouse devices:
// the bolt's top-left tip is the hotspot, it follows the pointer exactly, and
// it turns white over clickable things so it stays visible on lime links.
// On touch devices nothing changes.

const INTERACTIVE = 'a, button, [role="button"], input, textarea, select, label, summary';

// 7 x 8 bolt with its thin one-pixel tip at the top-left: that tip is the hotspot,
// so it points like a normal arrow cursor
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

function boltSvg() {
  const rects = [];
  BOLT.forEach((row, y) => [...row].forEach((c, x) => {
    if (c === '#') rects.push(`<rect x="${x}" y="${y}" width="1" height="1"/>`);
  }));
  const w = BOLT[0].length, h = BOLT.length;
  return `<svg width="${w * PX}" height="${h * PX}" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges">${rects.join('')}</svg>`;
}

export function initCursor() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const bolt = document.createElement('div');
  bolt.className = 'cursor-bolt';
  bolt.setAttribute('aria-hidden', 'true');
  bolt.innerHTML = boltSvg();
  document.body.appendChild(bolt);
  document.documentElement.classList.add('bolt-cursor');   // hides the system cursor (site.css)

  document.addEventListener('mousemove', (e) => {
    bolt.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
    bolt.classList.add('active');
  });
  document.documentElement.addEventListener('mouseleave', () => bolt.classList.remove('active'));
  document.addEventListener('mouseover', (e) => {
    bolt.classList.toggle('over-link', !!e.target.closest?.(INTERACTIVE));
  });
}
