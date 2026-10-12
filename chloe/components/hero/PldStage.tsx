"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { CLOUD_HEIGHT, CLOUD_WIDTH, createCloud } from "./cloud";
import { createPld, type Env } from "./pld";
import { useCanvasLoop, type Draw, type Point } from "@/components/canvas/useCanvasLoop";

type Slot = { x: number; y: number; scale: number };

const SEED_MARGIN = 40;
const STILL_LAYERS = 3;
const CLICK_SLOP = 6;

function createScene(slotRef: { current: Slot }): { draw: Draw; serve: (point: Point) => void } {
  const cloud = createCloud();
  const pld = createPld();
  let prefilled = false;

  const draw: Draw = (ctx, { t, dt, still, pointer, palette, width, height }) => {
    const { x, y, scale } = slotRef.current;
    const toStage = ([lx, ly]: Point): Point => [x + lx * scale, y + ly * scale];
    const local: Point | null = pointer ? [(pointer[0] - x) / scale, (pointer[1] - y) / scale] : null;
    const inside =
      local &&
      local[0] > -SEED_MARGIN &&
      local[0] < CLOUD_WIDTH + SEED_MARGIN &&
      local[1] > -SEED_MARGIN &&
      local[1] < CLOUD_HEIGHT + SEED_MARGIN;
    const env: Env = { width, height, palette, cloud, toStage, slotRight: x + CLOUD_WIDTH * scale };

    if (still && !prefilled) {
      pld.prefill(env, STILL_LAYERS);
      prefilled = true;
    }

    cloud.update(t, dt, inside ? local : null);
    if (!still) pld.update(t, env);

    pld.drawFilm(ctx, t, env);
    pld.drawBeam(ctx, t, palette);
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    cloud.draw(ctx, palette);
    ctx.restore();
    pld.drawImpact(ctx, t, palette);
    pld.drawPlume(ctx, t, env);
    pld.drawBalls(ctx, env);
  };

  return { draw, serve: (point) => pld.serve(point) };
}

export function PldStage({ children }: { children: ReactNode }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<Slot>({ x: 0, y: 0, scale: 1 });
  const [scene] = useState(() => createScene(slotRef));
  const canvasRef = useCanvasLoop(scene.draw, stageRef);

  useEffect(() => {
    const stage = stageRef.current;
    const slot = stage?.querySelector<HTMLElement>("[data-pld-target]");
    if (!stage || !slot) return;

    const measure = () => {
      const outer = stage.getBoundingClientRect();
      const inner = slot.getBoundingClientRect();
      slotRef.current = { x: inner.left - outer.left, y: inner.top - outer.top, scale: inner.width / CLOUD_WIDTH };
    };

    let down: Point | null = null;
    const onDown = (event: PointerEvent) => {
      down = [event.clientX, event.clientY];
    };
    const onClick = (event: MouseEvent) => {
      const moved = down ? Math.hypot(event.clientX - down[0], event.clientY - down[1]) : 0;
      const box = slot.getBoundingClientRect();
      const onCloud =
        event.clientX >= box.left && event.clientX <= box.right && event.clientY >= box.top && event.clientY <= box.bottom;
      if (moved > CLICK_SLOP || !onCloud || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const outer = stage.getBoundingClientRect();
      scene.serve([event.clientX - outer.left, event.clientY - outer.top]);
    };

    const sizes = new ResizeObserver(measure);
    sizes.observe(stage);
    sizes.observe(slot);
    stage.addEventListener("pointerdown", onDown);
    stage.addEventListener("click", onClick);
    measure();
    return () => {
      sizes.disconnect();
      stage.removeEventListener("pointerdown", onDown);
      stage.removeEventListener("click", onClick);
    };
  }, [scene]);

  return (
    <div ref={stageRef} className="hero-stage">
      <canvas
        ref={canvasRef}
        className="hero-stage__canvas"
        role="img"
        aria-label="A laser pulse strikes a cloud of atoms, and the ablated plume deposits as a crystal film along the edge of the screen"
      />
      {children}
    </div>
  );
}
