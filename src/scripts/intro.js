// Home intro, copied from the live rydr.info intro: the prompt types `whoami`,
// then the name pops up (fades in while rising 10px, same timing as live).
// The letters are densely packed grey grain with a halo of lime grain around
// them. Both are the background grain itself (same shader, smoke, seed and
// clock from grain.js), drawn only inside the letters / the halo.
// The typing plays once per visit; after that the name pops up straight away.

import { VERT, GRAIN_LIB, STORE, compile } from './grain.js';

const KEY = 'rydr-intro-seen';
const BLUR = 0.16;   // halo size as a fraction of the font size

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const FRAG = GRAIN_LIB + `
uniform sampler2D uMask;   // blurred copy of the name (lime halo)
uniform sampler2D uText;   // sharp copy of the name (letters)
uniform vec4  uRect;       // where the masks sit on screen, device px, top-left origin

const vec3 LIME = vec3(0.647, 1.0, 0.247);

void main() {
  vec2 fc = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  vec2 m = (fc - uRect.xy) / uRect.zw;
  if (m.x < 0.0 || m.y < 0.0 || m.x > 1.0 || m.y > 1.0) { gl_FragColor = vec4(0.0); return; }
  float band = smoothstep(0.04, 0.6, texture2D(uMask, m).a);
  float letter = texture2D(uText, m).a;
  if (band <= 0.0 && letter < 0.5) { gl_FragColor = vec4(0.0); return; }

  // same smoke field and speck jitter as the background
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = (uv - 0.5) * vec2(uRes.x / uRes.y, 2.0) * ZOOM;
  p += (rnd2(vec2(uSeed, 17.0)) - 0.5) * 200.0;
  vec2 cell = floor(gl_FragCoord.xy / SPECK);
  vec2 r = rnd2(cell);
  float ang = TAU * r.y + uTime * CHURN * (2.0 * rnd2(cell + 71.3).x - 1.0);
  p += JITTER * pow(r.x, 1.5) * vec2(cos(ang), sin(ang));
  float n = smoke(p);

  vec2 q = rnd2(cell + 13.7);
  float breathe = 0.55 + 0.45 * sin(TAU * q.y + uTime * (0.5 + r.x));

  // letters: densely packed light grey specks, a little denser where the smoke is thick
  if (letter >= 0.5) {
    float on = step(q.x, mix(0.7, 0.95, n));
    float g = (0.6 + 0.25 * q.y) * (0.85 + 0.15 * breathe);
    gl_FragColor = vec4(vec3(g) * on, on);
    return;
  }

  // lime halo: denser close to the letters and where the smoke is thick, each speck slowly breathing
  float on = step(q.x, band * (0.2 + 0.6 * n) * 0.85);
  float b = on * breathe * (0.3 + 0.7 * band);
  gl_FragColor = vec4(LIME * b, b);
}
`;

export function initIntro() {
  const intro = document.getElementById('intro');
  if (!intro) return;
  const canvas = intro.querySelector('.intro-grain');
  const name = intro.querySelector('.intro-name');
  const cmd = intro.querySelector('.intro-cmd');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let seen = false;
  try { seen = !!sessionStorage.getItem(KEY); sessionStorage.setItem(KEY, '1'); } catch (e) {}

  const grain = createGrainName(intro, canvas, name, reduced);

  async function play() {
    await document.fonts.load('800 40px "Syne"');
    if (seen || reduced) {
      cmd.textContent = 'whoami';
      show();
      return;
    }
    await wait(450);
    for (const ch of 'whoami') { cmd.textContent += ch; await wait(95); }
    await wait(350);
    show();
  }

  function show() {
    if (!grain) { name.classList.add('no-gl', 'show'); return; }   // no WebGL: solid grey letters
    grain.start();
    requestAnimationFrame(() => canvas.classList.add('show'));   // pop up: fade in, rise 10px
  }

  play();
}

function createGrainName(intro, canvas, name, still) {
  const gl = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: true });
  if (!gl) return null;
  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;
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
  for (const n of ['uRes', 'uTime', 'uSeed', 'uRect', 'uMask', 'uText']) U[n] = gl.getUniformLocation(prog, n);

  function texture(unit) {
    const t = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, t);
    for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR],
      [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v);
    return t;
  }
  const blurTex = texture(0);
  const textTex = texture(1);
  gl.uniform1i(U.uMask, 0);
  gl.uniform1i(U.uText, 1);

  // share the background's seed and clock so the grain moves with it
  let visit = null;
  try { visit = JSON.parse(sessionStorage.getItem(STORE)); } catch (e) {}
  const t0 = Number.isFinite(visit?.start) ? visit.start : Date.now();
  gl.uniform1f(U.uSeed, Number.isFinite(visit?.seed) ? visit.seed : 0);

  let dpr = 1;
  let rect = null;   // mask rect in document px
  let running = false;
  let visible = true;

  // draw a blurred and a sharp copy of the name into the two masks
  function build() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(U.uRes, canvas.width, canvas.height);

    const cs = getComputedStyle(name);
    const size = parseFloat(cs.fontSize);
    const lineH = parseFloat(cs.lineHeight) || size;
    const blur = size * BLUR;
    const pad = blur * 3;
    const words = [...name.querySelectorAll('.word')].map((w) => ({ w, r: w.getBoundingClientRect() }));
    const x0 = Math.min(...words.map((o) => o.r.left)) - pad;
    const y0 = Math.min(...words.map((o) => o.r.top)) - pad;
    const x1 = Math.max(...words.map((o) => o.r.right)) + pad;
    const y1 = Math.max(...words.map((o) => o.r.bottom)) + pad;
    rect = { x: x0, y: y0 + window.scrollY, w: x1 - x0, h: y1 - y0 };

    const paint = (unit, tex, filter) => {
      const mask = document.createElement('canvas');
      mask.width = Math.ceil(rect.w * dpr);
      mask.height = Math.ceil(rect.h * dpr);
      const g = mask.getContext('2d');
      g.scale(dpr, dpr);
      g.filter = filter;
      g.font = `800 ${size}px "Syne"`;
      if ('letterSpacing' in g) g.letterSpacing = cs.letterSpacing === 'normal' ? '0px' : cs.letterSpacing;
      g.fillStyle = '#fff';
      for (const { w, r } of words) {
        const met = g.measureText(w.textContent);
        const asc = met.fontBoundingBoxAscent ?? size * 0.9;
        const desc = met.fontBoundingBoxDescent ?? size * 0.25;
        g.fillText(w.textContent, r.left - x0, r.top - y0 + (lineH - (asc + desc)) / 2 + asc);
      }
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, mask);
    };
    paint(0, blurTex, `blur(${blur}px)`);
    paint(1, textTex, 'none');
  }

  function draw() {
    gl.uniform1f(U.uTime, still ? 0 : (Date.now() - t0) / 1000);
    gl.uniform4f(U.uRect, rect.x * dpr, (rect.y - window.scrollY) * dpr, rect.w * dpr, rect.h * dpr);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function loop() {
    if (!running || still || !visible || document.hidden) {
      running = false;
      if (rect) draw();   // last frame, so nothing is left on the fixed layer once the name is off screen
      return;
    }
    draw();
    requestAnimationFrame(loop);
  }
  function kick() {
    if (!rect) return;
    if (still) { draw(); return; }
    if (!running) { running = true; requestAnimationFrame(loop); }
  }

  new IntersectionObserver(([e]) => { visible = e.isIntersecting; kick(); }).observe(intro);
  document.addEventListener('visibilitychange', kick);
  window.addEventListener('scroll', () => { if (still && rect) draw(); }, { passive: true });
  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { if (rect) { build(); kick(); } }, 150);
  });

  return {
    start() { build(); kick(); },
  };
}
