// Text pixel art that scrambles into the next piece when the cursor goes over it
// (or on tap, since phones have no hover). Pieces live in data/ascii-art.js.
//
// Markup: <pre data-ascii-art></pre>

import { PIECES } from '../data/ascii-art.js';
import { pick, reduced } from './scramble.js';

const STEP = 40;     // ms per glyph change, same as the heading hover scramble
const FRAMES = 12;   // glyph changes per cell

// '[ab]c' -> [{ ch: 'a', hot: true }, { ch: 'b', hot: true }, { ch: 'c', hot: false }]
function parse(piece) {
  const rows = piece.art.map((line) => {
    const cells = [];
    let hot = false;
    for (const ch of line) {
      if (ch === '[') { hot = true; continue; }
      if (ch === ']') { hot = false; continue; }
      cells.push({ ch, hot });
    }
    return cells;
  });
  return rows;
}

export function initAsciiArt() {
  document.querySelectorAll('[data-ascii-art]').forEach(mount);
}

function mount(pre) {
  const pieces = PIECES.map(parse);
  const width = Math.max(...pieces.flat().map((r) => r.length));
  const height = Math.max(...pieces.map((p) => p.length));
  const at = (p, y, x) => p[y]?.[x] ?? { ch: ' ', hot: false };

  // one span per cell, built once
  const grid = [];
  pre.textContent = '';
  for (let y = 0; y < height; y++) {
    const row = [];
    for (let x = 0; x < width; x++) {
      const span = document.createElement('span');
      pre.appendChild(span);
      row.push(span);
    }
    grid.push(row);
    if (y < height - 1) pre.appendChild(document.createTextNode('\n'));
  }

  const paint = (span, cell) => {
    span.textContent = cell.ch;
    span.className = cell.hot ? 'hot' : '';
  };

  let index = 0;
  let running = false;

  function show(i) {
    index = i;
    pre.setAttribute('aria-label', `pixel art: ${PIECES[i].name}`);
  }

  // scramble every cell that is filled in either piece, then land on the new one
  function morph(next, fromBlank = false) {
    if (running) return;
    const target = pieces[next];
    const current = fromBlank ? [] : pieces[index];
    show(next);
    if (reduced()) {
      grid.forEach((row, y) => row.forEach((s, x) => paint(s, at(target, y, x))));
      return;
    }
    running = true;
    const plan = [];
    grid.forEach((row, y) => row.forEach((span, x) => {
      const to = at(target, y, x);
      const from = at(current, y, x);
      if (to.ch === ' ' && from.ch === ' ') { paint(span, to); return; }
      plan.push({ span, to, start: Math.random() * 220 + x * 14, done: false });
    }));
    const t0 = performance.now();
    let left = plan.length;
    function tick(now) {
      const t = now - t0;
      for (const p of plan) {
        if (p.done || t < p.start) continue;
        if (Math.floor((t - p.start) / STEP) >= FRAMES) {
          paint(p.span, p.to);
          p.done = true;
          left--;
        } else {
          p.span.textContent = pick();
          p.span.className = 'flip';
        }
      }
      if (left > 0) requestAnimationFrame(tick);
      else running = false;
    }
    requestAnimationFrame(tick);
  }

  const advance = () => morph((index + 1) % pieces.length);
  pre.addEventListener('mouseenter', advance);
  pre.addEventListener('click', advance);

  morph(0, true);   // decode in on load, like the headings
}
