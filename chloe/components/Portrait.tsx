"use client";

import { useEffect, useRef, useState } from "react";
import { clamp01, rgba, seeded, smooth, useCanvasLoop, type Draw, type Point } from "@/components/canvas/useCanvasLoop";

type Dot = { home: Point; from: Point; radius: number; delay: number };

const PITCH = 7;
const MAX_RADIUS = PITCH * 0.52;
const MIN_DARKNESS = 0.08;
const SCATTER = 260;
const PHOTO_FADE = 4;

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

function sampleDots(source: CanvasRenderingContext2D, size: number): Dot[] {
  const { data } = source.getImageData(0, 0, size, size);
  const rand = seeded(7);
  const dots: Dot[] = [];
  const rowStep = PITCH * 0.866;
  for (let row = 0; row * rowStep < size; row++) {
    for (let col = 0; col * PITCH < size; col++) {
      const x = col * PITCH + (row % 2 ? PITCH / 2 : 0) + PITCH / 2;
      const y = row * rowStep + PITCH / 2;
      if (x >= size || y >= size) continue;
      const i = (Math.floor(y) * size + Math.floor(x)) * 4;
      const luminance = (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255;
      const darkness = (1 - luminance) * (data[i + 3] / 255);
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
  }
  return dots;
}

export function Portrait({ src, alt }: { src: string | null; alt: string }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<Dot[]>([]);
  const sizeRef = useRef(0);
  const photoRef = useRef<HTMLImageElement | null>(null);

  const [draw] = useState(() => {
    let hover = 0;
    const render: Draw = (ctx, { dt, still, pointer, palette, width, height }) => {
      const size = Math.min(width, height);
      if (!size || !sizeRef.current) return;
      const box = ctx.canvas.getBoundingClientRect();
      const view = window.innerHeight;
      const progress = still ? 1 : clamp01((view - box.top) / (view * 0.75));
      const scale = size / sizeRef.current;
      hover = clamp01(hover + (pointer && photoRef.current ? dt : -dt) * PHOTO_FADE);

      ctx.save();
      ctx.scale(scale, scale);
      ctx.fillStyle = rgba(palette.accent, 1 - hover * 0.85);
      for (const dot of dotsRef.current) {
        const k = smooth((progress - dot.delay) / 0.65);
        if (k <= 0) continue;
        const x = dot.from[0] + (dot.home[0] - dot.from[0]) * k;
        const y = dot.from[1] + (dot.home[1] - dot.from[1]) * k;
        ctx.globalAlpha = k;
        ctx.beginPath();
        ctx.arc(x, y, dot.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.restore();

      if (hover > 0 && photoRef.current) {
        ctx.globalAlpha = hover;
        drawCover(ctx, photoRef.current, size);
        ctx.globalAlpha = 1;
      }
    };
    return render;
  });
  const canvasRef = useCanvasLoop(draw, frameRef);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const size = canvas.clientWidth;
    const scratch = document.createElement("canvas");
    scratch.width = size;
    scratch.height = size;
    const ctx = scratch.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    sizeRef.current = size;

    if (!src) {
      drawPlaceholder(ctx, size);
      dotsRef.current = sampleDots(ctx, size);
      return;
    }
    const image = new Image();
    image.onload = () => {
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, size, size);
      drawCover(ctx, image, size);
      dotsRef.current = sampleDots(ctx, size);
      photoRef.current = image;
    };
    image.src = src;
  }, [src, canvasRef]);

  return (
    <section className="section portrait" aria-label="Portrait">
      <div ref={frameRef} className="portrait__frame">
        <canvas ref={canvasRef} className="portrait__canvas" role="img" aria-label={alt} />
      </div>
      {src ? null : <p className="eyebrow portrait__caption">Photo coming soon</p>}
    </section>
  );
}
