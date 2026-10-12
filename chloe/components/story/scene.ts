import { drawBall } from "@/components/canvas/ball";
import { clamp01, mix, rgba, seeded, smooth, type Palette, type Point, type Rgb } from "@/components/canvas/useCanvasLoop";

export type Rect = { left: number; top: number; right: number; bottom: number };

// Scroll progress (0 to 1) at which paragraphs 2, 3 and 4 start revealing, then where the reveal ends.
export type Beats = [number, number, number, number];

export type SceneInput = {
  progress: number;
  beats: Beats;
  width: number;
  height: number;
  text: Rect;
  palette: Palette;
  t: number;
};

type Layout = {
  key: string;
  count: number;
  ballSpots: Point[];
  seam: boolean[];
  lattice: Point[];
  latticeCols: number;
  film: Point[];
  delays: number[];
  phases: number[];
};

const SMALL_BALL = 14;
const FILM_PITCH = 14;
const FILM_ROWS = 3;
const LATTICE_PITCH = 14;
const BOUNCES = 3;
const GOLDEN = Math.PI * (3 - Math.sqrt(5));

function lerp(a: number, b: number, k: number) {
  return a + (b - a) * k;
}

function lerpPoint([ax, ay]: Point, [bx, by]: Point, k: number): Point {
  return [lerp(ax, bx, k), lerp(ay, by, k)];
}

function span(progress: number, start: number, end: number) {
  return end > start ? clamp01((progress - start) / (end - start)) : progress >= end ? 1 : 0;
}

function bump(k: number, start: number, end: number) {
  const u = span(k, start, end);
  return Math.sin(u * Math.PI);
}

function layoutKey(width: number, height: number, text: Rect) {
  return `${width}x${height}:${text.left},${text.top},${text.right},${text.bottom}`;
}

function marginBox(width: number, height: number, text: Rect): Rect {
  const room = width - text.right;
  if (room > 160) return { left: text.right + 32, top: height * 0.22, right: width - 32, bottom: height * 0.78 };
  return { left: width * 0.12, top: height * 0.3, right: width * 0.88, bottom: height * 0.7 };
}

function buildLayout(width: number, height: number, text: Rect): Layout {
  const filmCols = Math.max(8, Math.floor(width / FILM_PITCH));
  const count = filmCols * FILM_ROWS;
  const box = marginBox(width, height, text);
  const latticeCols = Math.max(4, Math.floor((box.right - box.left) / LATTICE_PITCH));
  const latticeRows = Math.ceil(count / latticeCols);
  const latticeTop = (box.top + box.bottom) / 2 - ((latticeRows - 1) * LATTICE_PITCH * 0.866) / 2;
  const rand = seeded(41);

  const ballSpots: Point[] = [];
  const seam: boolean[] = [];
  const lattice: Point[] = [];
  const film: Point[] = [];
  const delays: number[] = [];
  const phases: number[] = [];

  for (let i = 0; i < count; i++) {
    const r = Math.sqrt((i + 0.5) / count);
    const a = i * GOLDEN;
    const x = r * Math.cos(a);
    const y = r * Math.sin(a);
    ballSpots.push([x, y]);
    const left = Math.abs(Math.hypot(x + 1.3, y) - 0.92);
    const right = Math.abs(Math.hypot(x - 1.3, y) - 0.92);
    seam.push(Math.min(left, right) < 0.07);

    const row = Math.floor(i / latticeCols);
    const col = i % latticeCols;
    lattice.push([box.left + col * LATTICE_PITCH + (row % 2 ? LATTICE_PITCH / 2 : 0), latticeTop + row * LATTICE_PITCH * 0.866]);

    const filmRow = Math.floor(i / filmCols);
    const filmCol = i % filmCols;
    film.push([
      (filmCol + 0.5 + (filmRow % 2 ? 0.5 : 0)) * (width / filmCols),
      height - 18 - filmRow * FILM_PITCH * 0.866,
    ]);

    delays.push(rand());
    phases.push(rand() * Math.PI * 2);
  }

  return {
    key: layoutKey(width, height, text),
    count,
    ballSpots,
    seam,
    lattice,
    latticeCols,
    film,
    delays,
    phases,
  };
}

export function createStoryScene() {
  let layout: Layout | null = null;

  return function drawScene(ctx: CanvasRenderingContext2D, input: SceneInput) {
    const { progress, beats, width, height, text, palette, t } = input;
    if (!layout || layout.key !== layoutKey(width, height, text)) layout = buildLayout(width, height, text);

    const [zoomStart, latticeStart, filmStart, revealEnd] = beats;
    const box = marginBox(width, height, text);
    const center: Point = [(box.left + box.right) / 2, (box.top + box.bottom) / 2];
    const bigRadius = Math.max(56, Math.min((box.right - box.left) * 0.42, height * 0.2, 130));
    const floor = height - 28;
    const hop = Math.min(220, height * 0.3);

    const inText = (x: number, y: number) =>
      x > text.left - 16 && x < text.right + 16 && y > text.top - 16 && y < text.bottom + 16;
    const veil = (x: number, y: number) => (inText(x, y) ? 0.15 : 1);

    // Tennis: the ball bounces in along the floor and ends at the top of a hop in the margin.
    const serve = span(progress, 0, zoomStart);
    const ballX = lerp(-SMALL_BALL * 2, center[0], serve);
    const decay = 1 - 0.55 * serve;
    const ballY = floor - SMALL_BALL - hop * decay * Math.abs(Math.cos(Math.PI * BOUNCES * serve));

    const zoom = span(progress, zoomStart, latticeStart);
    const order = span(progress, latticeStart, filmStart);
    const settle = span(progress, filmStart, Math.min(1, revealEnd + 0.08));

    if (progress > 0 && zoom === 0) {
      ctx.fillStyle = rgba(palette.faint, 0.5 * Math.min(1, serve * 4));
      for (let x = 12; x < width; x += 12) {
        if (!inText(x, floor)) ctx.fillRect(x, floor, 1.5, 1.5);
      }
      for (let b = 0; b < BOUNCES; b++) {
        const at = (b + 0.5) / BOUNCES;
        if (serve < at) continue;
        const markX = lerp(-SMALL_BALL * 2, center[0], at);
        ctx.fillStyle = rgba(palette.ball, 0.55 * veil(markX, floor));
        ctx.beginPath();
        ctx.ellipse(markX, floor, 7, 2, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      drawBall(ctx, ballX, ballY, SMALL_BALL, ballX / SMALL_BALL, palette, veil(ballX, ballY), floor);
      return;
    }

    // Zoom: the ball rises, swells, and its fuzz breaks into atoms.
    const lift = smooth(zoom);
    const ballCenter = lerpPoint([center[0], ballY], center, lift);
    const radius = lerp(SMALL_BALL, bigRadius, smooth(Math.min(1, zoom * 1.6)));
    const solid = 1 - span(zoom, 0.25, 0.6);
    if (solid > 0 && order === 0) {
      drawBall(ctx, ballCenter[0], ballCenter[1], radius, ballCenter[0] / SMALL_BALL, palette, solid * veil(...ballCenter));
    }

    const dotsIn = span(zoom, 0.25, 0.6);
    const spread = 1 + 0.35 * span(zoom, 0.6, 1);
    const tint = span(zoom, 0.55, 1);
    const flash = bump(order, 0.25, 0.5);

    if (flash > 0) {
      const [lx, ly] = layout.lattice[Math.floor(layout.count / 2)];
      ctx.lineCap = "round";
      ctx.strokeStyle = rgba(palette.accent, 0.16 * flash);
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(0, height * 0.12);
      ctx.lineTo(lx, ly);
      ctx.stroke();
      ctx.strokeStyle = rgba(mix(palette.accent, [255, 255, 255], 0.35), 0.9 * flash);
      ctx.lineWidth = 1.6;
      ctx.stroke();
    }

    const bonds = order >= 1 ? 1 - settle : span(order, 0.55, 1);
    if (bonds > 0) {
      ctx.strokeStyle = rgba(palette.accent, 0.16 * bonds);
      ctx.lineWidth = 1;
      ctx.beginPath();
      const cols = layout.latticeCols;
      for (let i = 0; i < layout.count; i++) {
        const [x, y] = layout.lattice[i];
        if (inText(x, y)) continue;
        if ((i + 1) % cols && i + 1 < layout.count) {
          ctx.moveTo(x, y);
          ctx.lineTo(...layout.lattice[i + 1]);
        }
        if (i + cols < layout.count) {
          ctx.moveTo(x, y);
          ctx.lineTo(...layout.lattice[i + cols]);
        }
      }
      ctx.stroke();
    }

    for (let i = 0; i < layout.count; i++) {
      const delay = layout.delays[i] * 0.4;
      const toLattice = smooth(span(order, delay, delay + 0.6));
      const toFilm = smooth(span(settle, delay * 0.8, delay * 0.8 + 0.6));
      const [ux, uy] = layout.ballSpots[i];
      const onBall: Point = [ballCenter[0] + ux * radius * spread, ballCenter[1] + uy * radius * spread];
      const wobble = (1 - toLattice) * Math.sin(t * 1.4 + layout.phases[i]) * 0.8;
      let [x, y] = lerpPoint(onBall, layout.lattice[i], toLattice);
      [x, y] = lerpPoint([x, y], layout.film[i], toFilm);
      x += wobble;

      const base: Rgb = layout.seam[i] ? [255, 255, 255] : palette.ball;
      const color = mix(mix(base, palette.accent, tint), palette.accent, toLattice);
      const lit = 1 + flash * 0.8 * (1 - layout.delays[i]);
      const alpha = dotsIn * veil(x, y) * Math.min(1, 0.85 * lit);
      if (alpha <= 0.01) continue;
      ctx.fillStyle = rgba(color, alpha);
      ctx.beginPath();
      ctx.arc(x, y, (layout.seam[i] && tint < 1 ? 2.2 : 1.9) * (1 + flash * 0.3), 0, Math.PI * 2);
      ctx.fill();
    }

    // Stepping away from tennis: one last ball rolls off to the left.
    const roll = span(order, 0.6, 1);
    if (roll > 0 && roll < 1) {
      const x = lerp(Math.max(80, text.left * 0.5), -SMALL_BALL * 2, smooth(roll));
      const y = floor - SMALL_BALL * 0.8;
      drawBall(ctx, x, y, SMALL_BALL * 0.8, x / SMALL_BALL, palette, Math.min(1, roll * 6) * veil(x, y), floor);
    }
  };
}
