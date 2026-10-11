import type { Cloud } from "./cloud";
import { clamp01, mix, rgba, seeded, type Palette, type Point } from "./useCanvasLoop";

const AIM = 0.25;
const FLASH = 0.12;
const AFTERGLOW = 0.35;
const FIRST_PULSE = 1.2;
const PULSE_EVERY = 2.4;
const PLUME = 36;
const PITCH = 12;
const LAYER_STEP = PITCH * 0.866;
const EDGE_INSET = 8;
const FILM_TOP = 88;
const MAX_LAYERS = 7;
const MIN_LAYERS = 2;
const CLEARANCE = 24;
const POP = 0.35;
const PEEL = 1.2;
const BEAM_Y = 96;

export type Env = {
  width: number;
  height: number;
  palette: Palette;
  cloud: Cloud;
  toStage: (local: Point) => Point;
  slotRight: number;
};

type Pulse = { start: number; origin: Point; target: Point; local: Point; fired: boolean };
type Particle = { from: Point; control: Point; to: string; start: number; duration: number };

function slotKey(layer: number, row: number) {
  return `${layer},${row}`;
}

function parseKey(key: string): [number, number] {
  const [layer, row] = key.split(",").map(Number);
  return [layer, row];
}

function ease(k: number) {
  return 1 - (1 - k) * (1 - k);
}

function bezier([ax, ay]: Point, [bx, by]: Point, [cx, cy]: Point, u: number): Point {
  const v = 1 - u;
  return [v * v * ax + 2 * v * u * bx + u * u * cx, v * v * ay + 2 * v * u * by + u * u * cy];
}

export function createPld() {
  const rand = seeded(23);
  const film = new Map<string, number>();
  const reserved = new Set<string>();
  let particles: Particle[] = [];
  let pulse: Pulse | null = null;
  let nextPulse = FIRST_PULSE;
  let peelStart: number | null = null;

  const layout = ({ width, height, slotRight }: Env) => {
    const room = Math.floor((width - EDGE_INSET - slotRight - CLEARANCE) / LAYER_STEP);
    const layers = Math.min(MAX_LAYERS, Math.max(MIN_LAYERS, room));
    const rows = Math.max(1, Math.floor((height - FILM_TOP - PITCH) / PITCH));
    const position = (layer: number, row: number): Point => [
      width - EDGE_INSET - layer * LAYER_STEP,
      FILM_TOP + row * PITCH + (layer % 2 ? PITCH / 2 : 0),
    ];
    return { layers, rows, position };
  };

  const claim = (env: Env, y: number) => {
    const { layers, rows, position } = layout(env);
    for (let layer = 0; layer < layers; layer++) {
      let best: string | null = null;
      let bestDistance = Infinity;
      for (let row = 0; row < rows; row++) {
        const key = slotKey(layer, row);
        if (film.has(key) || reserved.has(key)) continue;
        const distance = Math.abs(position(layer, row)[1] - y);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = key;
        }
      }
      if (best) return best;
    }
    return null;
  };

  const isFull = (env: Env) => {
    const { layers, rows } = layout(env);
    for (let layer = 0; layer < layers; layer++) {
      for (let row = 0; row < rows; row++) if (!film.has(slotKey(layer, row))) return false;
    }
    return true;
  };

  const fire = (t: number, env: Env, current: Pulse) => {
    const { width } = env;
    const { position } = layout(env);
    const [ix, iy] = current.target;
    for (let n = 0; n < PLUME; n++) {
      const angle = (rand() - 0.5) * 1.5 * Math.pow(rand(), 0.6);
      const filmX = width - EDGE_INSET;
      const landingY = iy + Math.tan(angle) * (filmX - ix) * 0.8;
      const key = claim(env, landingY);
      if (!key) break;
      reserved.add(key);
      const to = position(...parseKey(key));
      const distance = Math.hypot(to[0] - ix, to[1] - iy);
      particles.push({
        from: [ix, iy],
        control: [ix + Math.cos(angle) * distance * 0.55, iy + Math.sin(angle) * distance * 0.55],
        to: key,
        start: t + rand() * 0.08,
        duration: 0.5 + rand() * 0.35 + distance / 2600,
      });
    }
    env.cloud.kick(current.local, 22);
  };

  return {
    prefill(env: Env, layerCount: number) {
      const { layers, rows } = layout(env);
      for (let layer = 0; layer < Math.min(layers, layerCount); layer++) {
        for (let row = 0; row < rows; row++) film.set(slotKey(layer, row), -10);
      }
    },

    update(t: number, env: Env) {
      const { height } = env;

      if (peelStart !== null && t - peelStart >= PEEL) {
        film.clear();
        peelStart = null;
        nextPulse = t + 0.6;
      }

      if (peelStart === null && !pulse && t >= nextPulse) {
        const local: Point = [90 + rand() * 110, 110 + rand() * 110];
        pulse = { start: t, origin: [0, Math.min(BEAM_Y, height * 0.2)], target: env.toStage(local), local, fired: false };
      }

      if (pulse) {
        pulse.target = env.toStage(pulse.local);
        if (!pulse.fired && t - pulse.start >= AIM) {
          pulse.fired = true;
          fire(t, env, pulse);
        }
        if (t - pulse.start >= AIM + FLASH + AFTERGLOW) {
          pulse = null;
          nextPulse = t + PULSE_EVERY - (AIM + FLASH + AFTERGLOW) + rand() * 0.6;
        }
      }

      particles = particles.filter((p) => {
        if (t < p.start + p.duration) return true;
        reserved.delete(p.to);
        film.set(p.to, t);
        return false;
      });

      if (peelStart === null && particles.length === 0 && isFull(env)) peelStart = t;
    },

    drawBeam(ctx: CanvasRenderingContext2D, t: number, palette: Palette) {
      if (!pulse) return;
      const age = t - pulse.start;
      const [ox, oy] = pulse.origin;
      const [tx, ty] = pulse.target;

      if (age < AIM) {
        ctx.setLineDash([3, 7]);
        ctx.strokeStyle = rgba(palette.accent, (0.12 + 0.1 * Math.sin(t * 90)) * clamp01(age / 0.08));
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(ox, oy);
        ctx.lineTo(tx, ty);
        ctx.stroke();
        ctx.setLineDash([]);
        return;
      }

      const flash = age < AIM + FLASH ? 1 : 1 - clamp01((age - AIM - FLASH) / AFTERGLOW);
      ctx.lineCap = "round";
      ctx.strokeStyle = rgba(palette.accent, 0.16 * flash);
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(tx, ty);
      ctx.stroke();
      ctx.strokeStyle = rgba(mix(palette.accent, [255, 255, 255], 0.35), 0.95 * flash);
      ctx.lineWidth = 1.6;
      ctx.stroke();

      const flare = ctx.createRadialGradient(ox, oy, 0, ox, oy, 26);
      flare.addColorStop(0, rgba(palette.accent, 0.5 * flash));
      flare.addColorStop(1, rgba(palette.accent, 0));
      ctx.fillStyle = flare;
      ctx.beginPath();
      ctx.arc(ox, oy, 26, 0, Math.PI * 2);
      ctx.fill();
    },

    drawImpact(ctx: CanvasRenderingContext2D, t: number, palette: Palette) {
      if (!pulse || t - pulse.start < AIM) return;
      const age = t - pulse.start - AIM;
      const glow = 1 - clamp01(age / (FLASH + AFTERGLOW));
      const [tx, ty] = pulse.target;
      const radius = 14 + age * 60;
      const burst = ctx.createRadialGradient(tx, ty, 0, tx, ty, radius);
      burst.addColorStop(0, rgba(palette.accent, 0.7 * glow));
      burst.addColorStop(0.35, rgba(palette.accent, 0.25 * glow));
      burst.addColorStop(1, rgba(palette.accent, 0));
      ctx.fillStyle = burst;
      ctx.beginPath();
      ctx.arc(tx, ty, radius, 0, Math.PI * 2);
      ctx.fill();
    },

    drawPlume(ctx: CanvasRenderingContext2D, t: number, env: Env) {
      const { position } = layout(env);
      ctx.lineCap = "round";
      for (const p of particles) {
        if (t < p.start) continue;
        const to = position(...parseKey(p.to));
        const k = clamp01((t - p.start) / p.duration);
        const head = bezier(p.from, p.control, to, ease(k));
        const tail = bezier(p.from, p.control, to, ease(Math.max(0, k - 0.07)));
        ctx.strokeStyle = rgba(env.palette.accent, 0.35);
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(...tail);
        ctx.lineTo(...head);
        ctx.stroke();
        ctx.fillStyle = rgba(env.palette.accent, 0.95);
        ctx.beginPath();
        ctx.arc(head[0], head[1], 2, 0, Math.PI * 2);
        ctx.fill();
      }
    },

    drawFilm(ctx: CanvasRenderingContext2D, t: number, env: Env) {
      const { position } = layout(env);
      const peel = peelStart === null ? 0 : clamp01((t - peelStart) / PEEL);
      const shift = peel * peel * 80;
      const fade = 1 - peel;
      const { accent } = env.palette;

      ctx.lineWidth = 1;
      ctx.strokeStyle = rgba(accent, 0.18 * fade);
      ctx.beginPath();
      for (const key of film.keys()) {
        const [layer, row] = parseKey(key);
        const [x, y] = position(layer, row);
        const up = layer % 2 ? [row, row + 1] : [row - 1, row];
        for (const neighbor of [slotKey(layer, row + 1), slotKey(layer + 1, up[0]), slotKey(layer + 1, up[1])]) {
          if (!film.has(neighbor)) continue;
          const [nx, ny] = position(...parseKey(neighbor));
          ctx.moveTo(x + shift, y);
          ctx.lineTo(nx + shift, ny);
        }
      }
      ctx.stroke();

      for (const [key, born] of film) {
        const [x, y] = position(...parseKey(key));
        const age = t - born;
        const pop = 1 - clamp01(age / POP);
        ctx.fillStyle = rgba(accent, 0.9 * fade);
        ctx.beginPath();
        ctx.arc(x + shift, y, 2.1 + pop * 2.6, 0, Math.PI * 2);
        ctx.fill();
        if (pop > 0) {
          ctx.strokeStyle = rgba(accent, 0.5 * pop * fade);
          ctx.beginPath();
          ctx.arc(x + shift, y, 3 + (1 - pop) * 8, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    },
  };
}

export type Pld = ReturnType<typeof createPld>;
