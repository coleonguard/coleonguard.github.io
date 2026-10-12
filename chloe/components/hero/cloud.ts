import { clamp01, mix, rgba, seeded, smooth, type Palette, type Point } from "@/components/canvas/useCanvasLoop";

export const CLOUD_WIDTH = 440;
export const CLOUD_HEIGHT = 330;

const SPACING = 17;
const REACH = 95;
const CORE = 25;
const KICK_RADIUS = 70;

type Atom = { lx: number; ly: number; hx: number; hy: number; phase: number; order: number; kx: number; ky: number };

export type Cloud = {
  update: (t: number, dt: number, seed: Point | null) => void;
  kick: (point: Point, strength: number) => void;
  draw: (ctx: CanvasRenderingContext2D, palette: Palette) => void;
};

export function createCloud(): Cloud {
  const rand = seeded(5);
  const atoms: Atom[] = [];
  const index = new Map<string, number>();
  const rowStep = SPACING * 0.866;
  const rows = Math.floor(CLOUD_HEIGHT / rowStep) + 1;
  const cols = Math.floor(CLOUD_WIDTH / SPACING) + 1;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const lx = c * SPACING + (r % 2 ? SPACING / 2 : 0) + 4;
      const ly = r * rowStep + 8;
      index.set(`${r},${c}`, atoms.length);
      atoms.push({
        lx,
        ly,
        hx: lx + (rand() - 0.5) * SPACING * 0.9,
        hy: ly + (rand() - 0.5) * SPACING * 0.9,
        phase: rand() * Math.PI * 2,
        order: 0,
        kx: 0,
        ky: 0,
      });
    }
  }

  const bonds: [number, number][] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const a = index.get(`${r},${c}`)!;
      const shift = r % 2 ? 0 : -1;
      for (const key of [`${r},${c + 1}`, `${r + 1},${c + shift}`, `${r + 1},${c + shift + 1}`]) {
        const b = index.get(key);
        if (b !== undefined) bonds.push([a, b]);
      }
    }
  }

  const positions = atoms.map(() => [0, 0, 0] as [number, number, number]);

  return {
    update(t, dt, seed) {
      const target = seed ?? [CLOUD_WIDTH / 2 + Math.sin(t * 0.23) * 140, CLOUD_HEIGHT / 2 + Math.sin(t * 0.37 + 1) * 90];
      const rise = 1 - Math.exp(-dt * 9);
      const decay = 1 - Math.exp(-dt * 0.55);
      const settle = Math.exp(-dt * 3.5);

      atoms.forEach((atom, n) => {
        const d = Math.hypot(atom.lx - target[0], atom.ly - target[1]);
        const pull = smooth(1 - (d - CORE) / (REACH - CORE));
        atom.order += (pull - atom.order) * (pull > atom.order ? rise : decay);
        atom.kx *= settle;
        atom.ky *= settle;

        const wx = atom.hx + Math.sin(t * 0.7 + atom.phase) * 2.2;
        const wy = atom.hy + Math.cos(t * 0.6 + atom.phase * 1.3) * 2.2;
        const k = smooth(atom.order);
        const ex = (atom.lx - CLOUD_WIDTH / 2) / (CLOUD_WIDTH / 2);
        const ey = (atom.ly - CLOUD_HEIGHT / 2) / (CLOUD_HEIGHT / 2);
        const edge = smooth((1 - Math.hypot(ex, ey * 1.05)) / 0.3);
        positions[n] = [wx + (atom.lx - wx) * k + atom.kx, wy + (atom.ly - wy) * k + atom.ky, edge];
      });
    },

    kick([px, py], strength) {
      for (const atom of atoms) {
        const dx = atom.lx - px;
        const dy = atom.ly - py;
        const d = Math.hypot(dx, dy);
        if (d > KICK_RADIUS) continue;
        const falloff = 1 - d / KICK_RADIUS;
        const push = strength * falloff * falloff;
        atom.kx += (dx / (d || 1)) * push;
        atom.ky += (dy / (d || 1)) * push;
        atom.order = Math.max(atom.order, falloff);
      }
    },

    draw(ctx, palette) {
      ctx.lineWidth = 1;
      for (const [a, b] of bonds) {
        const strength = Math.min(atoms[a].order, atoms[b].order);
        if (strength < 0.35) continue;
        const [ax, ay, ae] = positions[a];
        const [bx, by, be] = positions[b];
        ctx.strokeStyle = rgba(palette.accent, clamp01((strength - 0.35) / 0.65) * 0.35 * Math.min(ae, be));
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.stroke();
      }

      atoms.forEach((atom, n) => {
        const [x, y, edge] = positions[n];
        if (edge <= 0) return;
        const k = smooth(atom.order);
        ctx.fillStyle = rgba(mix(palette.muted, palette.accent, k), (0.4 + 0.6 * k) * edge);
        ctx.beginPath();
        ctx.arc(x, y, 1.6 + 1.0 * k, 0, Math.PI * 2);
        ctx.fill();
      });
    },
  };
}
