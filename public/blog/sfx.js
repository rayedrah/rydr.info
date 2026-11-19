// UI sounds, synthesised with Web Audio (no files to load).
//
//   glitchSound  one bit-crushed digital tick per glitch frame of an icon,
//                started on the same animation frame the glitch is drawn, and
//                shorter than the frame is held. Its pitch steps randomly like
//                the frame's tear, and the tear direction sets the register.
//   navSound     a fixed two-step tick when a nav link is hovered.
//   clickSound   a crisp glitch click for every link and button on the site.
//
// Everything runs through one compressor so the level stays even.
// Browsers only allow sound after the visitor's first click, tap or key
// press on the page, so hover sounds start after that.

let ctx = null;
let out = null;
let crush = null;
let noise = null;
let unlocked = false;

// the visitor's choice, kept across pages and visits
const KEY = 'rydr-sfx';
let muted = false;
try { muted = localStorage.getItem(KEY) === 'off'; } catch {}

function audio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -24;
    comp.ratio.value = 4;
    out = ctx.createGain();
    out.gain.value = 0.9;
    out.connect(comp).connect(ctx.destination);

    // bit crusher: squashes every sound onto 8 levels, the "digital" grit
    crush = ctx.createWaveShaper();
    const curve = new Float32Array(1024);
    for (let i = 0; i < curve.length; i++) {
      const x = (i / (curve.length - 1)) * 2 - 1;
      curve[i] = Math.round(x * 4) / 4;
    }
    crush.curve = curve;
    const hp = ctx.createBiquadFilter();   // keep it light: no low rumble
    hp.type = 'highpass';
    hp.frequency.value = 220;
    crush.connect(hp).connect(out);

    noise = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.2), ctx.sampleRate);
    const d = noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

const ready = () => !muted && unlocked && audio();

// gain envelope: 2 ms attack, flat, then a fast fall to silence at t + dur
function env(t, dur, peak) {
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + 0.002);
  g.gain.setValueAtTime(peak, t + dur * 0.55);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  return g;
}

// square wave that jumps between the given pitches, like a corrupted signal
function steps(t, dur, freqs, peak, dest = crush) {
  const o = ctx.createOscillator();
  o.type = 'square';
  freqs.forEach((f, k) => o.frequency.setValueAtTime(f, t + (k * dur) / freqs.length));
  o.connect(env(t, dur, peak)).connect(dest);
  o.start(t);
  o.stop(t + dur + 0.01);
}

// a burst of band-passed noise
function grit(t, dur, peak, freq, q = 1.5) {
  const s = ctx.createBufferSource();
  s.buffer = noise;
  const f = ctx.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.value = freq;
  f.Q.value = q;
  s.connect(f).connect(env(t, dur, peak)).connect(crush);
  s.start(t, Math.random() * 0.1, dur + 0.01);
}

const pick = (a, b) => a + Math.random() * (b - a);

// g: glitch strength 0..1, holdMs: how long the frame stays up, dir: tear direction
export function glitchSound(g, holdMs, dir) {
  if (!ready()) return;
  const t = ctx.currentTime;
  const dur = Math.min(0.055, Math.max(0.022, (holdMs / 1000) * 0.55));
  // sideways tears sit in the middle, up/down higher, diagonals lower
  const base = dir[0] && dir[1] ? 380 : dir[1] ? 1100 : 640;
  const n = 3 + Math.floor(Math.random() * 3);
  steps(t, dur, Array.from({ length: n }, () => base * pick(0.6, 2.2)), 0.05 + 0.05 * g);
  grit(t, dur * 0.8, 0.08 + 0.08 * g, pick(2500, 7000));
}

export function navSound() {
  if (!ready()) return;
  const t = ctx.currentTime;
  steps(t, 0.03, [1500, 900, 1250], 0.05);
  grit(t, 0.02, 0.07, 5200);
}

export function clickSound() {
  if (!ready()) return;
  const t = ctx.currentTime;
  grit(t, 0.008, 0.22, 3800, 0.8);                 // the click itself
  steps(t + 0.002, 0.04, [260, 150, 90], 0.08);    // body, dropping
  steps(t + 0.03, 0.012, [1900], 0.04);            // stutter: the signal tries to re-sync
  steps(t + 0.047, 0.01, [2400], 0.03);
  grit(t + 0.03, 0.025, 0.06, 6500);
}

const CLICKABLE = 'a[href], button, summary, [role="button"], input[type="submit"]';

// sfx:on / sfx:off buttons in the header. Turning sound on plays one click so
// you hear that it works; turning it off is silent.
function initToggle() {
  const btns = document.querySelectorAll('[data-sfx-toggle]');
  const show = () => btns.forEach((b) => {
    b.textContent = muted ? 'sfx:off' : 'sfx:on';
    b.setAttribute('aria-pressed', String(!muted));
  });
  show();
  btns.forEach((b) => b.addEventListener('click', () => {
    muted = !muted;
    try { localStorage.setItem(KEY, muted ? 'off' : 'on'); } catch {}
    show();
    if (!muted) { unlocked = true; clickSound(); }
  }));
}

export function initSfx() {
  initToggle();
  const unlock = () => { unlocked = true; audio(); };
  for (const ev of ['pointerdown', 'keydown', 'touchstart']) window.addEventListener(ev, unlock, { passive: true, capture: true });

  // nav links: hover tick
  document.querySelectorAll('.site-nav a, .mark, .navlinks a, .brand').forEach((a) => a.addEventListener('mouseenter', navSound));

  // every link and button: click sound; same-tab page changes wait a beat so it is heard
  document.addEventListener('click', (e) => {
    const el = e.target.closest?.(CLICKABLE);
    if (!el || el.hasAttribute('data-sfx-toggle')) return;
    unlock();
    clickSound();
    if (el.dataset.focus) { document.getElementById(el.dataset.focus)?.focus(); return; }
    if (el.tagName !== 'A' || e.defaultPrevented) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    if (el.target && el.target !== '_self') return;
    const href = el.getAttribute('href');
    if (!href || href.startsWith('#') || /^(mailto|tel|javascript):/i.test(href)) return;
    const url = new URL(href, location.href);
    if (url.origin !== location.origin) return;
    if (url.pathname === location.pathname && url.hash) return;   // same-page jump
    e.preventDefault();
    setTimeout(() => { location.href = url.href; }, 90);
  });
}
