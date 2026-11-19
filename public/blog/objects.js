// Dithered 3D objects for rydr.info: the brain button's renderer, generalised.
//
// Every <canvas data-object="bolt|brain|computer|lock|key|flag|server"> gets a
// small raymarched object on a turntable, lit, then ordered-dithered (Bayer 4x4)
// into 1-bit grey dots. It renders at one fragment per dot and the canvas is
// scaled up with image-rendering: pixelated.
//
// Glitch: every few seconds the object tries to break out into its own colour
// (bolt yellow, brain pink, ...) in a short burst of broken frames, like a
// misprinted comic or a bad video signal. Each glitch frame is held, then
// replaced by a new one, never eased:
//   - the frame tears into strips that shove along one direction
//     (sideways, up/down or corner to corner, picked per frame)
//   - blocks jump to the wrong place
//   - colour plates slip out of register: its true colour on one side,
//     lime on the other, printed as halftone dots
//   - some blocks flip fully to its true colour
//   - the turntable stutters: frames hold or skip ahead
// Then it snaps back to grey. Icons glitch only while their row is hovered;
// the brain button glitches by itself. Hover never changes the spin speed.
// Two looks: "wide" tears past the edges, "tight" keeps the damage inside the shape.
//
// Attributes: data-object (shape), data-dot (css px per dot, default 1).
// Hover target: the closest [data-object-host], else the canvas itself.

const VERT = 'attribute vec2 aPos; void main() { gl_Position = vec4(aPos, 0.0, 1.0); }';

const FRAG = `
precision highp float;
uniform vec2  uRes;      // buffer size = size in dots
uniform float uTime;
uniform float uAngle;    // turntable rotation
uniform float uGlitch;   // 0 = clean frame, else glitch strength for this frame (stepped, never eased)
uniform float uGSeed;    // new random layout every glitch frame
uniform vec2  uGDir;     // tear direction: sideways, up/down or corner to corner
uniform float uShape;
uniform float uZoom;
uniform float uTilt;
uniform vec3  uTrue;     // the colour it wants to be
uniform float uWide;     // 1 = wide glitch that tears past the edges, 0 = tight glitch kept inside the shape

const vec3 LIME = vec3(0.647, 1.0, 0.247);

float hash(vec2 p) { vec3 q = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973)); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
float h3(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float vnoise(vec3 x) {
  vec3 i = floor(x), f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(h3(i), h3(i + vec3(1, 0, 0)), f.x), mix(h3(i + vec3(0, 1, 0)), h3(i + vec3(1, 1, 0)), f.x), f.y),
             mix(mix(h3(i + vec3(0, 0, 1)), h3(i + vec3(1, 0, 1)), f.x), mix(h3(i + vec3(0, 1, 1)), h3(i + vec3(1, 1, 1)), f.x), f.y), f.z);
}

// ---------- primitives ----------
float sdBox(vec3 p, vec3 b) { vec3 q = abs(p) - b; return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0); }
float sdRBox(vec3 p, vec3 b, float r) { return sdBox(p, b - r) - r; }
float sdBox2(vec2 p, vec2 b) { vec2 q = abs(p) - b; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0); }
float sdEll(vec3 p, vec3 r) { float k0 = length(p / r); float k1 = length(p / (r * r)); return k0 * (k0 - 1.0) / k1; }
float smin(float a, float b, float k) { float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0); return mix(b, a, h) - k * h * (1.0 - h); }
float sdCylY(vec3 p, float h, float r) { vec2 d = abs(vec2(length(p.xz), p.y)) - vec2(r, h); return min(max(d.x, d.y), 0.0) + length(max(d, 0.0)); }
float sdCapY(vec3 p, float h, float r) { p.y -= clamp(p.y, -h, h); return length(p) - r; }
float sdTorusXY(vec3 p, float R, float r) { return length(vec2(length(p.xy) - R, p.z)) - r; }
vec2 U(vec2 a, vec2 b) { return a.x < b.x ? a : b; }   // union that keeps the material id

// ---------- brain (same model as the live brain button) ----------
float folds(vec3 p) {
  vec3 q = p * 7.5;
  return sin(q.x + 1.7 * sin(q.z * 0.9 + q.y))
       * sin(q.z + 1.3 * sin(q.y * 1.1 + q.x * 0.7))
       * sin(q.y * 1.2 + 1.5 * sin(q.x * 0.8));
}
vec2 brain(vec3 p) {
  float d = sdEll(p - vec3(0.0, 0.08, 0.05), vec3(0.78, 0.58, 1.0));
  d = max(d, -p.y - 0.3);
  d += 0.11 * exp(-abs(p.x) * 20.0) * smoothstep(-0.2, 0.4, p.y);
  d += 0.03 * (1.0 - smoothstep(0.0, 0.35, abs(folds(p))));
  float cb = sdEll(p - vec3(0.0, -0.34, -0.62), vec3(0.58, 0.24, 0.34)) + 0.01 * sin(p.y * 75.0);
  d = smin(d, cb, 0.06);
  vec3 s = p - vec3(0.0, -0.5, -0.3);
  float st = max(length(s.xz) - 0.11, abs(s.y) - 0.22);
  return vec2(smin(d, st, 0.05), 0.0);
}

// ---------- lightning bolt: extruded zig-zag with an engraved inner outline ----------
void edge(vec2 p, vec2 vi, vec2 vj, inout float d, inout float s) {
  vec2 e = vj - vi, w = p - vi;
  vec2 b = w - e * clamp(dot(w, e) / dot(e, e), 0.0, 1.0);
  d = min(d, dot(b, b));
  bvec3 c = bvec3(p.y >= vi.y, p.y < vj.y, e.x * w.y > e.y * w.x);
  if (all(c) || all(not(c))) s *= -1.0;
}
float bolt2(vec2 p) {
  vec2 v0 = vec2(0.10, 1.0), v1 = vec2(-0.50, -0.05), v2 = vec2(-0.05, -0.05), v3 = vec2(-0.30, -1.0);
  vec2 v4 = vec2(0.50, 0.15), v5 = vec2(0.05, 0.15), v6 = vec2(0.40, 1.0);
  float d = 1e9, s = 1.0;
  edge(p, v0, v6, d, s); edge(p, v1, v0, d, s); edge(p, v2, v1, d, s); edge(p, v3, v2, d, s);
  edge(p, v4, v3, d, s); edge(p, v5, v4, d, s); edge(p, v6, v5, d, s);
  return s * sqrt(d);
}
vec2 bolt(vec3 p) {
  float d2 = bolt2(p.xy);
  vec2 w = vec2(d2 + 0.03, abs(p.z) - 0.11);
  float d = min(max(w.x, w.y), 0.0) + length(max(w, 0.0)) - 0.05;
  d += 0.025 * exp(-pow((d2 + 0.1) / 0.022, 2.0)) * smoothstep(0.1, 0.15, abs(p.z));
  return vec2(d, 0.0);
}

// ---------- retro computer: CRT with a live screen, vents, keyboard ----------
vec2 computer(vec3 p) {
  vec3 q = p - vec3(0.0, 0.2, -0.05);
  float body = sdRBox(q, vec3(0.62, 0.5, 0.42), 0.08);
  float recess = sdRBox(q - vec3(0.0, 0.04, 0.47), vec3(0.47, 0.35, 0.1), 0.05);
  body = max(body, -recess);
  body += 0.012 * smoothstep(0.5, 0.6, abs(q.x)) * (0.5 + 0.5 * sin(q.y * 48.0)) * step(q.z, 0.2);
  vec3 gq = q - vec3(0.0, 0.04, 0.36);
  float glass = sdRBox(gq, vec3(0.44, 0.32, 0.04), 0.03) - 0.04 * (1.0 - dot(gq.xy, gq.xy));   // slightly bulged CRT glass
  float neck = sdRBox(p - vec3(0.0, -0.36, -0.1), vec3(0.18, 0.08, 0.2), 0.03);
  vec3 k = p - vec3(0.0, -0.58, 0.42);
  float kb = sdRBox(k, vec3(0.6, 0.05, 0.2), 0.02);
  float keys = max(smoothstep(0.82, 1.0, abs(sin(k.x * 30.0))), smoothstep(0.82, 1.0, abs(sin(k.z * 30.0 + 1.0))));
  kb += 0.012 * keys * step(0.02, k.y);
  vec2 r = U(vec2(body, 0.0), vec2(glass, 1.0));
  return U(r, vec2(min(neck, kb), 0.0));
}

// ---------- padlock: ribbed body, keyhole, shackle ----------
vec2 lock(vec3 p) {
  vec3 b = p - vec3(0.0, -0.3, 0.0);
  float body = sdRBox(b, vec3(0.52, 0.42, 0.22), 0.08);
  body += 0.008 * smoothstep(0.75, 1.0, sin(b.y * 32.0)) * step(abs(b.y), 0.3) * step(0.45, abs(b.x));
  vec3 kh = b - vec3(0.0, 0.06, 0.24);
  float hole = min(length(kh.xy) - 0.08, sdBox2(kh.xy - vec2(0.0, -0.12), vec2(0.035, 0.12)));
  hole = max(hole, abs(kh.z) - 0.1);
  body = max(body, -hole);
  vec3 s = p - vec3(0.0, 0.2, 0.0);
  float arc = max(sdTorusXY(s, 0.32, 0.075), -s.y);
  float legs = min(sdCapY(s - vec3(-0.32, -0.12, 0.0), 0.12, 0.075), sdCapY(s - vec3(0.32, -0.12, 0.0), 0.12, 0.075));
  return U(vec2(body, 0.0), vec2(min(arc, legs), 0.0));
}

// ---------- key: ring bow, collar, shaft, cut bit ----------
vec2 key(vec3 p) {
  float bow = sdTorusXY(p - vec3(0.0, 0.55, 0.0), 0.26, 0.075);
  bow = min(bow, max(sdTorusXY(p - vec3(0.0, 0.55, 0.0), 0.12, 0.035), abs(p.z) - 0.2));
  float shaft = sdCylY(p - vec3(0.0, -0.17, 0.0), 0.55, 0.065);
  float collar = sdTorusXY(vec3(p.x, p.z, p.y - 0.2), 0.075, 0.035);
  vec3 b = p - vec3(0.16, -0.55, 0.0);
  float bit = sdRBox(b, vec3(0.13, 0.17, 0.035), 0.015);
  bit = max(bit, -sdBox(b - vec3(0.12, 0.06, 0.0), vec3(0.06, 0.035, 0.1)));
  bit = max(bit, -sdBox(b - vec3(0.14, -0.08, 0.0), vec3(0.06, 0.03, 0.1)));
  float d = min(min(bow, shaft), min(collar, bit));
  return vec2(d, 0.0);
}

// ---------- CTF flag: pole and a waving cloth with a lime checker ----------
vec2 flag(vec3 p) {
  vec3 q = p - vec3(-0.55, 0.0, 0.0);
  float pole = sdCylY(q, 0.9, 0.04);
  float ball = length(q - vec3(0.0, 0.93, 0.0)) - 0.07;
  vec3 c = q - vec3(0.0, 0.48, 0.0);
  float along = clamp(c.x / 1.1, 0.0, 1.0);
  c.z -= 0.13 * sin(c.x * 4.2 - uTime * 3.5) * along;
  c.y -= 0.04 * sin(c.x * 3.0 - uTime * 3.5) * along;
  float cloth = sdRBox(c - vec3(0.56, 0.0, 0.0), vec3(0.56, 0.34, 0.025), 0.02) * 0.7;
  vec2 r = vec2(min(pole, ball), 0.0);
  float check = step(0.0, sin(c.x * 11.0) * sin(c.y * 11.0));
  return U(r, vec2(cloth, 2.0 + check));
}

// ---------- server rack: units, vents, blinking LEDs ----------
vec2 server(vec3 p) {
  float rack = sdRBox(p, vec3(0.46, 0.86, 0.4), 0.04);
  float uy = (p.y + 0.86) / 0.215;
  float fy = fract(uy);
  float front = step(0.3, p.z);
  rack += 0.022 * front * (1.0 - smoothstep(0.0, 0.08, min(fy, 1.0 - fy)));      // gaps between units
  rack += 0.008 * front * step(abs(p.x + 0.1), 0.22) * smoothstep(0.6, 1.0, sin(p.x * 70.0)) * step(0.25, fy) * step(fy, 0.75);   // vent slots
  vec3 l = p - vec3(0.3, 0.0, 0.4);
  float idx = clamp(floor(uy), 0.0, 7.0);
  l.y = p.y - (-0.86 + (idx + 0.5) * 0.215);
  float led = length(l) - 0.035;
  float blink = step(0.45, hash(vec2(idx, floor(uTime * 2.0 + idx))));
  return U(vec2(rack, 0.0), vec2(led, 1.0 + blink));
}

// ---------- keychain: a key ring with a key and a small sword hanging from it, swaying ----------
vec2 rot2(vec2 p, float a) { float c = cos(a), s = sin(a); return vec2(c * p.x + s * p.y, -s * p.x + c * p.y); }
float torusYZ(vec3 p, float R, float r) { return length(vec2(length(p.yz) - R, p.x)) - r; }   // ring facing sideways

// Keychain: a key and a sword on a small split ring. Both face the front so
// their silhouettes read at a glance; the ring turns sideways to thread them.

// Key: flat in xy, hanging down from its bow
float keyShape(vec3 k) {
  // big round bow with a quatrefoil inside and a centre stud
  vec3 b = k - vec3(0.0, -0.13, 0.0);
  float bow = sdTorusXY(b, 0.11, 0.026);
  float foil = min(min(sdTorusXY(b - vec3(0.042, 0.0, 0.0), 0.034, 0.009), sdTorusXY(b + vec3(0.042, 0.0, 0.0), 0.034, 0.009)),
                   min(sdTorusXY(b - vec3(0.0, 0.042, 0.0), 0.034, 0.009), sdTorusXY(b + vec3(0.0, 0.042, 0.0), 0.034, 0.009)));
  bow = min(bow, max(foil, abs(b.z) - 0.012));
  bow = min(bow, length(b) - 0.02);
  // two collars under the bow
  float col = min(length(vec2(length(k.xz) - 0.038, k.y + 0.27)) - 0.013,
                  length(vec2(length(k.xz) - 0.034, k.y + 0.305)) - 0.011);
  // shaft with a ball tip
  float shaft = sdCylY(k - vec3(0.0, -0.62, 0.0), 0.34, 0.03);
  shaft = min(shaft, length(k - vec3(0.0, -0.97, 0.0)) - 0.035);
  // big bit with three ward cuts and a slot
  vec3 t = k - vec3(0.085, -0.86, 0.0);
  float bit = sdRBox(t, vec3(0.062, 0.11, 0.014), 0.005);
  bit = max(bit, -sdBox(t - vec3(0.05, 0.065, 0.0), vec3(0.028, 0.017, 0.1)));
  bit = max(bit, -sdBox(t - vec3(0.04, 0.0, 0.0), vec3(0.038, 0.013, 0.1)));
  bit = max(bit, -sdBox(t - vec3(0.058, -0.07, 0.0), vec3(0.02, 0.018, 0.1)));
  bit = max(bit, -sdBox(t - vec3(-0.015, 0.0, 0.0), vec3(0.007, 0.075, 0.1)));
  return min(min(bow, col), min(shaft, bit));
}

// Sword: flat in xy, blade down; bold cross shape
float swordShape(vec3 q) {
  // pommel: a ring facing front (the split ring threads it), over a round pommel ball
  float ring = sdTorusXY(q - vec3(0.0, -0.06, 0.0), 0.045, 0.016);
  float ball = sdEll(q - vec3(0.0, -0.135, 0.0), vec3(0.046, 0.04, 0.046));
  // grip, cross-wrapped
  vec3 h = q - vec3(0.0, -0.255, 0.0);
  float wrap = sin(h.y * 110.0 + atan(h.z, h.x)) * sin(h.y * 110.0 - atan(h.z, h.x));
  float grip = sdCylY(h, 0.085, 0.032) + 0.005 * smoothstep(0.2, 1.0, wrap);
  // wide crossguard with ball ends and a pointed langet in the middle
  vec3 g = q - vec3(0.0, -0.36, 0.0);
  float guard = sdRBox(g, vec3(0.23, 0.026, 0.035), 0.014);
  guard = min(guard, length(vec3(abs(g.x) - 0.23, g.y + 0.012, g.z)) - 0.036);
  vec2 lg = vec2(abs(g.x), g.y + 0.04);
  guard = min(guard, max(abs(g.z) - 0.03, (lg.x * 0.9 + abs(lg.y)) - 0.052));
  // ricasso with an engraving, then a wide blade with a fuller, to a point
  vec3 rc = q - vec3(0.0, -0.44, 0.0);
  float ric = sdBox(rc, vec3(0.05, 0.05, 0.022));
  ric += 0.004 * step(abs(rc.x), 0.024) * step(abs(rc.y), 0.03) * step(0.014, abs(rc.z));
  float blade = sdBox(q - vec3(0.0, -0.82, 0.0), vec3(0.072, 0.36, 0.022));
  blade = max(blade, dot(vec2(abs(q.x), -q.y) - vec2(0.072, 1.06), normalize(vec2(0.2, 0.072))));
  blade = max(blade, abs(q.z) - 0.022 * (1.0 - abs(q.x) / 0.082) - 0.004);
  blade += 0.007 * exp(-pow(q.x / 0.015, 2.0)) * step(q.y, -0.5) * step(-1.0, q.y);
  return min(min(min(ring, ball), grip), min(min(guard, ric), blade));
}

// small split ring turned sideways (two coils), threading the key's bow and the sword's pommel ring
const vec3 RING_C = vec3(0.0, 0.66, 0.0);
float splitRing(vec3 p) {
  vec3 r = p - RING_C;
  return min(torusYZ(r - vec3(0.011, 0.0, 0.0), 0.085, 0.015), torusYZ(r + vec3(0.011, 0.0, 0.0), 0.085, 0.015));
}
vec3 keyFrame(vec3 p) {
  vec3 k = p - vec3(-0.03, 0.6, 0.0);
  k.xy = rot2(k.xy, -0.32 + 0.05 * sin(uTime * 1.6));
  return k;
}
vec3 swordFrame(vec3 p) {
  vec3 s = p - vec3(0.03, 0.6, 0.0);
  s.xy = rot2(s.xy, 0.32 + 0.05 * sin(uTime * 1.6 + 1.2));
  return s;
}

vec2 keysword(vec3 p) {
  return vec2(min(splitRing(p), min(keyShape(keyFrame(p)), swordShape(swordFrame(p)))), 0.0);
}

// the colour each piece wants to be, neon like the site's lime:
// key = blue team (defense), sword = red team (offense); the ring stays ash grey
const vec3 BLUE_TEAM = vec3(0.24, 0.72, 1.0);    // #3db8ff
const vec3 RED_TEAM  = vec3(1.0, 0.27, 0.4);     // #ff4566
vec3 keychainColor(vec3 p) {
  float dk = keyShape(keyFrame(p)), ds = swordShape(swordFrame(p)), dr = splitRing(p);
  if (dr < dk && dr < ds) return vec3(0.62);
  return dk < ds ? BLUE_TEAM : RED_TEAM;
}

vec2 mapM(vec3 p) {
  if (uShape < 0.5) return brain(p);
  if (uShape < 1.5) return bolt(p);
  if (uShape < 2.5) return computer(p);
  if (uShape < 3.5) return lock(p);
  if (uShape < 4.5) return key(p);
  if (uShape < 5.5) return flag(p);
  if (uShape < 6.5) return server(p);
  return keysword(p);
}
float map(vec3 p) { return mapM(p).x; }

vec3 rotY(vec3 p, float a) { float c = cos(a), s = sin(a); return vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z); }
vec3 rotX(vec3 p, float a) { float c = cos(a), s = sin(a); return vec3(p.x, c * p.y - s * p.z, s * p.y + c * p.z); }

float bayer2(vec2 a) { a = floor(a); return fract(dot(a, vec2(0.5, a.y * 0.75))); }
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }

// orthographic camera tilted down, object on a turntable; returns 1 on a hit
float march(vec2 uv, out vec3 pos) {
  vec3 ro = rotX(vec3(uv, 3.0), uTilt);
  vec3 rd = rotX(vec3(0.0, 0.0, -1.0), uTilt);
  pos = vec3(0.0);
  // every object fits in a sphere of radius 1.25 at the origin: skip rays that miss it
  float bb = dot(ro, rd);
  float h = bb * bb - dot(ro, ro) + 1.5625;
  if (h < 0.0) return 0.0;
  h = sqrt(h);
  float t = -bb - h, tEnd = -bb + h;
  for (int i = 0; i < 56; i++) {
    pos = rotY(ro + rd * t, uAngle);
    float d = map(pos);
    if (d < 0.002) return 1.0;
    t += d * 0.8;
    if (t > tEnd) break;
  }
  return 0.0;
}
// the colour a hit point wants to be: per piece for the keychain, else one colour
vec3 trueAt(vec3 p) { return (uShape > 6.5 && uShape < 7.5) ? keychainColor(p) : uTrue; }

float halftone(vec2 c, float v) {   // Ben-Day dots on a 45 degree, 3-dot grid
  vec2 q = vec2(c.x + c.y, c.x - c.y) / 3.0;
  return step(length(fract(q) - 0.5), 0.62 * sqrt(clamp(v, 0.0, 1.0)));
}

// grey dither shading for a hit, with the lime rim and the emissive parts
vec3 shade(vec3 p, vec2 cell, float b, out float lum) {
  vec2 e = vec2(0.003, 0.0);
  vec3 n = normalize(vec3(map(p + e.xyy) - map(p - e.xyy), map(p + e.yxy) - map(p - e.yxy), map(p + e.yyx) - map(p - e.yyx)));
  vec3 L = normalize(rotY(vec3(-0.5, 0.85, 0.6), uAngle));
  vec3 V = rotY(-rotX(vec3(0.0, 0.0, -1.0), uTilt), uAngle);
  float dif = max(dot(n, L), 0.0);
  float det = uShape < 0.5 ? 0.5 + 0.5 * smoothstep(0.0, 0.35, abs(folds(p))) : 0.75 + 0.25 * max(dot(n, V), 0.0);
  lum = 0.06 + 0.8 * dif * det;
  float mat = mapM(p).y;

  float on = step(b, lum);
  vec3 col = mix(vec3(0.08), vec3(0.84), on);
  float rim = pow(1.0 - max(dot(n, V), 0.0), 3.0);
  col = mix(col, LIME * 0.9, step(b, rim * 0.5) * (1.0 - on));   // lime dots on the dark rim

  if (mat > 0.5 && mat < 1.5) {
    float glow = 0.25;
    if (uShape > 1.5 && uShape < 2.5) {           // CRT: lines of "text" and a blinking block cursor
      vec2 s = (p.xy - vec2(0.0, 0.24)) / vec2(0.42, 0.3);
      float row = floor((0.75 - s.y) * 4.0);
      float len = 0.4 + 0.9 * hash(vec2(row, 3.0));
      float text = step(0.0, row) * step(row, 3.0) * step(s.x + 0.85, len) * step(0.35, fract((0.75 - s.y) * 4.0));
      float cur = step(abs(s.x + 0.85 - len - 0.12), 0.07) * step(row, 3.0) * step(2.5, row) * step(0.5, fract(uTime * 1.5));
      glow = 0.12 + 0.75 * max(text, cur);
    }
    col = mix(vec3(0.05, 0.09, 0.03), LIME, step(b, glow));
  } else if (mat > 1.5 && mat < 2.5) {
    col = mix(vec3(0.05, 0.09, 0.03), LIME, step(b, 0.9));   // lit LED
  } else if (mat > 2.5) {
    float ck = step(b, lum * 0.45);                            // flag: dark checker squares
    col = mix(mix(vec3(0.08), vec3(0.84), ck), LIME * 0.9, step(b, rim * 0.5 + 0.08) * (1.0 - ck));
  }
  return col;
}

vec2 toUV(vec2 c) { return (c + 0.5 - 0.5 * uRes) / (0.5 * uRes.y) * uZoom; }

void main() {
  vec2 cell = floor(gl_FragCoord.xy);
  float b = bayer4(cell);
  float g = uGlitch;
  vec2 c = cell;
  vec2 d = uGDir;
  float colorBlock = 0.0, invertBlock = 0.0;

  if (g > 0.0) {
    float s = uGSeed;
    float W = uWide;
    vec2 n = vec2(-d.y, d.x);
    float across = dot(cell, n);
    // dropped scanlines across the tear direction
    if (hash(vec2(floor(across), s + 9.1)) < mix(0.04, 0.07, W) * g) { gl_FragColor = vec4(0.0); return; }
    // tear: strips across the direction, each shoved along it by a whole number of dots
    // (tight: thin strips, 1-3 dots; wide: thick strips, up to 16 dots)
    float w = floor(mix(mix(1.0, 2.0, W), mix(4.0, 8.0, W), hash(vec2(s, 1.0))));
    float strip = floor(across / w);
    float moved = step(1.0 - mix(0.45, 0.6, W) * g, hash(vec2(strip, s)));
    float reach = mix(mix(1.0, 4.0, W), mix(3.0, 16.0, W), g);
    c -= d * floor((hash(vec2(strip, s + 4.0)) - 0.5) * 2.0 * reach * moved + 0.5);
    // blocks: some jump (far when wide, a few dots when tight), some flip their dots, some take the true colour
    vec2 bs = floor(mix(mix(vec2(3.0, 2.0), vec2(5.0, 3.0), W), mix(vec2(9.0, 6.0), vec2(16.0, 10.0), W),
                        vec2(hash(vec2(s, 2.0)), hash(vec2(s, 3.0)))));
    vec2 blk = floor(cell / bs);
    if (hash(blk + s * 7.13) > 1.0 - 0.2 * g) c += floor((vec2(hash(blk + s), hash(blk + s + 5.0)) - 0.5) * mix(6.0, 22.0, W) * g);
    colorBlock = step(1.0 - 0.3 * g, hash(blk + s * 3.7 + 11.0));
    invertBlock = step(1.0 - mix(0.18, 0.0, W) * g, hash(blk + s * 1.9 + 23.0));
  }

  vec2 uv = toUV(c);
  vec3 p;
  if (march(uv, p) > 0.5) {
    float lum;
    vec3 col = shade(p, cell, b, lum);
    if (invertBlock > 0.5) col = mix(vec3(0.84), vec3(0.08), step(b, lum));   // dots flipped, like a bad frame
    vec3 tc = trueAt(p);
    if (colorBlock > 0.5) col = mix(tc * 0.18, tc, halftone(cell, lum + 0.15));
    gl_FragColor = vec4(col, 1.0);
    return;
  }

  // out-of-register plates beside the object: true colour one way, lime the other
  // (tight: one or two dots, so they only fringe the edge)
  if (g > 0.0) {
    float k = floor(mix(mix(1.0, 2.0, uWide), mix(2.0, 6.0, uWide), hash(vec2(uGSeed, 6.0))) * (0.5 + 0.5 * g) + 0.5);
    vec3 q;
    if (march(toUV(c - d * k), q) > 0.5) {
      float a = halftone(cell, 0.55);
      gl_FragColor = vec4(trueAt(q) * a, a);
      return;
    }
    if (uWide > 0.5 && march(toUV(c + d * (k - 1.0)), q) > 0.5) {
      float a = halftone(cell + 1.0, 0.35);
      gl_FragColor = vec4(LIME * a, a);
      return;
    }
  }
  gl_FragColor = vec4(0.0);
}
`;

// shape id, true colour, zoom (scene units across half the height), camera tilt
const SHAPES = {
  brain:    { id: 0, color: [1.0, 0.49, 0.71], zoom: 1.15, tilt: -0.42 },
  bolt:     { id: 1, color: [1.0, 0.86, 0.18], zoom: 1.2,  tilt: -0.2 },
  computer: { id: 2, color: [0.35, 0.86, 1.0], zoom: 1.0,  tilt: -0.3 },
  lock:     { id: 3, color: [1.0, 0.55, 0.18], zoom: 1.0,  tilt: -0.25 },
  key:      { id: 4, color: [0.72, 0.56, 1.0], zoom: 1.0,  tilt: -0.2 },
  flag:     { id: 5, color: [1.0, 0.3, 0.3],   zoom: 1.1,  tilt: -0.2 },
  server:   { id: 6, color: [0.3, 0.62, 1.0],  zoom: 1.0,  tilt: -0.3 },
  keysword: { id: 7, color: [1.0, 0.27, 0.4], zoom: 1.0, tilt: -0.15, ease: true },   // key + sword keychain, colours per piece
};

// sideways, up/down and the four diagonals
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]];
import { glitchSound } from './sfx.js';

const SPIN = 0.55;   // turntable speed, rad/s, the same with or without hover

const rand = (a, b) => a + Math.random() * (b - a);
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const objs = [];

// Each object has its own small WebGL canvas (a page holds at most five), so
// nothing is copied between canvases and nothing stalls the GPU.
// Setup is split in two so it never holds up the page: start() hands the shader
// to the GPU driver, and finish() runs on a later frame once the driver says it
// is compiled (KHR_parallel_shader_compile), so the background and the text
// draw first.
function start(o) {
  const gl = o.canvas.getContext('webgl', { antialias: false, premultipliedAlpha: true, depth: false });
  if (!gl) return false;
  const sh = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  };
  const prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  o.gl = gl;
  o.prog = prog;
  o.par = gl.getExtension('KHR_parallel_shader_compile');
  return true;
}

// true once the object can draw; false while the driver is still compiling
function finish(o) {
  if (o.ready) return true;
  const { gl, prog } = o;
  if (o.par && !gl.getProgramParameter(prog, o.par.COMPLETION_STATUS_KHR)) return false;
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.warn('objects shader:', gl.getProgramInfoLog(prog));
    o.dead = true;
    return false;
  }
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
  o.U = {};
  for (const n of ['uRes', 'uTime', 'uAngle', 'uGlitch', 'uGSeed', 'uGDir', 'uShape', 'uZoom', 'uTilt', 'uTrue', 'uWide']) o.U[n] = gl.getUniformLocation(prog, n);
  gl.uniform1f(o.U.uShape, o.cfg.id);
  gl.uniform1f(o.U.uZoom, o.cfg.zoom);
  gl.uniform1f(o.U.uTilt, o.cfg.tilt);
  gl.uniform3fv(o.U.uTrue, o.cfg.color);
  gl.uniform1f(o.U.uWide, o.wide ? 1 : 0);
  o.ready = true;
  size(o);
  return true;
}

function size(o) {
  const dot = Number(o.canvas.dataset.dot) || 1;
  o.w = Math.max(8, Math.round(o.canvas.clientWidth / dot));
  o.h = Math.max(8, Math.round(o.canvas.clientHeight / dot));
  o.canvas.width = o.w;
  o.canvas.height = o.h;
  if (o.ready) { o.gl.viewport(0, 0, o.w, o.h); o.gl.uniform2f(o.U.uRes, o.w, o.h); }
}

// Glitching is triggered only by the icon itself or by the links and buttons in
// its row (titles, list items, "View all", ...), never by empty space in the row.
// data-glitch="auto" also glitches by itself every 1.5-3 s (the brain button),
// silently; while hovered it glitches with sound like the icons.
// Every glitch frame plays a matching glitch tick (sfx.js) while hovered.
const TRIGGERS = 'a, button, [data-glitch-trigger]';

function add(canvas, now) {
  const cfg = SHAPES[canvas.dataset.object];
  if (!cfg) return;
  const auto = canvas.dataset.glitch === 'auto';
  const o = {
    canvas, cfg, auto, wide: canvas.dataset.glitchStyle === 'wide',
    angle: rand(0, Math.PI * 2), hover: 0, visible: true,
    next: auto ? now + rand(1000, 2500) : Infinity,   // next burst
    burstEnd: 0, tickAt: 0,                          // current burst / next glitch frame
    g: 0, seed: 0, dir: DIRS[0], hold: false,
  };
  if (!start(o)) return;
  size(o);

  const icon = canvas.closest('.obj-link, .brain-btn') || canvas;
  const row = canvas.closest('[data-object-host]');
  const targets = new Set([icon]);
  if (row) row.querySelectorAll(TRIGGERS).forEach((el) => targets.add(el));
  const enter = () => {
    o.hover++;
    if (o.hover === 1 && !o.burstEnd) o.next = 0;   // glitch right away
  };
  const leave = () => {
    o.hover = Math.max(0, o.hover - 1);
    if (!o.hover && !o.auto && !o.burstEnd) o.next = Infinity;
  };
  for (const el of targets) {
    el.addEventListener('mouseenter', enter);
    el.addEventListener('mouseleave', leave);
    el.addEventListener('focus', enter);
    el.addEventListener('blur', leave);
    el.addEventListener('touchstart', () => { if (!o.burstEnd) o.next = 0; }, { passive: true });   // tap = glitch on phones
  }
  new IntersectionObserver(([e]) => { o.visible = e.isIntersecting; }).observe(canvas);
  objs.push(o);
}

// A burst is 0.35-0.9 s of held glitch frames, each 45-110 ms: about a quarter
// of them clean, the rest with a fresh direction, layout and strength. The
// turntable stutters during a burst (holds or skips) but never speeds up.
function step(o, now, dt) {
  if (!o.burstEnd && now >= o.next) { o.burstEnd = now + rand(350, 900); o.tickAt = now; }
  if (o.burstEnd) {
    if (now >= o.burstEnd) {
      o.burstEnd = 0;
      o.g = 0;
      o.hold = false;
      if (o.hover) o.next = now + rand(700, 1600);            // keeps glitching while hovered
      else o.next = o.auto ? now + rand(1500, 3000) : Infinity;
    } else if (now >= o.tickAt) {
      const hold = rand(45, 110);
      o.tickAt = now + hold;
      o.g = Math.random() < 0.25 ? 0 : rand(0.45, 1);
      o.seed = Math.floor(rand(0, 997));
      o.dir = DIRS[Math.floor(Math.random() * DIRS.length)];
      const r = Math.random();
      if (r < 0.2) o.angle += rand(-0.4, 0.4);    // skip ahead
      o.hold = r > 0.6;                            // or freeze this frame
      // the sound of this exact frame: clean frames are silent
      if (o.hover && o.visible && o.g > 0) glitchSound(o.g, hold, o.dir);
    }
  }
  if (!o.hold) o.angle += dt * SPIN;
}

function draw(o, t) {
  const { gl, U } = o;
  gl.uniform1f(U.uTime, t);
  gl.uniform1f(U.uAngle, o.cfg.ease ? o.angle - 0.35 * Math.sin(2 * o.angle) : o.angle);   // ease: slow when facing front or back
  gl.uniform1f(U.uGlitch, o.g);
  gl.uniform1f(U.uGSeed, o.seed);
  gl.uniform2f(U.uGDir, o.dir[0], o.dir[1]);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

// start a glitch burst on every object right away (used by the test gallery)
export function glitchNow() {
  for (const o of objs) if (!o.burstEnd) o.next = 0;
}

export function initObjects() {
  const canvases = [...document.querySelectorAll('canvas[data-object]')];
  if (!canvases.length) return;
  // wait two frames so the background and text are on screen, then start one
  // object per frame
  requestAnimationFrame(() => requestAnimationFrame(run));

  function run(t0) {
    let rt = 0;
    window.addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(() => { objs.forEach(size); if (reduced) objs.forEach((o) => finish(o) && draw(o, 0)); }, 150);
    });

    let last = t0;
    (function loop(now) {
      if (canvases.length) add(canvases.shift(), now);
      const busy = canvases.length || objs.some((o) => !o.ready && !o.dead);
      if (reduced) {
        objs.forEach((o) => { if (!o.drawn && finish(o)) { o.angle = 0.6; draw(o, 0); o.drawn = true; } });
        if (busy) requestAnimationFrame(loop);
        return;
      }
      requestAnimationFrame(loop);
      if (document.hidden || now - last < 33) return;   // ~30 fps
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const t = (now - t0) / 1000;
      for (const o of objs) {
        if (!finish(o)) continue;
        step(o, now, dt);
        if (o.visible) draw(o, t);
      }
    })(t0);
  }
}
