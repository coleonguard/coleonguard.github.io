"use client";

import { useEffect, useRef, useState } from "react";
import { handoff } from "@/components/canvas/handoff";
import { clamp01, rgba, seeded, smooth, useCanvasLoop, type Draw, type Point } from "@/components/canvas/useCanvasLoop";

type Dot = { home: Point; from: Point; radius: number; delay: number };

const PITCH = 5;
const MAX_RADIUS = PITCH * 0.56;
const SAMPLE = 2;
const MIN_DARKNESS = 0.08;
const SCATTER = 260;
const PHOTO_FADE = 4;
const VIGNETTE_INNER = 0.3;
const VIGNETTE_OUTER = 0.5;
const LEVEL_CLIP = 0.04;
const PHOTO_GAMMA = 2;
const BLUR = 4;
const SHARPEN = 1.8;
const LIFT_SPAN = 0.15;
const FILM_RADIUS = 1.9;

function drawPlaceholder(ctx: CanvasRenderingContext2D, size: number) {
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, size, size);
  const shade = (x: number, y: number, r: number) => {
    const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.1, x, y, r * 1.1);
    g.addColorStop(0, "#9a9a9a");
    g.addColorStop(1, "#1a1a1a");
    return g;
  };
  ctx.fillStyle = shade(size * 0.5, size * 0.88, size * 0.42);
  ctx.beginPath();
  ctx.moveTo(size * 0.08, size);
  ctx.bezierCurveTo(size * 0.1, size * 0.74, size * 0.3, size * 0.66, size * 0.5, size * 0.66);
  ctx.bezierCurveTo(size * 0.7, size * 0.66, size * 0.9, size * 0.74, size * 0.92, size);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = shade(size * 0.5, size * 0.4, size * 0.2);
  ctx.beginPath();
  ctx.ellipse(size * 0.5, size * 0.4, size * 0.17, size * 0.21, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawCover(ctx: CanvasRenderingContext2D, image: HTMLImageElement, size: number) {
  const scale = Math.max(size / image.naturalWidth, size / image.naturalHeight);
  const w = image.naturalWidth * scale;
  const h = image.naturalHeight * scale;
  ctx.drawImage(image, (size - w) / 2, (size - h) / 2, w, h);
}

// Photos fade to nothing past VIGNETTE_OUTER (as a fraction of the frame) so a busy background drops away.
function vignette(x: number, y: number, size: number) {
  const r = Math.hypot(x - size / 2, y - size * 0.46) / size;
  return 1 - smooth((r - VIGNETTE_INNER) / (VIGNETTE_OUTER - VIGNETTE_INNER));
}

function sampleDots(source: CanvasRenderingContext2D, size: number, photo: boolean): Dot[] {
  const { data } = source.getImageData(0, 0, size, size);
  const rand = seeded(7);
  const rowStep = PITCH * 0.866;
  const cols = Math.ceil(size / PITCH);
  const rows = Math.ceil(size / rowStep);
  const cells: { x: number; y: number; luminance: number }[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = Math.min(size - 1, col * PITCH + (row % 2 ? PITCH / 2 : 0) + PITCH / 2);
      const y = Math.min(size - 1, row * rowStep + PITCH / 2);
      let sum = 0;
      let count = 0;
      for (let dy = -SAMPLE; dy <= SAMPLE; dy++) {
        for (let dx = -SAMPLE; dx <= SAMPLE; dx++) {
          const px = Math.min(size - 1, Math.max(0, Math.floor(x + dx)));
          const py = Math.min(size - 1, Math.max(0, Math.floor(y + dy)));
          const i = (py * size + px) * 4;
          sum += (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255;
          count++;
        }
      }
      cells.push({ x, y, luminance: sum / count });
    }
  }

  // Unsharp mask on the cell grid: backlit faces sit in flat midtones, so lift the local detail.
  if (photo) {
    const base = cells.map((c) => c.luminance);
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        let sum = 0;
        let count = 0;
        for (let dr = -BLUR; dr <= BLUR; dr++) {
          for (let dc = -BLUR; dc <= BLUR; dc++) {
            const r = row + dr;
            const c = col + dc;
            if (r < 0 || r >= rows || c < 0 || c >= cols) continue;
            sum += base[r * cols + c];
            count++;
          }
        }
        const i = row * cols + col;
        cells[i].luminance = base[i] + SHARPEN * (base[i] - sum / count);
      }
    }
  }

  // Stretch the photo's own tonal range so a midtone-heavy shot still separates face from shadow.
  const inside = cells.filter((c) => vignette(c.x, c.y, size) > 0.5).map((c) => c.luminance).sort((a, b) => a - b);
  const low = inside[Math.floor(inside.length * LEVEL_CLIP)] ?? 0;
  const high = inside[Math.floor(inside.length * (1 - LEVEL_CLIP))] ?? 1;

  const dots: Dot[] = [];
  for (const { x, y, luminance } of cells) {
    const darkness = photo
      ? Math.pow(1 - clamp01((luminance - low) / Math.max(0.01, high - low)), PHOTO_GAMMA) * vignette(x, y, size)
      : 1 - luminance;
    if (darkness < MIN_DARKNESS) continue;
    const angle = rand() * Math.PI * 2;
    const distance = SCATTER * (0.4 + rand() * 0.6);
    dots.push({
      home: [x, y],
      from: [x + Math.cos(angle) * distance, y + Math.sin(angle) * distance],
      radius: MAX_RADIUS * Math.pow(darkness, 0.8),
      delay: rand() * 0.35,
    });
  }
  return dots;
}

export function Portrait({ src, alt }: { src: string | null; alt: string }) {
  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<Dot[]>([]);
  const sizeRef = useRef(0);
  const photoRef = useRef<HTMLImageElement | null>(null);

  const [draw] = useState(() => {
    let hover = 0;
    const render: Draw = (ctx, { dt, still, pointer, palette }) => {
      const frame = frameRef.current;
      const story = document.getElementById("story");
      if (!frame || !sizeRef.current) return;
      const canvasBox = ctx.canvas.getBoundingClientRect();
      const frameBox = frame.getBoundingClientRect();
      const left = frameBox.left - canvasBox.left;
      const top = frameBox.top - canvasBox.top;
      const size = frameBox.width;
      const scale = size / sizeRef.current;
      const view = window.innerHeight;
      const progress = still ? 1 : clamp01((view - frameBox.top) / (view * 0.75));
      const lift = still ? 0 : smooth(progress / LIFT_SPAN);
      handoff.lift = lift;

      const film = handoff.film;
      const filmBottom = story ? story.getBoundingClientRect().bottom - canvasBox.top : null;
      const inFrame =
        pointer && pointer[0] >= left && pointer[0] <= left + size && pointer[1] >= top && pointer[1] <= top + size;
      hover = clamp01(hover + (inFrame && photoRef.current ? dt : -dt) * PHOTO_FADE);

      if (progress > 0) {
        ctx.fillStyle = rgba(palette.accent, 1 - hover * 0.85);
        const dots = dotsRef.current;
        for (let i = 0; i < dots.length; i++) {
          const dot = dots[i];
          const k = smooth((progress - dot.delay) / 0.65);
          const home: Point = [left + dot.home[0] * scale, top + dot.home[1] * scale];
          let from: Point = [left + dot.from[0] * scale, top + dot.from[1] * scale];
          let rest = 0;
          if (film.length && filmBottom !== null) {
            const [fx, fy] = film[i % film.length];
            from = [fx - canvasBox.left, filmBottom - fy];
            rest = handoff.filmAlpha[i % film.length] ?? 1;
          }
          const alpha = rest + (1 - rest) * k;
          if (alpha <= 0) continue;
          const u = 1 - k;
          const x = u * u * from[0] + 2 * u * k * from[0] + k * k * home[0];
          const y = u * u * from[1] + 2 * u * k * home[1] + k * k * home[1];
          ctx.globalAlpha = k > 0 ? alpha : alpha * lift;
          ctx.beginPath();
          ctx.arc(x, y, FILM_RADIUS + (dot.radius * scale - FILM_RADIUS) * k, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      if (hover > 0 && photoRef.current) {
        ctx.save();
        ctx.globalAlpha = hover;
        ctx.translate(left, top);
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.clip();
        drawCover(ctx, photoRef.current, size);
        ctx.restore();
      }
    };
    return render;
  });
  const canvasRef = useCanvasLoop(draw, sectionRef);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const size = frame.clientWidth;
    const scratch = document.createElement("canvas");
    scratch.width = size;
    scratch.height = size;
    const ctx = scratch.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    sizeRef.current = size;

    if (!src) {
      drawPlaceholder(ctx, size);
      dotsRef.current = sampleDots(ctx, size, false);
      return;
    }
    const image = new Image();
    image.onload = () => {
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, size, size);
      drawCover(ctx, image, size);
      dotsRef.current = sampleDots(ctx, size, true);
      photoRef.current = image;
    };
    image.src = src;
  }, [src]);

  return (
    <section ref={sectionRef} className="section portrait" aria-label="Portrait">
      <canvas ref={canvasRef} className="portrait__canvas" role="img" aria-label={alt} />
      <div ref={frameRef} className="portrait__frame" />
      {src ? null : <p className="eyebrow portrait__caption">Photo coming soon</p>}
    </section>
  );
}
