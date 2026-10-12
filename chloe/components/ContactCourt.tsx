"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { drawBall, launchBall, stepBall, type Ball } from "@/components/canvas/ball";
import { useCanvasLoop, type Draw } from "@/components/canvas/useCanvasLoop";

const MAX_BALLS = 5;
const RADIUS = 11;
const FADE_AFTER = 3;
const FLOOR_INSET = 8;

export function ContactCourt({ children }: { children: ReactNode }) {
  const sectionRef = useRef<HTMLElement>(null);
  const ballsRef = useRef<Ball[]>([]);

  const [draw] = useState(() => {
    const render: Draw = (ctx, { dt, palette, width, height }) => {
      const court = { left: 0, right: width, floor: height - FLOOR_INSET, walls: true };
      ballsRef.current = ballsRef.current.filter((ball) => {
        stepBall(ball, dt, court);
        if (ball.bounces >= FADE_AFTER) ball.alpha -= dt * 1.5;
        return ball.alpha > 0;
      });
      for (const ball of ballsRef.current) {
        drawBall(ctx, ball.x, ball.y, ball.radius, ball.spin, palette, ball.alpha, court.floor);
      }
    };
    return render;
  });
  const canvasRef = useCanvasLoop(draw, sectionRef);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onClick = (event: MouseEvent) => {
      if (motion.matches || (event.target as Element).closest("a, button")) return;
      const box = section.getBoundingClientRect();
      const direction = event.clientX - box.left < box.width / 2 ? 1 : -1;
      const ball = launchBall(
        event.clientX - box.left,
        event.clientY - box.top,
        direction * (160 + Math.random() * 220),
        -(520 + Math.random() * 240),
        RADIUS,
      );
      ballsRef.current = [...ballsRef.current, ball].slice(-MAX_BALLS);
    };
    section.addEventListener("click", onClick);
    return () => section.removeEventListener("click", onClick);
  }, []);

  return (
    <section ref={sectionRef} className="section contact">
      <canvas ref={canvasRef} className="contact__court" aria-hidden="true" />
      {children}
      <p className="eyebrow contact__hint">Tap anywhere to serve</p>
    </section>
  );
}
