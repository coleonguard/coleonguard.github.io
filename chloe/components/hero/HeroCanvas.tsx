"use client";

import { useCanvasLoop, type Draw } from "./useCanvasLoop";

export const HERO_WIDTH = 440;
export const HERO_HEIGHT = 330;

export function HeroCanvas({ draw, label, restingTime }: { draw: Draw; label: string; restingTime?: number }) {
  const ref = useCanvasLoop(draw, HERO_WIDTH, HERO_HEIGHT, restingTime);
  return (
    <canvas
      ref={ref}
      className="hero-canvas"
      style={{ aspectRatio: `${HERO_WIDTH} / ${HERO_HEIGHT}` }}
      role="img"
      aria-label={label}
    />
  );
}
