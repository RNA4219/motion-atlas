// Copyright (c) 2026 Motion Atlas contributors — MIT License.
import { TAU, mix } from './math.js';
export const palettes = {
  soft: { bg: '#edf1fa', panel: '#ffffff', ink: '#1b2845', muted: '#627391', line: '#cbd6eb', accent: '#4568ea', secondary: '#d97638' },
  precision: { bg: '#172231', panel: '#23334a', ink: '#e6edf7', muted: '#9aafca', line: '#3a506e', accent: '#76b8ff', secondary: '#ffbf73' },
  tactile: { bg: '#eef2ec', panel: '#ffffff', ink: '#243d37', muted: '#6a8075', line: '#c9d7cd', accent: '#287c65', secondary: '#ba653b' },
  default: { bg: '#111a29', panel: '#1d2b41', ink: '#e7f0ff', muted: '#879bb8', line: '#334663', accent: '#c5f477', secondary: '#799bff' },
};
export const paletteFor = e => palettes[e.family] || palettes.default;
export function rect(g, x, y, w, h, r = 0, fill, stroke) {
  g.beginPath(); g.roundRect(x, y, Math.max(0, w), Math.max(0, h), Math.min(Math.max(0, r), Math.abs(w / 2), Math.abs(h / 2)));
  if (fill) { g.fillStyle = fill; g.fill(); } if (stroke) { g.strokeStyle = stroke; g.stroke(); }
}
export function circle(g, x, y, r, fill, stroke) {
  g.beginPath(); g.arc(x, y, Math.max(0, r), 0, TAU); if (fill) { g.fillStyle = fill; g.fill(); } if (stroke) { g.strokeStyle = stroke; g.stroke(); }
}
export function text(g, label, x, y, size = 18, color = '#fff', align = 'left', weight = 500) {
  g.fillStyle = color; g.font = `${weight} ${size}px "Noto Sans JP", "Segoe UI", Arial, sans-serif`; g.textAlign = align; g.textBaseline = 'middle'; g.fillText(String(label), x, y);
}
export function line(g, points, color, width = 2, close = false) {
  if (!points.length) return; g.beginPath(); g.moveTo(...points[0]); for (const p of points.slice(1)) g.lineTo(...p); if (close) g.closePath(); g.strokeStyle = color; g.lineWidth = width; g.stroke();
}
export function polygon(g, x, y, r, sides, angle, fill, stroke) {
  const points = Array.from({ length: sides }, (_, i) => [x + Math.cos(angle + TAU * i / sides) * r, y + Math.sin(angle + TAU * i / sides) * r]);
  g.beginPath(); g.moveTo(...points[0]); points.slice(1).forEach(p => g.lineTo(...p)); g.closePath();
  if (fill) { g.fillStyle = fill; g.fill(); } if (stroke) { g.strokeStyle = stroke; g.stroke(); }
}
export function grid(g, p, step = 40) {
  g.save(); g.globalAlpha = .35; for (let x = 0; x <= 640; x += step) line(g, [[x, 0], [x, 400]], p.line, .7); for (let y = 0; y <= 400; y += step) line(g, [[0, y], [640, y]], p.line, .7); g.restore();
}
export function glow(g, x, y, r, color, strength = 1) {
  g.save(); g.globalAlpha = strength; const gradient = g.createRadialGradient(x, y, 0, x, y, r); gradient.addColorStop(0, color); gradient.addColorStop(1, color + '00'); g.fillStyle = gradient; g.fillRect(x - r, y - r, r * 2, r * 2); g.restore();
}
export function label(g, p, title, subtitle) { text(g, title, 36, 34, 14, p.muted); if (subtitle) text(g, subtitle, 604, 366, 13, p.muted, 'right'); }
export function transform(g, x, y, angle, sx, sy, fn) { g.save(); g.translate(x, y); g.rotate(angle); g.scale(sx, sy); fn(); g.restore(); }
export function checkmark(g, x, y, size, color, amount = 1) { const pts = [[x - size * .5, y], [x - size * .1, y + size * .4], [x + size * .6, y - size * .45]]; const a = amount < .4 ? mix(0, 1, amount / .4) : 1; const first = pts[0].map((v, i) => mix(v, pts[1][i], a)); const arr = [pts[0], first]; if (amount >= .4) arr.push(pts[1].map((v, i) => mix(v, pts[2][i], (amount - .4) / .6))); line(g, arr, color, size * .14); }
