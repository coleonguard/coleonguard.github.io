import type { ChapterId } from "@/content/chapters";

/**
 * Forms are authored in a normalized space: x and y roughly in [-1, 1], with y pointing down
 * to match screen space. The engine scales them into a cluster slot.
 */

export const KIND_STATIC = 0;
export const KIND_GLOBE = 1;
export const KIND_ORBITER = 2;

export type ShapeData = {
  count: number;
  xy: Float32Array;
  bright: Float32Array;
  kind: Uint8Array;
  /** Per-point parameters for animated kinds (4 floats each). */
  params: Float32Array;
};

type Vec = [number, number];

type Primitive =
  | { kind: "segment"; a: Vec; b: Vec; width: number; density?: number; bright?: number; dots?: number }
  | { kind: "ring"; c: Vec; r: number; width: number; density?: number; bright?: number }
  | { kind: "disc"; c: Vec; r: number; density?: number; bright?: number }
  | {
      kind: "ellipse";
      c: Vec;
      rx: number;
      ry: number;
      fill: boolean;
      from?: number;
      to?: number;
      tilt?: number;
      density?: number;
      bright?: number;
      dots?: number;
    };

type Rng = () => number;

function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gaussian(rng: Rng): number {
  const u = Math.max(rng(), 1e-6);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rng());
}

function mass(p: Primitive): number {
  const density = p.density ?? 1;
  switch (p.kind) {
    case "segment":
      return Math.hypot(p.b[0] - p.a[0], p.b[1] - p.a[1]) * density;
    case "ring":
      return 2 * Math.PI * p.r * density;
    case "disc":
      return Math.PI * p.r * p.r * 6 * density;
    case "ellipse": {
      const span = (p.to ?? Math.PI * 2) - (p.from ?? 0);
      const perimeter = span * Math.sqrt((p.rx * p.rx + p.ry * p.ry) / 2);
      return (p.fill ? Math.PI * p.rx * p.ry * 6 : perimeter) * density;
    }
    default: {
      const exhaustive: never = p;
      return exhaustive;
    }
  }
}

function quantize(u: number, dots: number | undefined): number {
  return dots ? Math.floor(u * dots) / dots : u;
}

function samplePrimitive(p: Primitive, rng: Rng): Vec {
  switch (p.kind) {
    case "segment": {
      const t = quantize(rng(), p.dots);
      const dx = p.b[0] - p.a[0];
      const dy = p.b[1] - p.a[1];
      const len = Math.hypot(dx, dy) || 1;
      const off = gaussian(rng) * p.width * 0.5;
      return [p.a[0] + dx * t - (dy / len) * off, p.a[1] + dy * t + (dx / len) * off];
    }
    case "ring": {
      const theta = rng() * Math.PI * 2;
      const r = p.r + gaussian(rng) * p.width * 0.5;
      return [p.c[0] + Math.cos(theta) * r, p.c[1] + Math.sin(theta) * r];
    }
    case "disc": {
      const theta = rng() * Math.PI * 2;
      const r = Math.sqrt(rng()) * p.r;
      return [p.c[0] + Math.cos(theta) * r, p.c[1] + Math.sin(theta) * r];
    }
    case "ellipse": {
      const from = p.from ?? 0;
      const to = p.to ?? Math.PI * 2;
      const theta = from + quantize(rng(), p.dots) * (to - from);
      const k = p.fill ? Math.sqrt(rng()) : 1 + gaussian(rng) * 0.012;
      const x = Math.cos(theta) * p.rx * k;
      const y = Math.sin(theta) * p.ry * k;
      const tilt = p.tilt ?? 0;
      return [
        p.c[0] + x * Math.cos(tilt) - y * Math.sin(tilt),
        p.c[1] + x * Math.sin(tilt) + y * Math.cos(tilt),
      ];
    }
    default: {
      const exhaustive: never = p;
      return exhaustive;
    }
  }
}

function emptyShape(count: number): ShapeData {
  return {
    count,
    xy: new Float32Array(count * 2),
    bright: new Float32Array(count),
    kind: new Uint8Array(count),
    params: new Float32Array(count * 4),
  };
}

function fillFromPrimitives(
  shape: ShapeData,
  start: number,
  count: number,
  primitives: Primitive[],
  rng: Rng,
): void {
  const masses = primitives.map(mass);
  const total = masses.reduce((sum, m) => sum + m, 0);
  let cursor = start;
  primitives.forEach((p, idx) => {
    const n =
      idx === primitives.length - 1
        ? start + count - cursor
        : Math.round((masses[idx] / total) * count);
    for (let k = 0; k < n && cursor < start + count; k++, cursor++) {
      const [x, y] = samplePrimitive(p, rng);
      shape.xy[cursor * 2] = x;
      shape.xy[cursor * 2 + 1] = y;
      shape.bright[cursor] = (p.bright ?? 1) * (0.65 + rng() * 0.35);
      shape.kind[cursor] = KIND_STATIC;
    }
  });
}

function seg(a: Vec, b: Vec, width = 0.03, extra: Partial<Primitive> = {}): Primitive {
  return { kind: "segment", a, b, width, ...extra } as Primitive;
}

function polyline(points: Vec[], width: number, extra: Partial<Primitive> = {}): Primitive[] {
  return points.slice(1).map((p, i) => seg(points[i], p, width, extra));
}

function robotics(): Primitive[] {
  const hip: Vec = [-0.02, -0.06];
  const shoulder: Vec = [0.04, -0.5];
  const prostheticKnee: Vec = [-0.14, 0.34];
  const prostheticAnkle: Vec = [-0.3, 0.72];
  return [
    { kind: "ring", c: [0.07, -0.72], r: 0.1, width: 0.025, density: 1.6 },
    { kind: "disc", c: [0.07, -0.72], r: 0.08, density: 0.35, bright: 0.55 },
    seg(shoulder, hip, 0.13, { density: 2.2 }),
    seg([0.06, -0.62], shoulder, 0.05),
    ...polyline([shoulder, [0.2, -0.26], [0.29, -0.06]], 0.05, { density: 1.3 }),
    ...polyline([shoulder, [-0.13, -0.28], [-0.21, -0.08]], 0.04, { density: 1.1, bright: 0.7 }),
    ...polyline([hip, [0.2, 0.33], [0.29, 0.76], [0.44, 0.79]], 0.06, { density: 1.6 }),
    seg(hip, prostheticKnee, 0.07, { density: 1.4 }),
    { kind: "ring", c: prostheticKnee, r: 0.045, width: 0.012, density: 3, bright: 1.25 },
    seg(prostheticKnee, prostheticAnkle, 0.012, { density: 2.4, bright: 1.25 }),
    seg(prostheticAnkle, [-0.16, 0.79], 0.018, { density: 2, bright: 1.15 }),
    { kind: "ring", c: hip, r: 0.04, width: 0.01, density: 2, bright: 1.1 },
    {
      kind: "ellipse",
      c: [0.05, 0.79],
      rx: 0.46,
      ry: 0.16,
      fill: false,
      from: Math.PI,
      to: Math.PI * 2,
      dots: 34,
      density: 0.6,
      bright: 0.55,
    },
    seg([-0.85, 0.84], [0.85, 0.84], 0.006, { density: 0.5, bright: 0.35 }),
  ];
}

function terranova(): Primitive[] {
  const ground: Vec[] = [];
  for (let i = 0; i <= 24; i++) {
    const x = -1 + (i / 24) * 2;
    ground.push([x, 0.06 - 0.12 * Math.exp(-(x * x) / 0.18)]);
  }
  const strata = [0.36, 0.56, 0.78].flatMap((y, s) => {
    const pts: Vec[] = [];
    for (let i = 0; i <= 16; i++) {
      const x = -1 + (i / 16) * 2;
      pts.push([x, y + Math.sin(x * 3 + s) * 0.02]);
    }
    return polyline(pts, 0.008, { density: 0.35, bright: 0.35 });
  });
  const houseLeft = -0.32;
  const houseRight = 0.06;
  const floor = -0.07;
  const eave = -0.32;
  return [
    ...polyline(ground, 0.02, { density: 1.6 }),
    ...strata,
    { kind: "ellipse", c: [0, 0.21], rx: 0.55, ry: 0.07, fill: true, density: 1.1, bright: 1.15 },
    seg([-0.55, 0.21], [-0.85, 0.27], 0.01, { density: 0.7, bright: 0.6 }),
    seg([0.55, 0.21], [0.82, 0.16], 0.01, { density: 0.7, bright: 0.6 }),
    seg([houseLeft, floor], [houseLeft, eave], 0.015, { density: 1.6 }),
    seg([houseRight, floor], [houseRight, eave], 0.015, { density: 1.6 }),
    seg([houseLeft, eave], [houseRight, eave], 0.015, { density: 1.4 }),
    seg([houseLeft - 0.05, eave], [-0.13, -0.53], 0.015, { density: 1.6 }),
    seg([-0.13, -0.53], [houseRight + 0.05, eave], 0.015, { density: 1.6 }),
    { kind: "disc", c: [-0.21, -0.2], r: 0.04, density: 1.5, bright: 1.3 },
    seg([-0.04, floor], [-0.04, -0.2], 0.04, { density: 0.8, bright: 0.6 }),
    seg([0.6, -0.62], [0.6, -0.02], 0.022, { density: 1.8 }),
    seg([0.6, -0.62], [0.46, -0.44], 0.014, { density: 1.2 }),
    seg([0.5, -0.02], [0.8, -0.02], 0.05, { density: 1.6 }),
    seg([0.6, 0.0], [0.55, 0.2], 0.008, { density: 1.2, bright: 0.8, dots: 10 }),
    { kind: "disc", c: [-0.7, -0.17], r: 0.08, density: 0.9, bright: 0.7 },
    seg([-0.7, -0.1], [-0.7, 0.02], 0.012, { density: 0.8, bright: 0.6 }),
  ];
}

function echo(): Primitive[] {
  const people: { x: number; h: number }[] = [
    { x: -0.82, h: 1.0 },
    { x: -0.5, h: 1.15 },
    { x: -0.18, h: 0.75 },
    { x: 0.1, h: 1.2 },
    { x: 0.42, h: 1.05 },
    { x: 0.74, h: 0.85 },
  ];
  const ground = 0.85;
  const figures = people.flatMap(({ x, h }) => {
    const top = ground - h;
    const headR = 0.055 + h * 0.02;
    const neck = top + headR * 2.2;
    const waist = ground - h * 0.45;
    return [
      { kind: "ring", c: [x, top + headR], r: headR, width: 0.02, density: 1.6 } as Primitive,
      seg([x, neck], [x, waist], 0.1 * h, { density: 1.6 }),
      seg([x - 0.05, neck + 0.03], [x - 0.09, waist - 0.02], 0.025, { density: 0.8, bright: 0.7 }),
      seg([x + 0.05, neck + 0.03], [x + 0.09, waist - 0.02], 0.025, { density: 0.8, bright: 0.7 }),
      seg([x - 0.02, waist], [x - 0.05, ground], 0.035, { density: 1.1 }),
      seg([x + 0.02, waist], [x + 0.05, ground], 0.035, { density: 1.1 }),
    ];
  });
  const nodes: Vec[] = [
    [-0.7, -0.62],
    [-0.35, -0.86],
    [-0.05, -0.58],
    [0.28, -0.88],
    [0.6, -0.6],
    [0.86, -0.82],
  ];
  const nodePrims = nodes.flatMap((c) => [
    { kind: "disc", c, r: 0.03, density: 5, bright: 1.4 } as Primitive,
    { kind: "ring", c, r: 0.065, width: 0.006, density: 0.8, bright: 0.5 } as Primitive,
  ]);
  const edges: [number, number][] = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    [0, 2],
    [2, 4],
    [1, 3],
  ];
  const edgePrims = edges.map(([a, b]) =>
    seg(nodes[a], nodes[b], 0.006, { density: 0.7, bright: 0.55 }),
  );
  const tethers = people.map(({ x, h }, i) => {
    const node = nodes[Math.min(nodes.length - 1, i)];
    return seg(node, [x, ground - h - 0.02], 0.004, { density: 0.35, bright: 0.35, dots: 14 });
  });
  return [...figures, ...nodePrims, ...edgePrims, ...tethers];
}

const ORBITS = [
  { rx: 0.98, ry: 0.26, tilt: -0.32, speed: 0.11 },
  { rx: 0.86, ry: 0.36, tilt: 0.42, speed: -0.08 },
  { rx: 1.08, ry: 0.18, tilt: 0.08, speed: 0.06 },
];

const GLOBE = { cx: 0, cy: 0.04, r: 0.6 };

function buildSpace(shape: ShapeData, rng: Rng): void {
  const count = shape.count;
  const globeCount = Math.floor(count * 0.62);
  const orbitPathCount = Math.floor(count * 0.24);
  const orbiterCount = count - globeCount - orbitPathCount;

  for (let i = 0; i < globeCount; i++) {
    const y = 1 - ((i + 0.5) / globeCount) * 2;
    const lon = i * 2.399963;
    const lat = Math.asin(y);
    shape.kind[i] = KIND_GLOBE;
    shape.params[i * 4] = lon;
    shape.params[i * 4 + 1] = lat;
    shape.bright[i] = 0.55 + rng() * 0.35;
  }

  const orbitPrims: Primitive[] = ORBITS.map((o) => ({
    kind: "ellipse",
    c: [GLOBE.cx, GLOBE.cy],
    rx: o.rx,
    ry: o.ry,
    tilt: o.tilt,
    fill: false,
    dots: 90,
    bright: 0.45,
  }));
  fillFromPrimitives(shape, globeCount, orbitPathCount, orbitPrims, rng);

  for (let k = 0; k < orbiterCount; k++) {
    const i = globeCount + orbitPathCount + k;
    const orbit = k % ORBITS.length;
    const satellite = Math.floor(k / ORBITS.length) % 2;
    shape.kind[i] = KIND_ORBITER;
    shape.params[i * 4] = orbit;
    shape.params[i * 4 + 1] = satellite * Math.PI + gaussian(rng) * 0.03;
    shape.params[i * 4 + 2] = gaussian(rng) * 0.012;
    shape.bright[i] = 1.2 + rng() * 0.3;
  }
}

export function globePoint(lon: number, lat: number, t: number): { x: number; y: number; z: number } {
  const l = lon + t * 0.07;
  const c = Math.cos(lat);
  return {
    x: GLOBE.cx + GLOBE.r * c * Math.sin(l),
    y: GLOBE.cy - GLOBE.r * Math.sin(lat) * 0.98,
    z: c * Math.cos(l),
  };
}

export function orbiterPoint(orbit: number, phase: number, jitter: number, t: number): { x: number; y: number } {
  const o = ORBITS[orbit];
  const theta = phase + t * o.speed;
  const x = Math.cos(theta) * (o.rx + jitter);
  const y = Math.sin(theta) * (o.ry + jitter);
  return {
    x: GLOBE.cx + x * Math.cos(o.tilt) - y * Math.sin(o.tilt),
    y: GLOBE.cy + x * Math.sin(o.tilt) + y * Math.cos(o.tilt),
  };
}

const BUILDERS: Record<Exclude<ChapterId, "space">, () => Primitive[]> = {
  robotics,
  terranova,
  echo,
};

const SEEDS: Record<ChapterId, number> = { robotics: 11, terranova: 23, echo: 37, space: 51 };

export function buildShape(id: ChapterId, count: number, salt = 0): ShapeData {
  const rng = mulberry32(SEEDS[id] * 977 + salt);
  const shape = emptyShape(count);
  if (id === "space") {
    buildSpace(shape, rng);
  } else {
    fillFromPrimitives(shape, 0, count, BUILDERS[id](), rng);
  }
  return shape;
}
