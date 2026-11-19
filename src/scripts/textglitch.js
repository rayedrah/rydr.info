// ASCII wave for headings. Mark an element with data-tglitch.
//
// On load a wave sweeps left to right: each letter builds up through an ASCII
// density ramp ( . : - = + * # ), flickers through a few random glyphs, then
// lands on its real letter. Unresolved characters are grey, so the heading
// "develops" from dark to white like an image coming in.
// On hover a narrower wave passes through the finished word: letters near the
// front dip into random glyphs and settle back.
//
// Every character holds for one 40 ms tick, so it reads as stepped frames, but
// the wave front moves continuously, so the sweep itself is smooth.
// Markup inside the element is kept: only text nodes are split.

const RAMP = ['.', ':', '-', '=', '+', '*', '#'];
const GLYPHS = '#$%&@*+=<>/\\|{}[]?!~^01░▒▓';
const TICK = 40;                   // ms each character is held
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const pick = () => GLYPHS[(Math.random() * GLYPHS.length) | 0];

function split(el) {
  if (el._tg) return el._tg;
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
      span.className = 'tg';
      span.setAttribute('aria-hidden', 'true');
      span.textContent = ch;
      cells.push({ el: span, final: ch, shown: ch, cls: '' });
      frag.appendChild(span);
    }
    node.replaceWith(frag);
  }
  el._tg = { cells, running: false };
  return el._tg;
}

function set(c, ch, cls) {
  if (c.shown !== ch) { c.el.textContent = ch; c.shown = ch; }
  if (c.cls !== cls) { c.el.className = cls ? `tg ${cls}` : 'tg'; c.cls = cls; }
}

// mode 'reveal' (page load) or 'hover'
export function textGlitch(el, mode = 'hover') {
  const st = split(el);
  if (st.running || reduced()) return;
  st.running = true;
  const n = st.cells.length;
  const reveal = mode === 'reveal';
  const speed = reveal ? 34 : 22;                    // ms per character the front advances
  const life = reveal ? RAMP.length + 4 : 5;         // ticks each character spends changing
  const jitter = st.cells.map(() => Math.floor(Math.random() * (reveal ? 3 : 2)));   // ragged front
  const t0 = performance.now();
  let lastTick = -1;

  function frame(now) {
    const t = now - t0;
    const tick = Math.floor(t / TICK);
    if (tick !== lastTick) {                           // characters only change on a tick
      lastTick = tick;
      let busy = false;
      st.cells.forEach((c, i) => {
        const k = tick - Math.floor((i * speed) / TICK) - jitter[i];   // this letter's step
        if (k < 0) { if (reveal) set(c, ' ', 'tg-off'); else set(c, c.final, ''); busy = true; return; }
        if (k >= life) { set(c, c.final, ''); return; }
        busy = true;
        if (reveal && k < RAMP.length) set(c, RAMP[k], 'tg-ramp');
        else set(c, pick(), k === life - 1 ? 'tg-near' : 'tg-rand');
      });
      if (!busy) { st.running = false; return; }
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  return n;
}

export function initTextGlitch(root = document) {
  root.querySelectorAll('[data-tglitch]').forEach((el, i) => {
    split(el);
    setTimeout(() => textGlitch(el, 'reveal'), 80 + i * 90);
    el.addEventListener('mouseenter', () => textGlitch(el, 'hover'));
  });
}
