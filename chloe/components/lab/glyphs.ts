import { clamp01, mix, rgba, seeded, smooth, type Palette } from "@/components/canvas/useCanvasLoop";

export type GlyphName = "pld" | "xrd" | "plasma" | "afm" | "tunnel" | "crystal";

type Glyph = (ctx: CanvasRenderingContext2D, t: number, w: number, h: number, palette: Palette) => void;

function dot(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

const plumeRand = seeded(3);
const plume = Array.from({ length: 14 }, () => ({ spread: plumeRand() - 0.5, lag: plumeRand() * 0.25 }));

const pld: Glyph = (ctx, t, w, h, { accent, faint }) => {
  const cycle = 2.4;
  const k = (t % cycle) / cycle;
  const round = Math.floor(t / cycle) % 6;
  const target: [number, number] = [10, h * 0.42];
  const floor = h - 6;

  ctx.fillStyle = rgba(faint, 0.9);
  ctx.fillRect(4, target[1] - 8, 4, 16);
  ctx.fillRect(w * 0.45, floor + 3, w * 0.5, 1);

  const flash = 1 - clamp01(k / 0.12);
  if (flash > 0) {
    ctx.strokeStyle = rgba(accent, 0.9 * flash);
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(w * 0.35, 2);
    ctx.lineTo(...target);
    ctx.stroke();
  }

  ctx.fillStyle = rgba(accent, 0.9);
  for (let layer = 0; layer <= round; layer++) {
    for (let x = w * 0.47; x < w * 0.95; x += 5) dot(ctx, x + (layer % 2) * 2.5, floor - layer * 3.4, 1.2);
  }

  for (const p of plume) {
    const u = smooth((k - 0.08 - p.lag) / 0.55);
    if (u <= 0 || u >= 1) continue;
    const endX = w * (0.7 + p.spread * 0.45);
    const endY = floor - (round + 1) * 3.4;
    const x = target[0] + (endX - target[0]) * u;
    const y = target[1] + (endY - target[1]) * u - Math.sin(u * Math.PI) * (8 + p.spread * 10);
    dot(ctx, x, y, 1.3);
  }
};

const xrd: Glyph = (ctx, t, w, h, { accent, ink }) => {
  const cx = w / 2;
  const cy = h / 2;
  ctx.lineWidth = 1;
  for (let n = 0; n < 4; n++) {
    const k = ((t / 2.8 + n / 4) % 1 + 1) % 1;
    const r = 4 + k * (w * 0.46);
    ctx.strokeStyle = rgba(accent, 0.7 * (1 - k));
    ctx.beginPath();
    ctx.ellipse(cx, cy, r, r * 0.62, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.fillStyle = rgba(ink, 0.85);
  dot(ctx, cx, cy, 2);
};

const plasma: Glyph = (ctx, t, w, h, { accent, faint }) => {
  const cx = w / 2;
  const cy = h / 2;
  const pulse = 0.6 + 0.4 * Math.sin(t * 3.1);
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, h * 0.5);
  glow.addColorStop(0, rgba(accent, 0.45 * pulse));
  glow.addColorStop(1, rgba(accent, 0));
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  const turns = 4;
  for (let i = 0; i <= 80; i++) {
    const u = i / 80;
    const a = u * turns * Math.PI * 2 + t * 2;
    const x = w * 0.18 + u * w * 0.64;
    const y = cy + Math.sin(a) * h * 0.3;
    const front = Math.cos(a) > 0;
    ctx.fillStyle = front ? rgba(mix(faint, accent, 0.3), 0.95) : rgba(faint, 0.45);
    dot(ctx, x, y, front ? 1.3 : 0.9);
  }
};

const surface = (x: number) => 0.5 + 0.22 * Math.sin(x * 0.31) + 0.12 * Math.sin(x * 0.83 + 1) + 0.06 * Math.sin(x * 1.9);

const afm: Glyph = (ctx, t, w, h, { accent, faint, ink }) => {
  const k = (t % 3.2) / 3.2;
  const scanX = 4 + k * (w - 8);
  const base = h - 6;
  const height = (x: number) => base - surface(x) * h * 0.35;

  for (let x = 4; x < w - 4; x += 2.5) {
    ctx.fillStyle = x < scanX ? rgba(accent, 0.95) : rgba(faint, 0.6);
    dot(ctx, x, height(x), x < scanX ? 1.2 : 0.9);
  }

  const tipY = height(scanX) - 2;
  ctx.strokeStyle = rgba(ink, 0.8);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(scanX + 14, 4);
  ctx.lineTo(scanX, tipY - 8);
  ctx.stroke();
  ctx.fillStyle = rgba(ink, 0.85);
  ctx.beginPath();
  ctx.moveTo(scanX - 3, tipY - 8);
  ctx.lineTo(scanX + 3, tipY - 8);
  ctx.lineTo(scanX, tipY);
  ctx.closePath();
  ctx.fill();
};

const tunnelRand = seeded(11);
const electrons = Array.from({ length: 6 }, (_, i) => ({
  offset: i / 6,
  lane: 0.25 + tunnelRand() * 0.5,
  passes: i % 3 === 0,
}));

const tunnel: Glyph = (ctx, t, w, h, { accent, faint }) => {
  const left = w * 0.46;
  const right = w * 0.56;
  ctx.fillStyle = rgba(faint, 0.35);
  ctx.fillRect(left, 4, right - left, h - 8);

  for (const e of electrons) {
    const k = (t / 2.6 + e.offset) % 1;
    const y = h * e.lane;
    let x: number;
    let alpha = 1;
    if (e.passes) {
      x = 4 + k * (w - 8);
      if (x > left && x < right) alpha = 0.35;
    } else {
      const reach = left - 2;
      const out = k < 0.5 ? k * 2 : 2 - k * 2;
      x = 4 + out * (reach - 4);
      alpha = 0.6 + 0.4 * out;
    }
    ctx.fillStyle = rgba(accent, alpha);
    dot(ctx, x, y, 1.8);
  }
};

const crystalRand = seeded(19);
const crystalJitter = Array.from({ length: 120 }, () => [crystalRand() - 0.5, crystalRand() - 0.5]);

const crystal: Glyph = (ctx, t, w, h, { accent, faint }) => {
  const pitch = 6;
  const cols = Math.floor((w - 6) / pitch);
  const rows = Math.floor((h - 6) / (pitch * 0.866));
  const k = smooth(((t % 3.4) / 3.4) * 1.25);
  const front = 3 + k * (w - 6);
  let n = 0;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = 5 + col * pitch + (row % 2 ? pitch / 2 : 0);
      const y = 5 + row * pitch * 0.866;
      const [jx, jy] = crystalJitter[n++ % crystalJitter.length];
      const ordered = clamp01((front - x) / 6);
      const px = x + jx * 4 * (1 - ordered);
      const py = y + jy * 4 * (1 - ordered);
      ctx.fillStyle = ordered > 0 ? rgba(mix(faint, accent, ordered), 0.95) : rgba(faint, 0.7);
      dot(ctx, px, py, 1 + ordered * 0.3);
    }
  }
};

export const GLYPHS: Record<GlyphName, Glyph> = { pld, xrd, plasma, afm, tunnel, crystal };
