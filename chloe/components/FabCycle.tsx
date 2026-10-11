"use client";

import { useEffect, useRef, useState } from "react";

const WIDTH = 440;
const HEIGHT = 320;
const PITCH = 16;
const COLS = 24;
const ROWS = 9;
const SUBSTRATE_ROWS = 3;
const SUBSTRATE_TOP = 272;
const X0 = (WIDTH - COLS * PITCH) / 2 + PITCH / 2;
const PILLARS: [number, number][] = [
  [3, 6],
  [10, 13],
  [17, 20],
];

const FALL = 0.7;
const MASK_IN = [4.0, 4.6];
const MASK_OUT = [8.6, 9.4];
const ION = 0.35;
const EJECT = 0.6;
const ANNEAL = 0.5;
const FADE = [12.4, 13.0];
const LOOP = 13.2;
const RESTING = 12.2;

const STEPS = ["Deposit", "Pattern", "Etch", "Anneal"] as const;

type Atom = {
  latticeX: number;
  latticeY: number;
  x: number;
  y: number;
  drift: number;
  land: number;
  etch: number | null;
  crystal: number | null;
  scatter: number;
};

type Palette = { ink: string; muted: Rgb; accent: Rgb };
type Rgb = [number, number, number];

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function columnX(col: number) {
  return X0 + col * PITCH;
}

function rowY(row: number) {
  return SUBSTRATE_TOP - (row + 1) * PITCH;
}

function isPillar(col: number) {
  return PILLARS.some(([from, to]) => col >= from && col <= to);
}

function buildAtoms(): Atom[] {
  const rand = seeded(11);
  const atoms: Atom[] = [];
  for (let col = 0; col < COLS; col++) {
    for (let row = 0; row < ROWS; row++) {
      const pillar = isPillar(col);
      atoms.push({
        latticeX: columnX(col),
        latticeY: rowY(row),
        x: columnX(col) + (rand() - 0.5) * PITCH * 0.6,
        y: rowY(row) + (rand() - 0.5) * PITCH * 0.6,
        drift: (rand() - 0.5) * 24,
        land: 0.9 + ((row + rand() * 0.9) / ROWS) * 3.0,
        etch: pillar ? null : 5.6 + ((ROWS - 1 - row + rand() * 0.9) / ROWS) * 2.4,
        crystal: pillar ? 9.6 + ((row + rand() * 0.9) / ROWS) * 2.0 : null,
        scatter: (rand() - 0.5) * 30,
      });
    }
  }
  return atoms;
}

const ATOMS = buildAtoms();

function clamp01(v: number) {
  return Math.min(1, Math.max(0, v));
}

function ease(v: number) {
  return v * v * (3 - 2 * v);
}

function progress(t: number, [from, to]: number[]) {
  return clamp01((t - from) / (to - from));
}

function hexToRgb(hex: string): Rgb {
  const value = hex.trim().replace("#", "");
  return [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16)) as Rgb;
}

function rgba([r, g, b]: Rgb, alpha: number) {
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function mix(a: Rgb, b: Rgb, k: number, alpha: number) {
  return rgba(a.map((v, i) => Math.round(v + (b[i] - v) * k)) as Rgb, alpha);
}

function readPalette(el: HTMLElement): Palette {
  const css = getComputedStyle(el);
  return {
    ink: css.getPropertyValue("--ink").trim(),
    muted: hexToRgb(css.getPropertyValue("--muted")),
    accent: hexToRgb(css.getPropertyValue("--accent")),
  };
}

function stepAt(t: number) {
  if (t < MASK_IN[0] || t >= FADE[1]) return 0;
  if (t < 5.5) return 1;
  if (t < MASK_OUT[1]) return 2;
  return 3;
}

function dot(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function draw(ctx: CanvasRenderingContext2D, t: number, palette: Palette) {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  ctx.fillStyle = palette.ink;
  ctx.globalAlpha = 0.8;
  for (let row = 0; row < SUBSTRATE_ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      dot(ctx, columnX(col), SUBSTRATE_TOP + row * PITCH, 2.2);
    }
  }
  ctx.globalAlpha = 1;

  const fade = 1 - progress(t, FADE);
  const filmTop = rowY(ROWS - 1) - PITCH * 0.75;

  for (const atom of ATOMS) {
    if (t < atom.land - FALL) continue;

    let x = atom.x;
    let y = atom.y;
    let alpha = fade;
    let crystal = 0;

    if (t < atom.land) {
      const k = (t - (atom.land - FALL)) / FALL;
      y = -10 + (atom.y + 10) * k * k;
      x = atom.x + atom.drift * (1 - k);
    }

    if (atom.etch !== null) {
      if (t >= atom.etch + EJECT) continue;
      if (t >= atom.etch - ION && t < atom.etch) {
        const k = (t - (atom.etch - ION)) / ION;
        const ionY = -10 + (atom.y - 6 + 10) * k;
        ctx.strokeStyle = rgba(palette.accent, 0.75);
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(atom.latticeX, ionY - 9);
        ctx.lineTo(atom.latticeX, ionY);
        ctx.stroke();
      }
      if (t >= atom.etch) {
        const k = (t - atom.etch) / EJECT;
        y -= 34 * ease(k);
        x += atom.scatter * k;
        alpha *= 1 - k;
      }
    }

    if (atom.crystal !== null && t >= atom.crystal) {
      crystal = ease(clamp01((t - atom.crystal) / ANNEAL));
      x += (atom.latticeX - x) * crystal;
      y += (atom.latticeY - y) * crystal;
    }

    ctx.fillStyle = mix(palette.muted, palette.accent, crystal, alpha * (0.7 + 0.3 * crystal));
    dot(ctx, x, y, 2 + 0.6 * crystal);
  }

  const maskAlpha = progress(t, MASK_IN) * (1 - progress(t, MASK_OUT));
  if (maskAlpha > 0) {
    const drop = (1 - ease(progress(t, MASK_IN))) * -14 - ease(progress(t, MASK_OUT)) * 10;
    ctx.globalAlpha = maskAlpha;
    for (const [from, to] of PILLARS) {
      const left = columnX(from) - PITCH / 2 + 1;
      const width = (to - from + 1) * PITCH - 2;
      const top = filmTop - 6 + drop;
      ctx.fillStyle = rgba(palette.muted, 0.14);
      ctx.strokeStyle = palette.ink;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(left, top, width, 6, 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
}

export function FabCycle() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const palette = readPalette(canvas);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let time = 0;
    let last = 0;
    let frame = 0;
    let visible = true;
    let currentStep = 0;

    const render = () => draw(ctx, reduced ? RESTING : time, palette);

    const resize = () => {
      const width = canvas.clientWidth;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(width * (HEIGHT / WIDTH) * dpr);
      const scale = (width / WIDTH) * dpr;
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      render();
    };

    const tick = (now: number) => {
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
      last = now;
      time = (time + dt) % LOOP;
      const next = stepAt(time);
      if (next !== currentStep) {
        currentStep = next;
        setStep(next);
      }
      render();
      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      if (reduced || frame || !visible || document.hidden) return;
      last = 0;
      frame = requestAnimationFrame(tick);
    };

    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    const viewport = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    });
    viewport.observe(canvas);

    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);

    if (reduced) setStep(STEPS.length - 1);
    resize();
    start();

    return () => {
      stop();
      observer.disconnect();
      viewport.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <figure className="fab">
      <canvas
        ref={canvasRef}
        className="fab__canvas"
        style={{ aspectRatio: `${WIDTH} / ${HEIGHT}` }}
        role="img"
        aria-label="Animation of a thin film being deposited atom by atom, etched into pillars, and annealed into crystal"
      />
      <figcaption className="fab__steps" aria-hidden="true">
        {STEPS.map((label, i) => (
          <span key={label} className={i === step ? "fab__step fab__step--active" : "fab__step"}>
            {String(i + 1).padStart(2, "0")} {label}
          </span>
        ))}
      </figcaption>
    </figure>
  );
}
