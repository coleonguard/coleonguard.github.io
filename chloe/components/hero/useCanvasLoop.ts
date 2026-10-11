"use client";

import { useEffect, useRef, type RefObject } from "react";

export type Rgb = [number, number, number];
export type Point = [number, number];
export type Palette = { ink: Rgb; muted: Rgb; faint: Rgb; accent: Rgb };

export type Frame = {
  t: number;
  dt: number;
  still: boolean;
  pointer: Point | null;
  palette: Palette;
  width: number;
  height: number;
};

export type Draw = (ctx: CanvasRenderingContext2D, frame: Frame) => void;


export function rgba([r, g, b]: Rgb, alpha: number) {
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function mix(a: Rgb, b: Rgb, k: number): Rgb {
  return a.map((v, i) => Math.round(v + (b[i] - v) * k)) as Rgb;
}

export function clamp01(v: number) {
  return Math.min(1, Math.max(0, v));
}

export function smooth(v: number) {
  const c = clamp01(v);
  return c * c * (3 - 2 * c);
}

export function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function hexToRgb(hex: string): Rgb {
  const value = hex.trim().replace("#", "");
  return [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16)) as Rgb;
}

function readPalette(el: HTMLElement): Palette {
  const css = getComputedStyle(el);
  const read = (name: string) => hexToRgb(css.getPropertyValue(name));
  return { ink: read("--ink"), muted: read("--muted"), faint: read("--faint"), accent: read("--accent") };
}

export function useCanvasLoop(draw: Draw, pointerTarget: RefObject<HTMLElement | null>) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawRef = useRef(draw);

  useEffect(() => {
    drawRef.current = draw;
  }, [draw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const palette = readPalette(canvas);
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const listener = pointerTarget.current ?? canvas;
    let width = canvas.clientWidth;
    let height = canvas.clientHeight;
    let pointer: Point | null = null;
    let time = 0;
    let last = 0;
    let frame = 0;
    let visible = true;

    const render = (dt: number) => {
      ctx.clearRect(0, 0, width, height);
      drawRef.current(ctx, { t: time, dt, still, pointer: still ? null : pointer, palette, width, height });
    };

    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      render(0);
    };

    const tick = (now: number) => {
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
      last = now;
      time += dt;
      render(dt);
      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      if (still || frame || !visible || document.hidden) return;
      last = 0;
      frame = requestAnimationFrame(tick);
    };

    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };

    const onPointer = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer = [((event.clientX - rect.left) / rect.width) * width, ((event.clientY - rect.top) / rect.height) * height];
    };
    const onLeave = () => {
      pointer = null;
    };

    listener.addEventListener("pointermove", onPointer);
    listener.addEventListener("pointerdown", onPointer);
    listener.addEventListener("pointerleave", onLeave);
    listener.addEventListener("pointercancel", onLeave);

    const sizes = new ResizeObserver(resize);
    sizes.observe(canvas);

    const viewport = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    });
    viewport.observe(canvas);

    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);

    resize();
    start();

    return () => {
      stop();
      sizes.disconnect();
      viewport.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      listener.removeEventListener("pointermove", onPointer);
      listener.removeEventListener("pointerdown", onPointer);
      listener.removeEventListener("pointerleave", onLeave);
      listener.removeEventListener("pointercancel", onLeave);
    };
  }, [pointerTarget]);

  return canvasRef;
}
