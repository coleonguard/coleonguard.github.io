/**
 * Echo: people in conversation below a layered neural network. Each cycle a few people speak,
 * their signal rises into the input layer, and it cascades layer by layer to the outputs.
 * Coordinates use the same normalized, y-down space as the other forms.
 */

type Vec = [number, number];

export const ECHO_PERSON = 0;
export const ECHO_NODE = 1;
export const ECHO_EDGE = 2;
export const ECHO_PULSE = 3;

const GROUND = 0.9;
const CYCLE = 4.6;
const LAYER_START = 0.04;
const LAYER_SPAN = 0.19;

type Person = { x: number; h: number; gesture?: 1 | -1 };

const PEOPLE: Person[] = [
  { x: -0.82, h: 0.64 },
  { x: -0.55, h: 0.74, gesture: -1 },
  { x: -0.26, h: 0.48 },
  { x: 0.04, h: 0.76, gesture: 1 },
  { x: 0.33, h: 0.68 },
  { x: 0.63, h: 0.6 },
];

const LAYERS: Vec[][] = [
  PEOPLE.map((p): Vec => [p.x + 0.02, -0.14]),
  [-0.66, -0.34, -0.02, 0.3, 0.6].map((x): Vec => [x, -0.42]),
  [-0.46, -0.15, 0.16, 0.45].map((x): Vec => [x, -0.68]),
  [-0.16, 0.18].map((x): Vec => [x, -0.93]),
];

type Edge = { a: Vec; b: Vec; layer: number; source: number };

function headTop(p: Person): Vec {
  return [p.x, GROUND - p.h - 0.015];
}

function nearest(from: Vec, targets: Vec[], k: number): number[] {
  return targets
    .map((t, i) => ({ i, d: Math.abs(t[0] - from[0]) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, k)
    .map((e) => e.i);
}

const EDGES: Edge[] = [
  ...PEOPLE.map((p, i): Edge => ({ a: headTop(p), b: LAYERS[0][i], layer: 0, source: i })),
  ...[1, 2].flatMap((layer) =>
    LAYERS[layer - 1].flatMap((from, i) =>
      nearest(from, LAYERS[layer], 2).map((j): Edge => ({ a: from, b: LAYERS[layer][j], layer, source: i })),
    ),
  ),
  ...LAYERS[2].flatMap((from, i) => LAYERS[3].map((to): Edge => ({ a: from, b: to, layer: 3, source: i }))),
];

function hash(n: number): number {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

function speaking(person: number, cycle: number): boolean {
  return hash(cycle * 13 + person) > 0.45;
}

function edgeActive(edgeIndex: number, cycle: number): boolean {
  const edge = EDGES[edgeIndex];
  if (edge.layer === 0) return speaking(edge.source, cycle);
  return hash(cycle * 31 + edgeIndex * 7) > 0.3;
}

function bump(u: number, center: number, width: number): number {
  const d = (u - center) / width;
  return Math.exp(-d * d);
}

export type EchoSample = { x: number; y: number; sub: number; a: number; b: number; c: number; bright: number };

type Sampler = { rng: () => number; gaussian: () => number };

function segmentPoint(a: Vec, b: Vec, t: number, off: number): Vec {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  return [a[0] + dx * t - (dy / len) * off, a[1] + dy * t + (dx / len) * off];
}

function samplePerson(index: number, count: number, s: Sampler, out: EchoSample[]): void {
  const p = PEOPLE[index];
  const k = p.h / 0.7;
  const top = GROUND - p.h;
  const headR = 0.052 * k;
  const head: Vec = [p.x, top + headR];
  const shoulderY = top + p.h * 0.2;
  const hipY = GROUND - p.h * 0.46;
  const torsoC: Vec = [p.x, (shoulderY + hipY) / 2];
  const torsoRx = 0.062 * k;
  const torsoRy = (hipY - shoulderY) / 2 + 0.01;
  const sway = (y: number) => Math.max(0, (GROUND - y) / p.h);

  type Part = { weight: number; sample: () => Vec; head?: boolean; bright?: number };
  const arm = (side: 1 | -1): Part => {
    const shoulder: Vec = [p.x + side * torsoRx * 0.95, shoulderY + 0.02 * k];
    const raised = p.gesture === side;
    const hand: Vec = raised
      ? [p.x + side * 0.17 * k, shoulderY + 0.06 * k]
      : [p.x + side * 0.085 * k, hipY + 0.03 * k];
    const elbow: Vec = raised
      ? [p.x + side * 0.1 * k, shoulderY + 0.14 * k]
      : [(shoulder[0] + hand[0]) / 2 + side * 0.01, (shoulder[1] + hand[1]) / 2];
    return {
      weight: 0.9,
      bright: 0.95,
      sample: () => {
        const t = s.rng();
        const off = s.gaussian() * 0.006 * k;
        return t < 0.5 ? segmentPoint(shoulder, elbow, t * 2, off) : segmentPoint(elbow, hand, t * 2 - 1, off);
      },
    };
  };
  const leg = (side: 1 | -1): Part => ({
    weight: 1.1,
    sample: () =>
      segmentPoint([p.x + side * 0.025 * k, hipY], [p.x + side * 0.04 * k, GROUND], s.rng(), s.gaussian() * 0.008 * k),
  });

  const torsoPoint = (theta: number, r: number): Vec => {
    const y = Math.sin(theta) * r;
    const taper = 1 - 0.25 * Math.max(0, y);
    return [torsoC[0] + Math.cos(theta) * r * torsoRx * taper, torsoC[1] + y * torsoRy];
  };

  const parts: Part[] = [
    {
      weight: 1.3,
      head: true,
      bright: 1.15,
      sample: () => {
        const theta = s.rng() * Math.PI * 2;
        const r = headR * (1 + s.gaussian() * 0.04);
        return [head[0] + Math.cos(theta) * r, head[1] + Math.sin(theta) * r];
      },
    },
    {
      weight: 0.35,
      head: true,
      bright: 0.5,
      sample: () => {
        const theta = s.rng() * Math.PI * 2;
        const r = Math.sqrt(s.rng()) * headR;
        return [head[0] + Math.cos(theta) * r, head[1] + Math.sin(theta) * r];
      },
    },
    {
      weight: 0.2,
      sample: () => segmentPoint([p.x, top + headR * 2], [p.x, shoulderY], s.rng(), s.gaussian() * 0.006 * k),
    },
    {
      weight: 2.2,
      bright: 1.05,
      sample: () => torsoPoint(s.rng() * Math.PI * 2, 1 + s.gaussian() * 0.03),
    },
    {
      weight: 0.8,
      bright: 0.4,
      sample: () => torsoPoint(s.rng() * Math.PI * 2, Math.sqrt(s.rng())),
    },
    arm(1),
    arm(-1),
    leg(1),
    leg(-1),
  ];

  const total = parts.reduce((sum, part) => sum + part.weight, 0);
  let made = 0;
  parts.forEach((part, i) => {
    const n = i === parts.length - 1 ? count - made : Math.round((part.weight / total) * count);
    for (let j = 0; j < n && made < count; j++, made++) {
      const [x, y] = part.sample();
      out.push({
        x,
        y,
        sub: ECHO_PERSON,
        a: index,
        b: sway(y),
        c: part.head ? 1 : 0,
        bright: (part.bright ?? 1) * (0.7 + s.rng() * 0.3),
      });
    }
  });
}

export function sampleEcho(count: number, rng: () => number, gaussian: () => number): EchoSample[] {
  const s: Sampler = { rng, gaussian };
  const out: EchoSample[] = [];
  const peopleCount = Math.floor(count * 0.46);
  const nodeCount = Math.floor(count * 0.14);
  const edgeCount = Math.floor(count * 0.18);
  const pulseCount = count - peopleCount - nodeCount - edgeCount;

  const weights = PEOPLE.map((p) => p.h);
  const weightTotal = weights.reduce((a, b) => a + b, 0);
  let assigned = 0;
  PEOPLE.forEach((_, i) => {
    const n = i === PEOPLE.length - 1 ? peopleCount - assigned : Math.round((weights[i] / weightTotal) * peopleCount);
    samplePerson(i, n, s, out);
    assigned += n;
  });

  const nodes = LAYERS.flatMap((layer, l) => layer.map((c) => ({ c, l })));
  for (let k = 0; k < nodeCount; k++) {
    const { c, l } = nodes[k % nodes.length];
    const size = l === LAYERS.length - 1 ? 1.35 : 1;
    const core = rng() < 0.6;
    const theta = rng() * Math.PI * 2;
    const r = core ? Math.sqrt(rng()) * 0.024 * size : 0.048 * size + gaussian() * 0.004;
    out.push({
      x: c[0] + Math.cos(theta) * r,
      y: c[1] + Math.sin(theta) * r,
      sub: ECHO_NODE,
      a: l,
      b: 0,
      c: 0,
      bright: core ? 1.7 : 0.8,
    });
  }

  for (let k = 0; k < edgeCount; k++) {
    const e = k % EDGES.length;
    const edge = EDGES[e];
    const [x, y] = segmentPoint(edge.a, edge.b, rng(), gaussian() * 0.002);
    out.push({ x, y, sub: ECHO_EDGE, a: e, b: 0, c: 0, bright: edge.layer === 0 ? 0.4 : 0.6 });
  }

  for (let k = 0; k < pulseCount; k++) {
    const e = k % EDGES.length;
    out.push({
      x: EDGES[e].a[0],
      y: EDGES[e].a[1],
      sub: ECHO_PULSE,
      a: e,
      b: Math.pow(rng(), 2) * 0.18,
      c: gaussian() * 0.006,
      bright: 1.8,
    });
  }

  return out;
}

/** Position and brightness multiplier for an Echo point at time `t`. */
export function echoPoint(
  sub: number,
  a: number,
  b: number,
  c: number,
  x: number,
  y: number,
  t: number,
): { x: number; y: number; glow: number } {
  const cycle = Math.floor(t / CYCLE);
  const u = t / CYCLE - cycle;

  switch (sub) {
    case ECHO_PERSON: {
      const sway = Math.sin(t * 0.9 + a * 1.7) * 0.012 * b;
      const glow = c > 0 && speaking(a, cycle) ? 1 + 2 * bump(u, LAYER_START, 0.06) : 1;
      return { x: x + sway, y, glow };
    }
    case ECHO_NODE: {
      const arrive = LAYER_START + (a + 1) * LAYER_SPAN;
      return { x, y, glow: 1 + 2.6 * bump(u, arrive, 0.05) };
    }
    case ECHO_EDGE: {
      const edge = EDGES[a];
      const start = LAYER_START + edge.layer * LAYER_SPAN;
      const lit = edgeActive(a, cycle) ? bump(u, start + LAYER_SPAN / 2, LAYER_SPAN * 0.6) : 0;
      return { x, y, glow: 1 + 2.8 * lit };
    }
    case ECHO_PULSE: {
      const edge = EDGES[a];
      const start = LAYER_START + edge.layer * LAYER_SPAN;
      const progress = (u - start) / LAYER_SPAN - b;
      const visible = edgeActive(a, cycle) && progress > 0 && progress < 1;
      const p = Math.min(1, Math.max(0, progress));
      const [px, py] = segmentPoint(edge.a, edge.b, p, c);
      return { x: px, y: py, glow: visible ? 1 - b * 3 : 0 };
    }
    default:
      return { x, y, glow: 1 };
  }
}
