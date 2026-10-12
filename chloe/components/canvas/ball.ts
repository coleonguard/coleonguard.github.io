import { mix, rgba, type Palette } from "./useCanvasLoop";

export type Ball = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  spin: number;
  bounces: number;
  alpha: number;
};

export type Court = { left: number; right: number; floor: number; walls: boolean };

const GRAVITY = 1400;
const RESTITUTION = 0.62;
const FRICTION = 0.86;
const ROLLING = 0.6;
const SETTLE_SPEED = 90;

export function isResting(ball: Ball) {
  return ball.vy === 0;
}

export function launchBall(x: number, y: number, vx: number, vy: number, radius: number): Ball {
  return { x, y, vx, vy, radius, spin: 0, bounces: 0, alpha: 1 };
}

export function stepBall(ball: Ball, dt: number, court: Court) {
  ball.vy += GRAVITY * dt;
  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;
  ball.spin += (ball.vx * dt) / ball.radius;

  if (ball.y + ball.radius > court.floor && ball.vy > 0) {
    ball.y = court.floor - ball.radius;
    if (ball.vy > SETTLE_SPEED) {
      ball.vy = -ball.vy * RESTITUTION;
      ball.vx *= FRICTION;
      ball.bounces++;
    } else {
      ball.vy = 0;
      ball.vx *= 1 - ROLLING * dt;
    }
  }
  if (court.walls) {
    if (ball.x - ball.radius < court.left && ball.vx < 0) {
      ball.x = court.left + ball.radius;
      ball.vx = -ball.vx * RESTITUTION;
    }
    if (ball.x + ball.radius > court.right && ball.vx > 0) {
      ball.x = court.right - ball.radius;
      ball.vx = -ball.vx * RESTITUTION;
    }
  }
}

export function drawBall(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  spin: number,
  palette: Palette,
  alpha = 1,
  shadowY?: number,
) {
  if (alpha <= 0) return;

  if (shadowY !== undefined) {
    const lift = Math.max(0, shadowY - y - radius);
    const spread = radius * (1 + lift / 160);
    ctx.fillStyle = rgba(palette.ink, (0.12 * alpha) / (1 + lift / 80));
    ctx.beginPath();
    ctx.ellipse(x, shadowY - 1, spread, spread * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.save();
  ctx.translate(x, y);
  ctx.globalAlpha = alpha;

  const body = ctx.createRadialGradient(-radius * 0.35, -radius * 0.4, radius * 0.1, 0, 0, radius);
  body.addColorStop(0, rgba(mix(palette.ball, [255, 255, 255], 0.35), 1));
  body.addColorStop(1, rgba(mix(palette.ball, palette.ink, 0.12), 1));
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.clip();
  ctx.rotate(spin);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
  ctx.lineWidth = Math.max(1, radius * 0.14);
  ctx.beginPath();
  ctx.arc(-radius * 1.3, 0, radius * 0.92, -1, 1);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(radius * 1.3, 0, radius * 0.92, Math.PI - 1, Math.PI + 1);
  ctx.stroke();

  ctx.restore();
}
