// Rotating grey brain for the Brain Log button, with a bitmap / halftone look.
// A small raymarched brain (two hemispheres with a centre fissure, folds,
// cerebellum, stem) is lit, then ordered-dithered into light and dark dots.
// Every few seconds it "tries to turn pink": pink bands glitch across it and
// slices jump sideways for a moment, then it snaps back to grey.

import { VERT, compile } from './grain.js';

const FRAG = `
precision highp float;
uniform vec2  uRes;      // canvas size, device px
uniform float uPx;       // device px per dither dot
uniform float uTime;
uniform float uAngle;    // turntable rotation
uniform float uGlitch;   // 0 = calm grey, 1 = full pink glitch

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

float sdEll(vec3 p, vec3 r) { float k0 = length(p / r); float k1 = length(p / (r * r)); return k0 * (k0 - 1.0) / k1; }
float smin(float a, float b, float k) { float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0); return mix(b, a, h) - k * h * (1.0 - h); }

// wandering ridges: near zero = a sulcus (groove)
float folds(vec3 p) {
  vec3 q = p * 7.5;
  return sin(q.x + 1.7 * sin(q.z * 0.9 + q.y))
       * sin(q.z + 1.3 * sin(q.y * 1.1 + q.x * 0.7))
       * sin(q.y * 1.2 + 1.5 * sin(q.x * 0.8));
}

float map(vec3 p) {
  // cerebrum, flattened underneath
  float d = sdEll(p - vec3(0.0, 0.08, 0.05), vec3(0.78, 0.58, 1.0));
  d = max(d, -p.y - 0.3);
  // fissure between the hemispheres
  d += 0.11 * exp(-abs(p.x) * 20.0) * smoothstep(-0.2, 0.4, p.y);
  // grooves
  d += 0.03 * (1.0 - smoothstep(0.0, 0.35, abs(folds(p))));
  // cerebellum, finely striped
  float cb = sdEll(p - vec3(0.0, -0.34, -0.62), vec3(0.58, 0.24, 0.34)) + 0.01 * sin(p.y * 75.0);
  d = smin(d, cb, 0.06);
  // brain stem
  vec3 s = p - vec3(0.0, -0.5, -0.3);
  float st = max(length(s.xz) - 0.11, abs(s.y) - 0.22);
  return smin(d, st, 0.05);
}

vec3 rotY(vec3 p, float a) { float c = cos(a), s = sin(a); return vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z); }
vec3 rotX(vec3 p, float a) { float c = cos(a), s = sin(a); return vec3(p.x, c * p.y - s * p.z, s * p.y + c * p.z); }

// 4x4 ordered dither
float bayer2(vec2 a) { a = floor(a); return fract(dot(a, vec2(0.5, a.y * 0.75))); }
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }

void main() {
  vec2 cell = floor(gl_FragCoord.xy / uPx);
  vec2 uv = ((cell + 0.5) * uPx - 0.5 * uRes) / (0.5 * uRes.y) * 1.15;

  // glitch: horizontal bands slip sideways and some go pink
  float band = floor(cell.y / 3.0);
  float tick = floor(uTime * 14.0);
  float r = hash(vec2(band, tick));
  uv.x += (r - 0.5) * 0.35 * uGlitch * step(0.55, r);
  float pinkBand = uGlitch * step(0.3, hash(vec2(band * 1.7, floor(uTime * 20.0))));

  // orthographic camera tilted to look slightly down, brain on a turntable
  vec3 ro = rotX(vec3(uv, 3.0), -0.42);
  vec3 rd = rotX(vec3(0.0, 0.0, -1.0), -0.42);
  float t = 0.0, hit = 0.0;
  vec3 p;
  for (int i = 0; i < 64; i++) {
    p = rotY(ro + rd * t, uAngle);
    float d = map(p);
    if (d < 0.002) { hit = 1.0; break; }
    t += d * 0.8;
    if (t > 6.0) break;
  }
  if (hit < 0.5) { gl_FragColor = vec4(0.0); return; }

  vec2 e = vec2(0.003, 0.0);
  vec3 n = normalize(vec3(map(p + e.xyy) - map(p - e.xyy), map(p + e.yxy) - map(p - e.yxy), map(p + e.yyx) - map(p - e.yyx)));
  vec3 L = normalize(rotY(vec3(-0.5, 0.85, 0.6), uAngle));
  float dif = max(dot(n, L), 0.0);
  float groove = smoothstep(0.0, 0.35, abs(folds(p)));
  float lum = 0.06 + 0.8 * dif * (0.5 + 0.5 * groove);

  float on = step(bayer4(cell), lum);
  vec3 grey = mix(vec3(0.08), vec3(0.84), on);
  vec3 pink = mix(vec3(0.24, 0.05, 0.14), vec3(1.0, 0.49, 0.71), on);
  gl_FragColor = vec4(mix(grey, pink, pinkBand), 1.0);
}
`;

export function initBrain() {
  const canvas = document.querySelector('[data-brain]');
  if (!canvas) return;
  const gl = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: true });
  if (!gl) return;
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
  for (const n of ['uRes', 'uPx', 'uTime', 'uAngle', 'uGlitch']) U[n] = gl.getUniformLocation(prog, n);

  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.round(canvas.clientWidth * dpr);
  canvas.height = Math.round(canvas.clientHeight * dpr);
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.uniform2f(U.uRes, canvas.width, canvas.height);
  gl.uniform1f(U.uPx, Math.max(1, Math.round(dpr)));   // one dither dot per css px

  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const t0 = performance.now();

  // glitch schedule: grey for 6-11 s, then ~0.8 s of flickering pink
  const GLITCH_MS = 800;
  let nextGlitch = t0 + 4000 + Math.random() * 3000;
  let glitchEnd = 0;
  let level = 0;
  let lastFlick = 0;

  function frame(now) {
    const t = (now - t0) / 1000;
    if (!still) {
      if (now >= nextGlitch) { glitchEnd = now + GLITCH_MS; nextGlitch = now + 6000 + Math.random() * 5000; }
      if (now < glitchEnd) {
        if (now - lastFlick > 70) {            // flicker: pink, back, pinker, back
          level = Math.random() < 0.65 ? 0.45 + Math.random() * 0.55 : 0;
          lastFlick = now;
        }
      } else level = 0;
    }
    gl.uniform1f(U.uTime, t);
    gl.uniform1f(U.uAngle, still ? 0.6 : t * 0.55);
    gl.uniform1f(U.uGlitch, level);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  if (still) { frame(t0); return; }
  let last = 0;
  (function loop(now) {
    requestAnimationFrame(loop);
    if (document.hidden || now - last < 33) return;   // ~30 fps is plenty for a slow spin
    last = now;
    frame(now);
  })(t0);
}
