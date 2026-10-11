const WIDTH = 440;
const HEIGHT = 320;
const PITCH = 20;
const DOMAIN = { cx: 250, cy: 160, half: 78, angle: Math.PI / 4 };

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function inDomain(x: number, y: number) {
  const dx = x - DOMAIN.cx;
  const dy = y - DOMAIN.cy;
  const cos = Math.cos(-DOMAIN.angle);
  const sin = Math.sin(-DOMAIN.angle);
  const u = dx * cos - dy * sin;
  const v = dx * sin + dy * cos;
  return Math.abs(u) <= DOMAIN.half && Math.abs(v) <= DOMAIN.half;
}

function points() {
  const rand = seeded(7);
  const matrix: [number, number][] = [];
  for (let y = PITCH / 2; y < HEIGHT; y += PITCH) {
    for (let x = PITCH / 2; x < WIDTH; x += PITCH) {
      const jx = x + (rand() - 0.5) * PITCH * 0.7;
      const jy = y + (rand() - 0.5) * PITCH * 0.7;
      if (!inDomain(jx, jy)) matrix.push([jx, jy]);
    }
  }

  const crystal: [number, number][] = [];
  const cos = Math.cos(DOMAIN.angle);
  const sin = Math.sin(DOMAIN.angle);
  for (let v = -DOMAIN.half; v <= DOMAIN.half; v += PITCH * 0.8) {
    for (let u = -DOMAIN.half; u <= DOMAIN.half; u += PITCH * 0.8) {
      crystal.push([DOMAIN.cx + u * cos - v * sin, DOMAIN.cy + u * sin + v * cos]);
    }
  }
  return { matrix, crystal };
}

const { matrix, crystal } = points();

export function Lattice() {
  return (
    <svg className="lattice" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label="An ordered crystal domain inside a disordered field of atoms">
      {matrix.map(([x, y], i) => (
        <circle key={`m${i}`} cx={x} cy={y} r={1.6} className="lattice__amorphous" />
      ))}
      {crystal.map(([x, y], i) => (
        <circle key={`c${i}`} cx={x} cy={y} r={2.2} className="lattice__crystal" style={{ animationDelay: `${(i % 9) * 40 + Math.floor(i / 9) * 40}ms` }} />
      ))}
    </svg>
  );
}
