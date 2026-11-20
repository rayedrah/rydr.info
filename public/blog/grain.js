// Smoke-grain background.
//
// How it works:
//  1. A smooth gradient-noise field drifts slowly across the screen.
//  2. It is domain-warped (sampled at coordinates bent by itself twice),
//     which folds plain noise into curling smoke.
//  3. Every pixel reads the smoke from its own small random offset. Most
//     offsets are tiny, a few are large, so smoke edges dissolve into speckle.
//     Offsets grow toward the screen edges so the corners are mostly grain.
//  4. Each pixel's offset slowly orbits at its own speed ("boil"), so the grain
//     churns gently instead of flickering.
//  5. A steep contrast curve keeps most of the screen near-black with thin,
//     bright grey wisps.
//  6. The smoke streams in from the left and right edges toward the middle
//     (inflow), instead of drifting diagonally across.

export const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

// shared with intro.js: uniforms, tuning constants and the smoke noise
export const GRAIN_LIB = `
precision highp float;

uniform vec2  uRes;     // drawing-buffer size in device pixels
uniform float uTime;    // seconds
uniform float uSeed;    // picks a region of the infinite noise field
uniform float uGain;    // auto-exposure so the screen is never empty or blown out
uniform float uPx;      // device pixel ratio

const float TAU       = 6.28318530718;
const float ZOOM      = 0.8;    // smoke feature size (higher = smaller shapes)
const float DRIFT     = 0.065;  // how fast the smoke travels
const float FOLD      = 3.5;    // warp strength
const float JITTER    = 0.35;   // max per-pixel sample offset
const float EDGE_JIT  = 0.3;    // extra offset toward the corners
const float SPECK     = 1.5;    // speck size in device pixels
const float CHURN     = 0.3;    // orbit speed of each speck's offset
const float CONTRAST  = 6.0;    // higher = darker field, thinner wisps
const vec3  FLOOR_COL = vec3(0.03);
const vec3  PEAK_COL  = vec3(0.22);

// sine-free 2D -> 2D hash, stable for large inputs
vec2 rnd2(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  q += dot(q, q.yzx + 33.33);
  return fract((q.xx + q.yz) * q.zy);
}

// gradient noise with random unit gradients, roughly in [-1, 1]
float gnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = p - i;
  vec2 s = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);   // quintic fade

  vec2 g00 = vec2(cos(TAU * rnd2(i).x),               sin(TAU * rnd2(i).x));
  vec2 g10 = vec2(cos(TAU * rnd2(i + vec2(1, 0)).x),  sin(TAU * rnd2(i + vec2(1, 0)).x));
  vec2 g01 = vec2(cos(TAU * rnd2(i + vec2(0, 1)).x),  sin(TAU * rnd2(i + vec2(0, 1)).x));
  vec2 g11 = vec2(cos(TAU * rnd2(i + vec2(1, 1)).x),  sin(TAU * rnd2(i + vec2(1, 1)).x));

  float a = dot(g00, f);
  float b = dot(g10, f - vec2(1, 0));
  float c = dot(g01, f - vec2(0, 1));
  float d = dot(g11, f - vec2(1, 1));
  return 1.414 * mix(mix(a, b, s.x), mix(c, d, s.x), s.y);
}

// two soft octaves with a slow upward drift, mapped to [0, 1]
// (the main motion, streaming in from the sides, comes from inflow() below)
float layer(vec2 p) {
  p += uTime * DRIFT * vec2(0.0, -0.35);
  float v = 0.7 * gnoise(p) + 0.3 * gnoise(p * 2.03 + 11.7);
  return clamp(0.5 + 0.75 * v, 0.0, 1.0);
}

float smoke(vec2 p) {
  vec2 a = vec2(layer(p), layer(p + vec2(5.2, 1.3)));
  vec2 b = vec2(layer(p + FOLD * a + vec2(1.7, 9.2)),
                layer(p + FOLD * a + vec2(8.3, 2.8)));
  return layer(p + b);
}

// Smoke streaming in from both sides of the screen toward the centre line.
// c is the centred position, off the seed and per-speck offsets, pick a random
// 0..1 per speck. Each half reads the field by distance from the centre plus
// time, so its shapes travel inward. The halves read different parts of the
// field; near the centre each speck randomly takes one side or the other, so
// they dissolve into each other as grain. The smoke is sampled once per pixel,
// the same cost as a plain drift.
const float FLOW = 0.075;   // inward speed
const float SEAM = 0.18;    // width of the dissolve between the two sides
float inflow(vec2 c, vec2 off, float pick) {
  float right = step(pick, smoothstep(-SEAM, SEAM, c.x));
  return smoke(vec2(abs(c.x) + uTime * FLOW, c.y) + off + vec2(0.0, 37.0) * right);
}

`;

const FRAG = GRAIN_LIB + `
void main() {
  vec2 uv = gl_FragCoord.xy / uRes;

  // wide aspect, squashed vertically so the folds run long and horizontal
  vec2 c = (uv - 0.5) * vec2(uRes.x / uRes.y, 2.0) * ZOOM;
  vec2 p = (rnd2(vec2(uSeed, 17.0)) - 0.5) * 200.0;

  float edge = smoothstep(0.2, 1.0, length((uv - 0.5) * 1.6));

  // per-speck random offset, biased small so only a few stray far
  vec2 cell = floor(gl_FragCoord.xy / SPECK);
  vec2 r = rnd2(cell);
  float reach = JITTER * pow(r.x, 1.5) + EDGE_JIT * edge * r.x;
  float orbit = CHURN * (2.0 * rnd2(cell + 71.3).x - 1.0);
  float ang = TAU * r.y + uTime * orbit;
  p += reach * vec2(cos(ang), sin(ang));

  float n = inflow(c, p, rnd2(cell + 5.3).x);
  n = smoothstep(0.0, 1.0, pow(clamp(n * 1.1 * uGain, 0.0, 1.0), CONTRAST));
  n *= 1.0 - 0.5 * edge;

  gl_FragColor = vec4(mix(FLOOR_COL, PEAK_COL, n), 1.0);
}
`;

export function compile(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.warn('grain shader:', gl.getShaderInfoLog(s));
    return null;
  }
  return s;
}

export const STORE = 'rydr-smoke';

export function initGrain() {
  if (document.getElementById('grain')) return;
  const canvas = document.createElement('canvas');
  canvas.id = 'grain';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);

  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, preserveDrawingBuffer: false });
  if (!gl) return; // the CSS background colour is the fallback

  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return;
  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  gl.useProgram(prog);

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const U = {};
  for (const n of ['uRes', 'uTime', 'uSeed', 'uGain', 'uPx']) U[n] = gl.getUniformLocation(prog, n);

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  gl.uniform1f(U.uPx, dpr);

  // keep the same smoke while moving between pages in one visit
  let visit = null;
  try { visit = JSON.parse(sessionStorage.getItem(STORE)); } catch {}
  const t0 = Number.isFinite(visit?.start) ? visit.start : Date.now();
  const time = () => (Date.now() - t0) / 1000;

  // ---- coverage probe: render a tiny 64 x h copy and measure how much smoke is visible ----
  const PW = 64;
  let probe = null;
  function makeProbe() {
    const ph = Math.max(4, Math.round(PW * window.innerHeight / window.innerWidth));
    if (probe && probe.h === ph) return probe;
    if (probe) { gl.deleteFramebuffer(probe.fb); gl.deleteTexture(probe.tex); }
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, PW, ph, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    probe = { h: ph, fb, tex, px: new Uint8Array(PW * ph * 4) };
    return probe;
  }
  // share of 4x4 blocks whose brightness is clearly above the floor
  function coverage() {
    const pr = makeProbe();
    gl.bindFramebuffer(gl.FRAMEBUFFER, pr.fb);
    gl.viewport(0, 0, PW, pr.h);
    gl.uniform2f(U.uRes, PW, pr.h);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.readPixels(0, 0, PW, pr.h, gl.RGBA, gl.UNSIGNED_BYTE, pr.px);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(U.uRes, canvas.width, canvas.height);
    const limit = 0.04 * 255 * 16;
    let lit = 0, total = 0;
    for (let y = 0; y + 4 <= pr.h; y += 4) {
      for (let x = 0; x + 4 <= PW; x += 4) {
        let sum = 0;
        for (let j = y; j < y + 4; j++) for (let i = x; i < x + 4; i++) sum += pr.px[4 * (PW * j + i)];
        if (sum > limit) lit++;
        total++;
      }
    }
    return lit / total;
  }

  const LOW = 0.3, HIGH = 0.55;
  let gain = 1, targetGain = 1;
  function nudge(c, step) {
    if (c > HIGH) targetGain -= Math.min(step, 0.5 * (c - HIGH));
    else if (c < LOW) targetGain += Math.min(step, 0.5 * (LOW - c));
    targetGain = Math.min(1.1, Math.max(0.7, targetGain));
  }

  // sized from the canvas's own box: CSS gives it 100lvh, which does not change
  // when a phone's URL bar slides in and out, so the buffer is not reallocated
  // (and the screen does not flicker) on every scroll
  function resize() {
    const w = Math.round((canvas.clientWidth || window.innerWidth) * dpr);
    const h = Math.round((canvas.clientHeight || window.innerHeight) * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
      gl.uniform2f(U.uRes, w, h);
    }
  }
  resize();
  window.addEventListener('resize', resize);

  gl.uniform1f(U.uTime, time());
  gl.uniform1f(U.uGain, 1);

  // Every coverage() reads pixels back from the GPU, which stalls it, so keep
  // them few: the seed and exposure are found once per visit and remembered
  // across pages, and while running the exposure is re-checked every 2.5 s.
  // pick a seed: reuse this visit's, or try a few and keep one with a pleasant amount of smoke
  let seed = Number.isFinite(visit?.seed) ? visit.seed : null;
  const save = () => { try { sessionStorage.setItem(STORE, JSON.stringify({ seed, start: t0, gain: targetGain })); } catch {} };
  if (seed === null) {
    let best = { seed: 0, miss: Infinity };
    for (let k = 0; k < 4; k++) {
      const s = Math.floor(Math.random() * 10000);
      gl.uniform1f(U.uSeed, s);
      const c = coverage();
      if (c >= LOW && c <= HIGH) { best = { seed: s, miss: 0 }; break; }
      const miss = Math.abs(c - (LOW + HIGH) / 2);
      if (miss < best.miss) best = { seed: s, miss };
    }
    seed = best.seed;
  }
  gl.uniform1f(U.uSeed, seed);
  if (Number.isFinite(visit?.gain)) targetGain = visit.gain;
  else for (let k = 0; k < 3; k++) { gl.uniform1f(U.uGain, targetGain); nudge(coverage(), 0.1); }
  gain = targetGain;
  save();

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let raf = 0;
  let lastProbe = Date.now();   // the startup checks just ran: the next one is due in 2.5 s

  function frame() {
    resize();
    const now = Date.now();
    gl.uniform1f(U.uTime, time());
    if (now - lastProbe > 2500) { gl.uniform1f(U.uGain, gain); nudge(coverage(), 0.05); lastProbe = now; save(); }
    gain += 0.05 * (targetGain - gain);
    gl.uniform1f(U.uGain, gain);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function loop() {
    frame();
    raf = requestAnimationFrame(loop);
  }

  if (reduced) {
    frame();
    window.addEventListener('resize', frame);
    return;
  }
  document.addEventListener('visibilitychange', () => {
    cancelAnimationFrame(raf);
    if (!document.hidden) raf = requestAnimationFrame(loop);
  });
  raf = requestAnimationFrame(loop);
}
