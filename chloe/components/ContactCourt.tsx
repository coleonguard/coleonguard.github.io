"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { drawBall, launchBall, stepBall, type Ball } from "@/components/canvas/ball";
import { clamp01, useCanvasLoop, type Draw, type Point } from "@/components/canvas/useCanvasLoop";

const MAX_BALLS = 5;
const RADIUS = 11;
const FADE_AFTER = 3;
const FLOOR_INSET = 8;
const GHOST_ALPHA = 0.25;
const GHOST_FOLLOW = 12;
const GHOST_FADE = 4;
const FINE_POINTER = "(hover: hover) and (pointer: fine)";

export function ContactCourt({ children }: { children: ReactNode }) {
  const sectionRef = useRef<HTMLElement>(null);
  const ballsRef = useRef<Ball[]>([]);
  const ghostRef = useRef({ x: 0, y: 0, spin: 0, alpha: 0, placed: false, enabled: false, overControl: false });
  const [fine, setFine] = useState(false);

  const [draw] = useState(() => {
    const render: Draw = (ctx, { dt, still, pointer, palette, width, height }) => {
      const court = { left: 0, right: width, floor: height - FLOOR_INSET, walls: true };
      ballsRef.current = ballsRef.current.filter((ball) => {
        stepBall(ball, dt, court);
        if (ball.bounces >= FADE_AFTER) ball.alpha -= dt * 1.5;
        return ball.alpha > 0;
      });
      for (const ball of ballsRef.current) {
        drawBall(ctx, ball.x, ball.y, ball.radius, ball.spin, palette, ball.alpha, court.floor);
      }

      const ghost = ghostRef.current;
      const visible = ghost.enabled && !still && pointer !== null && !ghost.overControl;
      if (pointer && visible) {
        if (!ghost.placed) [ghost.x, ghost.y, ghost.placed] = [pointer[0], pointer[1], true];
        const ease = 1 - Math.exp(-dt * GHOST_FOLLOW);
        const dx = (pointer[0] - ghost.x) * ease;
        ghost.x += dx;
        ghost.y += (pointer[1] - ghost.y) * ease;
        ghost.spin += dx / RADIUS;
      }
      ghost.alpha = clamp01(ghost.alpha + (visible ? dt : -dt) * GHOST_FADE);
      if (ghost.alpha === 0) ghost.placed = false;
      else drawBall(ctx, ghost.x, ghost.y, RADIUS, ghost.spin, palette, ghost.alpha * GHOST_ALPHA, court.floor);
    };
    return render;
  });
  const canvasRef = useCanvasLoop(draw, sectionRef);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia(FINE_POINTER);
    const ghost = ghostRef.current;
    const syncPointer = () => {
      ghost.enabled = finePointer.matches;
      setFine(finePointer.matches);
    };
    syncPointer();

    const isControl = (target: EventTarget | null) => target instanceof Element && target.closest("a, button") !== null;
    const onMove = (event: PointerEvent) => {
      ghost.overControl = isControl(event.target);
    };
    const onClick = (event: MouseEvent) => {
      if (motion.matches || isControl(event.target)) return;
      const box = section.getBoundingClientRect();
      const origin: Point = ghost.alpha > 0 ? [ghost.x, ghost.y] : [event.clientX - box.left, event.clientY - box.top];
      const direction = origin[0] < box.width / 2 ? 1 : -1;
      const ball = launchBall(
        origin[0],
        origin[1],
        direction * (160 + Math.random() * 220),
        -(520 + Math.random() * 240),
        RADIUS,
      );
      ball.spin = ghost.spin;
      ballsRef.current = [...ballsRef.current, ball].slice(-MAX_BALLS);
      ghost.alpha = 0;
      ghost.placed = false;
    };
    section.addEventListener("pointermove", onMove);
    section.addEventListener("click", onClick);
    finePointer.addEventListener("change", syncPointer);
    return () => {
      section.removeEventListener("pointermove", onMove);
      section.removeEventListener("click", onClick);
      finePointer.removeEventListener("change", syncPointer);
    };
  }, []);

  return (
    <section ref={sectionRef} className="section contact">
      <canvas ref={canvasRef} className="contact__court" aria-hidden="true" />
      {children}
      <p className="eyebrow contact__hint">{fine ? "Click anywhere to serve" : "Tap anywhere to serve"}</p>
    </section>
  );
}
