/**
 * Terranova: a house on flat ground beside an injection robot. The robot's pipe runs down and
 * across into an elliptical cavity below the house. Each cycle the cavity inflates, lifting the
 * soil, the ground, and the house above it, then deflates back to rest.
 * Coordinates use the same normalized, y-down space as the other forms.
 */

type Vec = [number, number];

export const TERRA_SOIL = 0;
export const TERRA_RIGID = 1;
export const TERRA_PIPE = 2;
export const TERRA_FLOW = 3;
export const TERRA_CAVITY = 4;
export const TERRA_STATIC = 5;

const GROUND = 0.12;
const DEPTH = 0.62;
const HOUSE_X = -0.24;
const ROBOT_X = 0.64;
const LIFT = 0.13;
const CYCLE = 8;
const FLOW_SLUGS = 5;

const PIPE_TOP: Vec = [0.42, GROUND];
const PIPE_ELBOW: Vec = [0.42, DEPTH - 0.025];
const PIPE_TIP: Vec = [HOUSE_X + 0.06, DEPTH - 0.025];
const PIPE_VERTICAL = PIPE_ELBOW[1] - PIPE_TOP[1];
const PIPE_LENGTH = PIPE_VERTICAL + (PIPE_ELBOW[0] - PIPE_TIP[0]);

function smoothstep(e0: number, e1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}

/**
 * Inflation in [0, 1], the flow (1 injecting, -1 draining, 0 idle), and the slug direction,
 * which only flips during idle phases so slugs never jump while visible.
 */
function inflation(t: number): { s: number; flow: number; dir: number } {
  const u = t / CYCLE - Math.floor(t / CYCLE);
  if (u < 0.06) return { s: 0, flow: 0, dir: 1 };
  if (u < 0.5) return { s: smoothstep(0.06, 0.5, u), flow: 1, dir: 1 };
  if (u < 0.6) return { s: 1, flow: 0, dir: -1 };
  if (u < 0.94) return { s: 1 - smoothstep(0.6, 0.94, u), flow: -1, dir: -1 };
  return { s: 0, flow: 0, dir: 1 };
}

function cavity(s: number): { rx: number; ry: number; cy: number } {
  const rx = 0.1 + 0.36 * s;
  const ry = 0.012 + (LIFT / 2) * s;
  return { rx, ry, cy: DEPTH - ry };
}

function lift(x: number, s: number): number {
  const sigma = 0.2 + 0.18 * s;
  const d = x - HOUSE_X;
  return LIFT * s * Math.exp(-(d * d) / (2 * sigma * sigma));
}

function pipePoint(u: number): Vec {
  const along = u * PIPE_LENGTH;
  if (along <= PIPE_VERTICAL) return [PIPE_TOP[0], PIPE_TOP[1] + along];
  return [PIPE_ELBOW[0] - (along - PIPE_VERTICAL), PIPE_ELBOW[1]];
}

export type TerraSample = { x: number; y: number; sub: number; a: number; b: number; c: number; bright: number };

type Part = {
  weight: number;
  sub: number;
  bright: number;
  sample: () => TerraSample | Vec;
  /** Rigid parts lift with the ground at this x. */
  anchor?: number;
  /** Ground points brighten as they lift. */
  glows?: boolean;
};

export function sampleTerranova(count: number, rng: () => number, gaussian: () => number): TerraSample[] {
  const segment = (a: Vec, b: Vec, width: number): Vec => {
    const t = rng();
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    const off = gaussian() * width;
    return [a[0] + dx * t - (dy / len) * off, a[1] + dy * t + (dx / len) * off];
  };
  const polyline = (points: Vec[], width: number): Vec => {
    const lengths = points.slice(1).map((p, i) => Math.hypot(p[0] - points[i][0], p[1] - points[i][1]));
    let pick = rng() * lengths.reduce((a, b) => a + b, 0);
    for (let i = 0; i < lengths.length; i++) {
      if (pick <= lengths[i] || i === lengths.length - 1) return segment(points[i], points[i + 1], width);
      pick -= lengths[i];
    }
    return points[0];
  };
  const rect = (x0: number, y0: number, x1: number, y1: number, width: number): Vec =>
    polyline([[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]], width);
  const ring = (c: Vec, r: number, width: number): Vec => {
    const theta = rng() * Math.PI * 2;
    const rr = r + gaussian() * width;
    return [c[0] + Math.cos(theta) * rr, c[1] + Math.sin(theta) * rr];
  };

  const houseL = HOUSE_X - 0.2;
  const houseR = HOUSE_X + 0.2;
  const eave = GROUND - 0.27;
  const peak = GROUND - 0.48;
  const house = (): Vec => {
    const r = rng();
    if (r < 0.34) return polyline([[houseL, GROUND], [houseL, eave], [houseR, eave], [houseR, GROUND]], 0.005);
    if (r < 0.62) return polyline([[houseL - 0.05, eave], [HOUSE_X, peak], [houseR + 0.05, eave]], 0.005);
    if (r < 0.7) return polyline([[houseR - 0.1, eave - 0.1], [houseR - 0.1, eave - 0.2], [houseR - 0.05, eave - 0.2], [houseR - 0.05, eave - 0.05]], 0.004);
    if (r < 0.84) return polyline([[HOUSE_X + 0.03, GROUND], [HOUSE_X + 0.03, GROUND - 0.15], [HOUSE_X + 0.11, GROUND - 0.15], [HOUSE_X + 0.11, GROUND]], 0.004);
    const wx = HOUSE_X - 0.11;
    const wy = GROUND - 0.15;
    if (r < 0.95) return rect(wx - 0.05, wy - 0.05, wx + 0.05, wy + 0.05, 0.004);
    return rng() < 0.5 ? segment([wx, wy - 0.05], [wx, wy + 0.05], 0.003) : segment([wx - 0.05, wy], [wx + 0.05, wy], 0.003);
  };

  const trackTop = GROUND - 0.07;
  const bodyTop = GROUND - 0.17;
  const shoulder: Vec = [ROBOT_X - 0.03, bodyTop];
  const elbow: Vec = [ROBOT_X - 0.09, bodyTop - 0.13];
  const wrist: Vec = [PIPE_TOP[0], GROUND - 0.15];
  const robot = (): Vec => {
    const r = rng();
    if (r < 0.2) {
      return polyline(
        [[ROBOT_X - 0.15, GROUND - 0.035], [ROBOT_X - 0.12, trackTop], [ROBOT_X + 0.18, trackTop], [ROBOT_X + 0.21, GROUND - 0.035], [ROBOT_X + 0.18, GROUND], [ROBOT_X - 0.12, GROUND], [ROBOT_X - 0.15, GROUND - 0.035]],
        0.004,
      );
    }
    if (r < 0.3) return ring([ROBOT_X - 0.08 + Math.floor(rng() * 3) * 0.11, GROUND - 0.035], 0.022, 0.003);
    if (r < 0.48) return rect(ROBOT_X - 0.08, bodyTop, ROBOT_X + 0.16, trackTop, 0.004);
    if (r < 0.55) return ring([ROBOT_X + 0.08, (bodyTop + trackTop) / 2], 0.04, 0.003);
    if (r < 0.58) return ring(shoulder, 0.016, 0.003);
    if (r < 0.61) return ring(elbow, 0.014, 0.003);
    if (r < 0.71) return segment(shoulder, elbow, 0.007);
    if (r < 0.8) return segment(elbow, wrist, 0.006);
    if (r < 0.84) return segment([wrist[0] - 0.03, wrist[1]], [wrist[0] + 0.03, wrist[1]], 0.004);
    if (r < 0.88) return segment([ROBOT_X + 0.12, bodyTop], [ROBOT_X + 0.12, bodyTop - 0.12], 0.003);
    if (r < 0.9) return ring([ROBOT_X + 0.12, bodyTop - 0.13], 0.012, 0.003);
    const side = rng() < 0.5 ? -1 : 1;
    return segment([wrist[0] + side * 0.011, wrist[1]], [PIPE_TOP[0] + side * 0.011, GROUND], 0.002);
  };

  const strata = (y: number, phase: number): Vec => {
    const x = -1 + rng() * 2;
    return [x, y + Math.sin(x * 3 + phase) * 0.012 + gaussian() * 0.003];
  };

  const parts: Part[] = [
    { weight: 1.3, sub: TERRA_SOIL, bright: 1.05, glows: true, sample: () => segment([-1, GROUND], [1, GROUND], 0.005) },
    { weight: 0.35, sub: TERRA_SOIL, bright: 0.28, sample: () => [-1 + rng() * 2, GROUND + 0.01 + rng() * (DEPTH - GROUND - 0.15)] },
    { weight: 0.4, sub: TERRA_SOIL, bright: 0.38, sample: () => strata(0.27, 0) },
    { weight: 0.4, sub: TERRA_SOIL, bright: 0.34, sample: () => strata(0.4, 1.7) },
    { weight: 0.35, sub: TERRA_STATIC, bright: 0.3, sample: () => strata(0.76, 3.1) },
    { weight: 0.3, sub: TERRA_STATIC, bright: 0.24, sample: () => strata(0.9, 4.4) },
    { weight: 2.1, sub: TERRA_RIGID, bright: 1.05, anchor: HOUSE_X, sample: house },
    { weight: 2.1, sub: TERRA_RIGID, bright: 1.0, anchor: ROBOT_X, sample: robot },
    {
      weight: 1.0,
      sub: TERRA_PIPE,
      bright: 0.85,
      sample: () => {
        const u = rng();
        const [x, y] = pipePoint(u);
        const vertical = u * PIPE_LENGTH <= PIPE_VERTICAL;
        const off = (rng() < 0.5 ? -1 : 1) * 0.011 + gaussian() * 0.002;
        return vertical ? [x + off, y] : [x, y + off];
      },
    },
    {
      weight: 0.7,
      sub: TERRA_FLOW,
      bright: 1.9,
      sample: () => ({
        x: PIPE_TOP[0],
        y: PIPE_TOP[1],
        sub: TERRA_FLOW,
        a: Math.floor(rng() * FLOW_SLUGS) / FLOW_SLUGS + gaussian() * 0.012,
        b: gaussian() * 0.005,
        c: 0,
        bright: 1.9,
      }),
    },
    {
      weight: 1.3,
      sub: TERRA_CAVITY,
      bright: 1.2,
      sample: () => {
        const theta = rng() * Math.PI * 2;
        const k = 1 + gaussian() * 0.02;
        return { x: 0, y: 0, sub: TERRA_CAVITY, a: Math.cos(theta) * k, b: Math.sin(theta) * k, c: 1, bright: 1.2 };
      },
    },
    {
      weight: 1.0,
      sub: TERRA_CAVITY,
      bright: 0.6,
      sample: () => {
        const theta = rng() * Math.PI * 2;
        const r = Math.sqrt(rng());
        return { x: 0, y: 0, sub: TERRA_CAVITY, a: Math.cos(theta) * r, b: Math.sin(theta) * r, c: 0, bright: 0.6 };
      },
    },
  ];

  const total = parts.reduce((sum, p) => sum + p.weight, 0);
  const out: TerraSample[] = [];
  parts.forEach((part, i) => {
    const n = i === parts.length - 1 ? count - out.length : Math.round((part.weight / total) * count);
    for (let k = 0; k < n && out.length < count; k++) {
      const s = part.sample();
      const jitter = 0.7 + rng() * 0.3;
      if (Array.isArray(s)) {
        out.push({
          x: s[0],
          y: s[1],
          sub: part.sub,
          a: part.anchor ?? 0,
          b: 0,
          c: part.glows ? 1 : 0,
          bright: part.bright * jitter,
        });
      } else {
        out.push({ ...s, bright: s.bright * jitter });
      }
    }
  });
  return out;
}

/** Position and brightness multiplier for a Terranova point at time `t`. */
export function terranovaPoint(
  sub: number,
  a: number,
  b: number,
  c: number,
  x: number,
  y: number,
  t: number,
): { x: number; y: number; glow: number } {
  const { s, flow, dir } = inflation(t);
  switch (sub) {
    case TERRA_SOIL: {
      const dy = lift(x, s);
      return { x, y: y - dy, glow: c > 0 ? 1 + 6 * dy : 1 };
    }
    case TERRA_RIGID:
      return { x, y: y - lift(a, s), glow: 1 };
    case TERRA_PIPE: {
      const weight = Math.max(0, (PIPE_ELBOW[1] - y) / PIPE_VERTICAL);
      return { x, y: y - lift(x, s) * weight, glow: 1 + 0.6 * Math.abs(flow) };
    }
    case TERRA_FLOW: {
      const travel = (t * 0.32 * dir + a) % 1;
      const u = travel < 0 ? travel + 1 : travel;
      const atEnds = u < 0.03 || u > 0.97;
      const [px, py] = pipePoint(u);
      const vertical = u * PIPE_LENGTH <= PIPE_VERTICAL;
      const weight = vertical ? Math.max(0, (PIPE_ELBOW[1] - py) / PIPE_VERTICAL) : 0;
      return {
        x: px + b,
        y: py - lift(px, s) * weight + b,
        glow: flow === 0 || atEnds ? 0 : flow > 0 ? 1 : 0.55,
      };
    }
    case TERRA_CAVITY: {
      const { rx, ry, cy } = cavity(s);
      return { x: HOUSE_X + a * rx, y: cy + b * ry, glow: (c > 0 ? 0.75 : 0.35) + 0.9 * s };
    }
    case TERRA_STATIC:
      return { x, y, glow: 1 };
    default:
      return { x, y, glow: 1 };
  }
}
