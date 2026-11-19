// Animated pixel favicon: a 16 x 16 pixel-art icon, drawn 2x into a 32 px
// canvas and set as the tab icon.
//
// At rest it is a grey icon on a dark tile with a dotted colour plate printed
// one pixel out of register behind it. Every 1.8-3.5 s it breaks into a short
// burst of held glitch frames, like the icons on the page: rows tear sideways,
// bands flip to the icon's own colour, and the plate jumps further out.
// The tab icon only changes during a burst, so between bursts it costs nothing.
//
// The main site uses the bolt (grey + yellow), Brain Log the brain (grey + pink).
// Map characters: '#' body, '+' fold (darker), '.' empty.

export const ICONS = {
  bolt: {
    color: '#ffdb2e',
    map: [
      '................',
      '........######..',
      '.......######...',
      '......######....',
      '.....######.....',
      '....######......',
      '...###########..',
      '..###########...',
      '.......#####....',
      '......#####.....',
      '.....#####......',
      '....####........',
      '...###..........',
      '..##............',
      '.#..............',
      '................',
    ],
  },
  brain: {
    color: '#ff7db5',
    map: [
      '................',
      '................',
      '.....######.....',
      '...###+##+###...',
      '..##+####+###+..',
      '.###+##+###+###.',
      '.#+###+###+##+#.',
      '.##+##+##+###+#.',
      '.###++###++####.',
      '..##+###+####+..',
      '...####+###++...',
      '.....####+##....',
      '..........###...',
      '...........##...',
      '................',
      '................',
    ],
  },
};

const S = 32;          // canvas size
const P = 2;           // canvas pixels per map pixel
const BG = '#0b0b0b';
const rand = (a, b) => a + Math.random() * (b - a);

// grey for a body pixel: light edge on the top-left, darker toward the bottom,
// folds darker still
function grey(map, x, y) {
  const c = map[y][x];
  if (c === '+') return '#6c6c6c';
  const edge = map[y][x - 1] !== '#' && map[y][x - 1] !== '+' || (map[y - 1] && map[y - 1][x] === '.');
  if (edge) return '#ededed';
  const v = Math.round(0xd2 - y * 4);
  return `rgb(${v},${v},${v})`;
}

function tile(ctx) {
  ctx.clearRect(0, 0, S, S);
  ctx.fillStyle = BG;
  ctx.beginPath();
  ctx.roundRect ? ctx.roundRect(0, 0, S, S, 6) : ctx.rect(0, 0, S, S);
  ctx.fill();
}

// f: a glitch frame, or null for the resting icon
export function drawIcon(ctx, icon, f) {
  const { map, color } = icon;
  tile(ctx);
  const shift = (y) => (f && f.tears[y]) || 0;
  const plate = f ? f.plate : [1, 1];

  // dotted colour plate behind, out of register (one dot per map pixel)
  ctx.fillStyle = color;
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
    if (map[y][x] === '.') continue;
    ctx.fillRect((x + plate[0] + shift(y)) * P, (y + plate[1]) * P, 1, 1);
  }

  // the icon itself
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
    if (map[y][x] === '.') continue;
    const dx = shift(y);
    const hot = f && f.hot[y];
    const inv = f && f.inv && x >= f.inv[0] && x < f.inv[1] && y >= f.inv[2] && y < f.inv[3];
    ctx.fillStyle = inv ? '#1d1d1d' : hot ? color : grey(map, x, y);
    ctx.fillRect((x + dx) * P, y * P, P, P);
    if (!hot && !inv) {                                   // a darker dither dot on each pixel
      ctx.fillStyle = 'rgba(0,0,0,0.22)';
      ctx.fillRect((x + dx) * P + 1, y * P + 1, 1, 1);
    }
  }
}

// one random glitch frame: torn bands, colour bands, a jumped plate, maybe an inverted block
function glitchFrame() {
  const tears = {}, hot = {};
  const bands = 1 + Math.floor(Math.random() * 3);
  for (let b = 0; b < bands; b++) {
    const y0 = Math.floor(rand(0, 15)), h = 1 + Math.floor(rand(0, 4));
    const dx = Math.round(rand(-3, 3)) || 1;
    const isHot = Math.random() < 0.5;
    for (let y = y0; y < Math.min(16, y0 + h); y++) { tears[y] = dx; if (isHot) hot[y] = true; }
  }
  const dirs = [[2, 0], [-2, 0], [0, 2], [0, -2], [2, 2], [-2, -2], [2, -2], [-2, 2]];
  const plate = dirs[Math.floor(Math.random() * dirs.length)];
  let inv = null;
  if (Math.random() < 0.3) {
    const x0 = Math.floor(rand(0, 11)), y0 = Math.floor(rand(0, 12));
    inv = [x0, x0 + 3 + Math.floor(rand(0, 4)), y0, y0 + 2 + Math.floor(rand(0, 3))];
  }
  return { tears, hot, plate, inv };
}

export function initFavicon(kind) {
  const icon = ICONS[kind];
  if (!icon) return;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = S;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // our link replaces the static icons (apple-touch stays)
  document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]').forEach((l) => l.remove());
  const link = document.createElement('link');
  link.rel = 'icon';
  link.type = 'image/png';
  document.head.appendChild(link);
  const show = (f) => { drawIcon(ctx, icon, f); link.href = canvas.toDataURL('image/png'); };

  show(null);
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  (function burst() {
    setTimeout(() => {
      const end = performance.now() + rand(300, 650);
      (function frame() {
        if (performance.now() >= end) { show(null); burst(); return; }
        show(Math.random() < 0.25 ? null : glitchFrame());
        setTimeout(frame, rand(50, 110));
      })();
    }, rand(1800, 3500));
  })();
}
