// Decode-style text scramble for headings.
// Mark an element with data-scramble. On load its letters cycle through random
// glyphs and lock in one by one; hovering it re-runs a quicker, staggered pass.
// Markup inside the element (spans, <br>) is kept: only text nodes are split.

export const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*+=-_/\\<>[]{};:░▒▓';
export const pick = () => GLYPHS[(Math.random() * GLYPHS.length) | 0];
export const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function split(el) {
  if (el._scramble) return el._scramble;
  if (!el.hasAttribute('aria-label')) el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());

  const cells = [];
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);

  for (const node of nodes) {
    const frag = document.createDocumentFragment();
    for (const ch of node.textContent) {
      if (/\s/.test(ch)) { frag.appendChild(document.createTextNode(ch)); continue; }
      const span = document.createElement('span');
      span.className = 'sc';
      span.setAttribute('aria-hidden', 'true');
      span.textContent = ch;
      cells.push({ el: span, final: ch });
      frag.appendChild(span);
    }
    node.replaceWith(frag);
  }
  el._scramble = { cells, running: false };
  return el._scramble;
}

// mode 'reveal': start blank, each letter waits a random delay then cycles.
// mode 'hover': letters stay visible, cycle in a left-to-right stagger.
export function scramble(el, mode = 'reveal') {
  const state = split(el);
  if (state.running || reduced()) return Promise.resolve();
  state.running = true;

  const step = mode === 'reveal' ? 70 : 40;          // ms per glyph change
  const frames = mode === 'reveal' ? 10 : 14;         // glyph changes per letter
  const n = state.cells.length;
  const plan = state.cells.map((c, i) => ({
    c,
    start: mode === 'reveal' ? Math.random() * 900 : Math.random() * 250 + i * 22,
    done: false,
  }));

  if (mode === 'reveal') plan.forEach((p) => { p.c.el.textContent = ' '; });

  return new Promise((resolve) => {
    const t0 = performance.now();
    let left = n;
    function tick(now) {
      const t = now - t0;
      for (const p of plan) {
        if (p.done || t < p.start) continue;
        const k = Math.floor((t - p.start) / step);
        if (k >= frames) {
          p.c.el.textContent = p.c.final;
          p.c.el.classList.remove('flip');
          p.done = true;
          left--;
        } else {
          p.c.el.textContent = pick();
          p.c.el.classList.add('flip');
        }
      }
      if (left > 0) requestAnimationFrame(tick);
      else { state.running = false; resolve(); }
    }
    requestAnimationFrame(tick);
  });
}

export function initScramble(root = document) {
  root.querySelectorAll('[data-scramble]').forEach((el) => {
    if (el.dataset.scramble !== 'manual') scramble(el, 'reveal');
    el.addEventListener('mouseenter', () => scramble(el, 'hover'));
  });
}
