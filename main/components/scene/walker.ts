/**
 * A walking figure with a prosthetic far leg and a robotic near arm. Particles are bound to
 * parts of a skeleton whose pose is recomputed from time, so the figure walks in place.
 * Coordinates use the same normalized, y-down space as the other forms.
 */

const JOINTS = [
  "hip",
  "shoulder",
  "neck",
  "head",
  "kneeNear",
  "ankleNear",
  "toeNear",
  "kneeFar",
  "ankleFar",
  "toeFar",
  "elbowFar",
  "handFar",
  "elbowRobot",
  "wristRobot",
  "gripUpper",
  "gripUpperTip",
  "gripLower",
  "gripLowerTip",
] as const;

type Joint = (typeof JOINTS)[number];

const J = Object.fromEntries(JOINTS.map((name, i) => [name, i])) as Record<Joint, number>;

type RigPart =
  | { kind: "bone"; a: Joint; b: Joint; width: number; shift?: number; density?: number; bright?: number }
  | { kind: "ring"; c: Joint; r: number; width: number; density?: number; bright?: number }
  | { kind: "disc"; c: Joint; r: number; density?: number; bright?: number };

const FAR = 0.55;
const ROBOT = 1.25;
const RAIL = 0.02;

const PARTS: RigPart[] = [
  { kind: "ring", c: "head", r: 0.1, width: 0.022, density: 1.8, bright: 1.1 },
  { kind: "disc", c: "head", r: 0.08, density: 0.35, bright: 0.55 },
  { kind: "bone", a: "neck", b: "shoulder", width: 0.04, density: 1.4, bright: 1.1 },
  { kind: "bone", a: "shoulder", b: "hip", width: 0.06, density: 3, bright: 1.15 },

  { kind: "bone", a: "shoulder", b: "elbowFar", width: 0.026, density: 1.1, bright: FAR },
  { kind: "bone", a: "elbowFar", b: "handFar", width: 0.024, density: 1.1, bright: FAR },

  { kind: "bone", a: "hip", b: "kneeFar", width: 0.04, density: 1.4, bright: FAR + 0.2 },
  { kind: "ring", c: "kneeFar", r: 0.042, width: 0.01, density: 2, bright: ROBOT },
  { kind: "bone", a: "kneeFar", b: "ankleFar", width: 0.012, density: 2.4, bright: ROBOT },
  { kind: "bone", a: "ankleFar", b: "toeFar", width: 0.016, density: 2, bright: ROBOT },

  { kind: "bone", a: "hip", b: "kneeNear", width: 0.034, density: 2.2, bright: 1.15 },
  { kind: "bone", a: "kneeNear", b: "ankleNear", width: 0.028, density: 2.1, bright: 1.15 },
  { kind: "bone", a: "ankleNear", b: "toeNear", width: 0.02, density: 1.8, bright: 1.1 },

  { kind: "ring", c: "shoulder", r: 0.045, width: 0.01, density: 2, bright: ROBOT },
  { kind: "bone", a: "shoulder", b: "elbowRobot", width: 0.006, shift: RAIL, density: 1.6, bright: ROBOT },
  { kind: "bone", a: "shoulder", b: "elbowRobot", width: 0.006, shift: -RAIL, density: 1.6, bright: ROBOT },
  { kind: "ring", c: "elbowRobot", r: 0.034, width: 0.01, density: 2, bright: ROBOT },
  { kind: "bone", a: "elbowRobot", b: "wristRobot", width: 0.006, shift: RAIL * 0.8, density: 1.6, bright: ROBOT },
  { kind: "bone", a: "elbowRobot", b: "wristRobot", width: 0.006, shift: -RAIL * 0.8, density: 1.6, bright: ROBOT },
  { kind: "ring", c: "wristRobot", r: 0.026, width: 0.008, density: 2, bright: ROBOT },
  { kind: "bone", a: "wristRobot", b: "gripUpper", width: 0.008, density: 2.4, bright: ROBOT },
  { kind: "bone", a: "gripUpper", b: "gripUpperTip", width: 0.008, density: 2.4, bright: ROBOT },
  { kind: "bone", a: "wristRobot", b: "gripLower", width: 0.008, density: 2.4, bright: ROBOT },
  { kind: "bone", a: "gripLower", b: "gripLowerTip", width: 0.008, density: 2.4, bright: ROBOT },
];

const THIGH = 0.42;
const SHIN = 0.42;
const UPPER_ARM = 0.27;
const FOREARM = 0.25;
const CADENCE = 2.3;

const pose = new Float32Array(JOINTS.length * 2);
let poseTime = Number.NaN;

function set(joint: Joint, x: number, y: number): void {
  pose[J[joint] * 2] = x;
  pose[J[joint] * 2 + 1] = y;
}

function px(joint: Joint): number {
  return pose[J[joint] * 2];
}

function py(joint: Joint): number {
  return pose[J[joint] * 2 + 1];
}

function setLeg(phase: number, knee: Joint, ankle: Joint, toe: Joint): void {
  const thigh = 0.42 * Math.sin(phase);
  const swing = Math.max(0, Math.cos(phase));
  const shin = thigh - (0.1 + 0.75 * swing * swing);
  const kx = px("hip") + THIGH * Math.sin(thigh);
  const ky = py("hip") + THIGH * Math.cos(thigh);
  const ax = kx + SHIN * Math.sin(shin);
  const ay = ky + SHIN * Math.cos(shin);
  const footPitch = shin * 0.5;
  set(knee, kx, ky);
  set(ankle, ax, ay);
  set(toe, ax + 0.13 * Math.cos(footPitch), ay - 0.13 * Math.sin(footPitch) + 0.02);
}

function setArm(phase: number, elbow: Joint, hand: Joint): void {
  const upper = 0.36 * Math.sin(phase);
  const lower = upper + 0.35 + 0.15 * Math.max(0, Math.sin(phase));
  const ex = px("shoulder") + UPPER_ARM * Math.sin(upper);
  const ey = py("shoulder") + UPPER_ARM * Math.cos(upper);
  set(elbow, ex, ey);
  set(hand, ex + FOREARM * Math.sin(lower), ey + FOREARM * Math.cos(lower));
}

function computePose(t: number): void {
  if (t === poseTime) return;
  poseTime = t;
  const phase = t * CADENCE;
  const bob = 0.018 * Math.cos(2 * phase);

  set("hip", 0, -0.05 + bob);
  set("shoulder", 0.05, -0.49 + bob);
  set("neck", 0.065, -0.56 + bob);
  set("head", 0.09, -0.69 + bob);

  setLeg(phase, "kneeNear", "ankleNear", "toeNear");
  setLeg(phase + Math.PI, "kneeFar", "ankleFar", "toeFar");
  setArm(phase, "elbowFar", "handFar");
  setArm(phase + Math.PI, "elbowRobot", "wristRobot");

  const dx = px("wristRobot") - px("elbowRobot");
  const dy = py("wristRobot") - py("elbowRobot");
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const nx = -uy;
  const ny = ux;
  const wx = px("wristRobot");
  const wy = py("wristRobot");
  const open = 0.03 + 0.012 * Math.sin(phase * 2);
  set("gripUpper", wx + ux * 0.06 + nx * open, wy + uy * 0.06 + ny * open);
  set("gripUpperTip", wx + ux * 0.11 + nx * open * 0.4, wy + uy * 0.11 + ny * open * 0.4);
  set("gripLower", wx + ux * 0.06 - nx * open, wy + uy * 0.06 - ny * open);
  set("gripLowerTip", wx + ux * 0.11 - nx * open * 0.4, wy + uy * 0.11 - ny * open * 0.4);
}

function partMass(part: RigPart): number {
  const density = part.density ?? 1;
  switch (part.kind) {
    case "bone":
      return Math.hypot(px(part.b) - px(part.a), py(part.b) - py(part.a)) * density;
    case "ring":
      return 2 * Math.PI * part.r * density;
    case "disc":
      return Math.PI * part.r * part.r * 6 * density;
    default: {
      const exhaustive: never = part;
      return exhaustive;
    }
  }
}

export type RigSample = { part: number; u: number; offset: number; bright: number };

/** Distributes `count` samples across the rig in proportion to each part's size. */
export function sampleRig(count: number, rng: () => number, gaussian: () => number): RigSample[] {
  computePose(0);
  const masses = PARTS.map(partMass);
  const total = masses.reduce((sum, m) => sum + m, 0);
  const samples: RigSample[] = [];
  PARTS.forEach((part, index) => {
    const n =
      index === PARTS.length - 1 ? count - samples.length : Math.round((masses[index] / total) * count);
    for (let k = 0; k < n && samples.length < count; k++) {
      const bright = (part.bright ?? 1) * (0.65 + rng() * 0.35);
      switch (part.kind) {
        case "bone":
          samples.push({ part: index, u: rng(), offset: (part.shift ?? 0) + gaussian() * part.width * 0.5, bright });
          break;
        case "ring":
          samples.push({ part: index, u: rng() * Math.PI * 2, offset: gaussian() * part.width * 0.5, bright });
          break;
        case "disc":
          samples.push({ part: index, u: rng() * Math.PI * 2, offset: Math.sqrt(rng()) * part.r, bright });
          break;
        default: {
          const exhaustive: never = part;
          return exhaustive;
        }
      }
    }
  });
  return samples;
}

export function rigPoint(partIndex: number, u: number, offset: number, t: number): { x: number; y: number } {
  computePose(t);
  const part = PARTS[partIndex];
  switch (part.kind) {
    case "bone": {
      const ax = px(part.a);
      const ay = py(part.a);
      const dx = px(part.b) - ax;
      const dy = py(part.b) - ay;
      const len = Math.hypot(dx, dy) || 1;
      return { x: ax + dx * u - (dy / len) * offset, y: ay + dy * u + (dx / len) * offset };
    }
    case "ring":
      return { x: px(part.c) + Math.cos(u) * (part.r + offset), y: py(part.c) + Math.sin(u) * (part.r + offset) };
    case "disc":
      return { x: px(part.c) + Math.cos(u) * offset, y: py(part.c) + Math.sin(u) * offset };
    default: {
      const exhaustive: never = part;
      return exhaustive;
    }
  }
}
