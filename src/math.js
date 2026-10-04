// Copyright (c) 2026 Motion Atlas contributors — MIT License.
export const TAU = Math.PI * 2;
export const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
export const mix = (a, b, v) => a + (b - a) * v;
export const phase = (t, period = 1) => ((t / period) % 1 + 1) % 1;
export const smooth = v => { v = clamp(v); return v * v * (3 - 2 * v); };
export const out = v => 1 - (1 - clamp(v)) ** 3;
export function seedRandom(seed = 1) {
  let s = seed >>> 0;
  return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
}
export const hash = (n, seed = 0) => { let x = (Math.imul(n + 1, 374761393) ^ seed) >>> 0; x = Math.imul(x ^ (x >>> 13), 1274126177); return ((x ^ (x >>> 16)) >>> 0) / 4294967296; };
export function spring(t, damping = .68, omega = 12) {
  if (t <= 0) return 0;
  if (damping < 1) { const k = Math.sqrt(1 - damping * damping); return 1 - Math.exp(-damping * omega * t) * (Math.cos(omega * k * t) + damping / k * Math.sin(omega * k * t)); }
  if (Math.abs(damping - 1) < 1e-6) return 1 - (1 + omega * t) * Math.exp(-omega * t);
  const k = Math.sqrt(damping * damping - 1), a = -omega * (damping - k), b = -omega * (damping + k);
  return 1 - (b * Math.exp(a * t) - a * Math.exp(b * t)) / (b - a);
}
export function cubicBezier(x1, y1, x2, y2, x) {
  x = clamp(x);
  const curve = (a, b, t) => 3 * (1 - t) ** 2 * t * a + 3 * (1 - t) * t * t * b + t ** 3;
  let low = 0, high = 1;
  for (let i = 0; i < 28; i++) { const mid = (low + high) / 2; if (curve(x1, x2, mid) < x) low = mid; else high = mid; }
  return curve(y1, y2, (low + high) / 2);
}
export const easings = {
  linear: x => x, easeIn: x => x ** 3, easeOut: out, easeInOut: smooth,
  back: x => { const u = x - 1; return 1 + 2.6 * u ** 3 + 1.6 * u ** 2; },
  elastic: x => x === 0 || x === 1 ? x : 1 - Math.exp(-6 * x) * Math.cos(x * 16),
  bounce: x => { const n = 7.5625, d = 2.75; if (x < 1 / d) return n * x * x; if (x < 2 / d) return n * (x -= 1.5 / d) * x + .75; if (x < 2.5 / d) return n * (x -= 2.25 / d) * x + .9375; return n * (x -= 2.625 / d) * x + .984375; },
};
export function hermite(p0, p1, m0, m1, u) {
  const a = 2 * u ** 3 - 3 * u ** 2 + 1, b = u ** 3 - 2 * u ** 2 + u, c = -2 * u ** 3 + 3 * u ** 2, d = u ** 3 - u ** 2;
  return p0.map((v, i) => a * v + b * m0[i] + c * p1[i] + d * m1[i]);
}
export function normalize(v) { const length = Math.hypot(...v); return length ? v.map(x => x / length) : v.map(() => 0); }
export function quaternion(axis, angle) { const s = Math.sin(angle / 2); return [...normalize(axis).map(v => v * s), Math.cos(angle / 2)]; }
export function slerp(a, b, t) {
  let dot = a.reduce((sum, v, i) => sum + v * b[i], 0);
  if (dot < 0) { b = b.map(v => -v); dot = -dot; }
  dot = clamp(dot, -1, 1);
  if (dot > .9995) return normalize(a.map((v, i) => mix(v, b[i], t)));
  const angle = Math.acos(dot), denominator = Math.sin(angle);
  return a.map((v, i) => (v * Math.sin((1 - t) * angle) + b[i] * Math.sin(t * angle)) / denominator);
}
export function rotate3(v, q) {
  const [x, y, z, w] = q, [a, b, c] = v;
  const tx = 2 * (y * c - z * b), ty = 2 * (z * a - x * c), tz = 2 * (x * b - y * a);
  return [a + w * tx + y * tz - z * ty, b + w * ty + z * tx - x * tz, c + w * tz + x * ty - y * tx];
}
export function fabrik(points, lengths, target, passes = 12) {
  const p = points.map(v => [...v]), root = [...p[0]], reach = lengths.reduce((a, b) => a + b, 0);
  const place = (anchor, other, length) => { const v = normalize(other.map((x, i) => x - anchor[i])); return anchor.map((x, i) => x + v[i] * length); };
  if (Math.hypot(target[0] - root[0], target[1] - root[1]) >= reach) {
    const direction = normalize(target.map((x, i) => x - root[i]));
    for (let i = 1; i < p.length; i++) p[i] = p[i - 1].map((v, axis) => v + direction[axis] * lengths[i - 1]);
    return p;
  }
  for (let pass = 0; pass < passes; pass++) {
    p[p.length - 1] = [...target];
    for (let i = p.length - 2; i >= 0; i--) p[i] = place(p[i + 1], p[i], lengths[i]);
    p[0] = [...root];
    for (let i = 1; i < p.length; i++) p[i] = place(p[i - 1], p[i], lengths[i - 1]);
    if (Math.hypot(p.at(-1)[0] - target[0], p.at(-1)[1] - target[1]) < .01) break;
  }
  return p;
}
export function curlField(x, y, t = 0) {
  // ψ = sin(x + t) sin(y − t/2) + sin(2x − y)/4 の回転勾配。
  return [Math.sin(x + t) * Math.cos(y - t / 2) - Math.cos(2 * x - y) / 4,
    -Math.cos(x + t) * Math.sin(y - t / 2) - Math.cos(2 * x - y) / 2];
}
export function waveMode(x, t, modes = [1, .35, .18]) {
  return modes.reduce((sum, amplitude, i) => sum + amplitude * Math.sin((i + 1) * Math.PI * x) * Math.cos((i + 1) * t * 2), 0);
}
