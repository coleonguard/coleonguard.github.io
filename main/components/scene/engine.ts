import * as THREE from "three";
import { CHAPTER_IDS, type ChapterId } from "@/content/chapters";
import { computeLayout, type ClusterSlot, type SceneLayout } from "@/lib/layout";
import {
  KIND_GLOBE,
  KIND_STATIC,
  KIND_ORBITER,
  KIND_RIG,
  buildShape,
  globePoint,
  orbiterPoint,
  type ShapeData,
} from "./shapes";
import { FRAGMENT_SHADER, VERTEX_SHADER } from "./shaders";
import { rigPoint } from "./walker";

export type EngineState = {
  /** Chapter brought into focus, or null for the overview. */
  focused: ChapterId | null;
  /** Chapter shown in compact layouts when nothing is focused. */
  preview: ChapterId;
  highlighted: ChapterId | null;
};

export type EngineOptions = {
  reducedMotion: boolean;
  onPointerCluster: (id: ChapterId | null) => void;
};

const SILVER = new THREE.Color("#c9ccd2");
const AMBER = new THREE.Color("#c8a06a");
const FOCUS_SHARE = 0.84;
const POINTER_RADIUS = 96;
const POINTER_PUSH = 22;
const STIFFNESS = 0.055;
const DAMPING = 0.82;
/** Moving forms track their targets tightly once a transition settles, so limbs don't smear. */
const TRACK_STIFFNESS = 0.32;
const TRACK_DAMPING = 0.5;

function particleBudget(width: number): number {
  const cores = typeof navigator !== "undefined" ? navigator.hardwareConcurrency ?? 4 : 4;
  if (width < 600) return 3200;
  if (width < 1100 || cores <= 4) return 6400;
  return 9600;
}

function shuffled(n: number, seed: number): Uint32Array {
  const out = new Uint32Array(n);
  for (let i = 0; i < n; i++) out[i] = i;
  let s = seed;
  for (let i = n - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const j = s % (i + 1);
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}

export class SceneEngine {
  private readonly container: HTMLElement;
  private readonly options: EngineOptions;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.OrthographicCamera(0, 1, 0, 1, -10, 10);
  private readonly material: THREE.ShaderMaterial;
  private readonly lineMaterial = new THREE.LineBasicMaterial({
    color: SILVER,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  private lines: THREE.Line[] = [];

  private readonly count: number;
  private readonly positions: Float32Array;
  private readonly velocities: Float32Array;
  private readonly alphas: Float32Array;
  private readonly phase: Float32Array;
  private readonly delay: Float32Array;
  private readonly rank: Uint32Array;
  private readonly ambient: Float32Array;
  private readonly geometry = new THREE.BufferGeometry();
  private readonly overviewShapes: Record<ChapterId, ShapeData>;
  private readonly focusShapes: Record<ChapterId, ShapeData>;
  private readonly focusCount: number;

  private layout: SceneLayout;
  private state: EngineState = { focused: null, preview: "robotics", highlighted: null };
  private coherence: Record<ChapterId, number> = { robotics: 0, terranova: 0, echo: 0, space: 0 };
  private lineOpacity = 0;
  private accentMix = 0;
  private changeTime = 0;
  private pointer = { x: -9999, y: -9999, active: false };
  private pointerCluster: ChapterId | null = null;
  private lastFrame = 0;
  private time = 0;
  private frame = 0;
  private running = false;
  private visible = true;
  private onScreen = true;
  private readonly resizeObserver: ResizeObserver;
  private readonly intersectionObserver: IntersectionObserver;

  constructor(container: HTMLElement, options: EngineOptions) {
    this.container = container;
    this.options = options;
    const { width, height } = this.size();
    this.layout = computeLayout(width, height);

    this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(width, height);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.domElement.setAttribute("aria-hidden", "true");
    container.appendChild(this.renderer.domElement);

    this.count = particleBudget(width);
    this.focusCount = Math.floor(this.count * FOCUS_SHARE);
    const perCluster = Math.ceil(this.count / CHAPTER_IDS.length);
    this.overviewShapes = Object.fromEntries(
      CHAPTER_IDS.map((id) => [id, buildShape(id, perCluster, 1)]),
    ) as Record<ChapterId, ShapeData>;
    this.focusShapes = Object.fromEntries(
      CHAPTER_IDS.map((id) => [id, buildShape(id, this.focusCount, 2)]),
    ) as Record<ChapterId, ShapeData>;

    this.positions = new Float32Array(this.count * 3);
    this.velocities = new Float32Array(this.count * 2);
    this.alphas = new Float32Array(this.count);
    this.phase = new Float32Array(this.count * 4);
    this.delay = new Float32Array(this.count);
    this.ambient = new Float32Array(this.count * 2);
    this.rank = shuffled(this.count, 7);

    const sizes = new Float32Array(this.count);
    const accents = new Float32Array(this.count);
    for (let i = 0; i < this.count; i++) {
      this.positions[i * 3] = Math.random() * width;
      this.positions[i * 3 + 1] = Math.random() * height;
      this.phase[i * 4] = 0.25 + Math.random() * 0.5;
      this.phase[i * 4 + 1] = Math.random() * Math.PI * 2;
      this.phase[i * 4 + 2] = 0.25 + Math.random() * 0.5;
      this.phase[i * 4 + 3] = Math.random() * Math.PI * 2;
      this.delay[i] = Math.random() * 0.6;
      this.ambient[i * 2] = Math.random();
      this.ambient[i * 2 + 1] = Math.random();
      sizes[i] = 1.5 + Math.pow(Math.random(), 3) * 2.4;
      accents[i] = Math.random() < 0.08 ? 1 : 0;
    }

    this.geometry.setAttribute("position", new THREE.BufferAttribute(this.positions, 3));
    this.geometry.setAttribute("aAlpha", new THREE.BufferAttribute(this.alphas, 1));
    this.geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    this.geometry.setAttribute("aAccent", new THREE.BufferAttribute(accents, 1));

    this.material = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uPixelRatio: { value: this.renderer.getPixelRatio() },
        uColor: { value: SILVER },
        uAccent: { value: AMBER },
        uAccentMix: { value: 0 },
      },
    });
    const points = new THREE.Points(this.geometry, this.material);
    points.frustumCulled = false;
    this.scene.add(points);

    this.updateCamera();
    this.buildLines();

    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.resizeObserver.observe(container);
    this.intersectionObserver = new IntersectionObserver(([entry]) => {
      this.onScreen = entry.isIntersecting;
      this.syncLoop();
    });
    this.intersectionObserver.observe(container);

    window.addEventListener("pointermove", this.handlePointerMove, { passive: true });
    window.addEventListener("pointerleave", this.handlePointerLeave);
    document.addEventListener("visibilitychange", this.handleVisibility);

    if (options.reducedMotion) {
      this.renderStatic();
    } else {
      this.syncLoop();
    }
  }

  setState(next: EngineState): void {
    const modeChanged =
      next.focused !== this.state.focused ||
      (this.layout.compact && next.preview !== this.state.preview);
    this.state = next;
    if (modeChanged) this.changeTime = this.time;
    if (!this.running) this.renderStatic();
  }

  destroy(): void {
    this.running = false;
    cancelAnimationFrame(this.frame);
    this.resizeObserver.disconnect();
    this.intersectionObserver.disconnect();
    window.removeEventListener("pointermove", this.handlePointerMove);
    window.removeEventListener("pointerleave", this.handlePointerLeave);
    document.removeEventListener("visibilitychange", this.handleVisibility);
    this.geometry.dispose();
    this.material.dispose();
    this.lineMaterial.dispose();
    this.lines.forEach((line) => line.geometry.dispose());
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }

  private size(): { width: number; height: number } {
    const rect = this.container.getBoundingClientRect();
    return { width: Math.max(1, rect.width), height: Math.max(1, rect.height) };
  }

  private syncLoop(): void {
    const shouldRun = !this.options.reducedMotion && this.visible && this.onScreen;
    if (shouldRun && !this.running) {
      this.running = true;
      this.lastFrame = performance.now();
      this.frame = requestAnimationFrame(this.tick);
    } else if (!shouldRun && this.running) {
      this.running = false;
      cancelAnimationFrame(this.frame);
    }
  }

  private tick = (): void => {
    if (!this.running) return;
    const now = performance.now();
    const dt = Math.min((now - this.lastFrame) / 1000, 1 / 20);
    this.lastFrame = now;
    this.time += dt;
    this.step(dt * 60, false);
    this.renderer.render(this.scene, this.camera);
    this.frame = requestAnimationFrame(this.tick);
  };

  private renderStatic(): void {
    this.changeTime = this.time - 10;
    this.step(1, true);
    this.renderer.render(this.scene, this.camera);
  }

  private handleResize(): void {
    const { width, height } = this.size();
    this.layout = computeLayout(width, height);
    this.renderer.setSize(width, height);
    this.updateCamera();
    this.buildLines();
    if (!this.running) this.renderStatic();
  }

  private updateCamera(): void {
    const { width, height } = this.layout;
    this.camera.left = 0;
    this.camera.right = width;
    this.camera.top = 0;
    this.camera.bottom = height;
    this.camera.updateProjectionMatrix();
  }

  private buildLines(): void {
    this.lines.forEach((line) => {
      this.scene.remove(line);
      line.geometry.dispose();
    });
    this.lines = [];
    if (this.layout.compact) return;
    const c = this.layout.clusters;
    const pairs: [ChapterId, ChapterId, number][] = [
      ["robotics", "terranova", -0.35],
      ["terranova", "echo", 0.3],
      ["echo", "space", 0.35],
      ["robotics", "echo", -0.25],
      ["terranova", "space", 0.2],
    ];
    for (const [a, b, bend] of pairs) {
      const pa = c[a].center;
      const pb = c[b].center;
      const mx = (pa.x + pb.x) / 2 - (pb.y - pa.y) * bend;
      const my = (pa.y + pb.y) / 2 + (pb.x - pa.x) * bend;
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(pa.x, pa.y, 0),
        new THREE.Vector3(mx, my, 0),
        new THREE.Vector3(pb.x, pb.y, 0),
      );
      const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(80));
      const line = new THREE.Line(geometry, this.lineMaterial);
      line.frustumCulled = false;
      this.scene.add(line);
      this.lines.push(line);
    }
  }

  private displayedFocus(): ChapterId | null {
    if (this.state.focused) return this.state.focused;
    return this.layout.compact ? this.state.preview : null;
  }

  private shapePoint(
    shape: ShapeData,
    j: number,
    slot: ClusterSlot,
    t: number,
  ): { x: number; y: number; bright: number; moving: boolean } {
    const kind = shape.kind[j];
    let nx = shape.xy[j * 2];
    let ny = shape.xy[j * 2 + 1];
    let bright = shape.bright[j];
    if (kind === KIND_GLOBE) {
      const p = globePoint(shape.params[j * 4], shape.params[j * 4 + 1], t);
      nx = p.x;
      ny = p.y;
      bright *= p.z > 0 ? 0.5 + p.z * 0.7 : 0.12;
    } else if (kind === KIND_RIG) {
      const p = rigPoint(shape.params[j * 4], shape.params[j * 4 + 1], shape.params[j * 4 + 2], t);
      nx = p.x;
      ny = p.y;
    } else if (kind === KIND_ORBITER) {
      const p = orbiterPoint(shape.params[j * 4], shape.params[j * 4 + 1], shape.params[j * 4 + 2], t);
      nx = p.x;
      ny = p.y;
    }
    return {
      x: slot.center.x + nx * slot.scale,
      y: slot.center.y + ny * slot.scale,
      bright,
      moving: kind !== KIND_STATIC,
    };
  }

  private step(frames: number, snap: boolean): void {
    const t = this.time;
    const focus = this.displayedFocus();
    const { width, height } = this.layout;
    const highlighted = this.state.highlighted ?? this.pointerCluster;
    const ease = 1 - Math.pow(0.9, frames);

    for (const id of CHAPTER_IDS) {
      const goal = !focus && highlighted === id ? 1 : 0;
      this.coherence[id] += (goal - this.coherence[id]) * ease;
    }
    const lineGoal = focus ? 0 : 0.085;
    this.lineOpacity += (lineGoal - this.lineOpacity) * ease;
    this.lineMaterial.opacity = this.lineOpacity;
    const accentGoal = this.state.focused ? 1 : 0;
    this.accentMix += (accentGoal - this.accentMix) * ease;
    this.material.uniforms.uAccentMix.value = this.accentMix;

    const motion = snap ? 0 : 1;
    const sinceChange = t - this.changeTime;
    const px = this.pointer.x;
    const py = this.pointer.y;
    const pointerOn = this.pointer.active && !snap;
    const damping = Math.pow(DAMPING, frames);
    const trackDamping = Math.pow(TRACK_DAMPING, frames);
    const alphaEase = snap ? 1 : 1 - Math.pow(0.92, frames);

    for (let i = 0; i < this.count; i++) {
      let tx: number;
      let ty: number;
      let alpha: number;
      let drift: number;
      let moving = false;

      if (focus) {
        const r = this.rank[i];
        if (r < this.focusCount) {
          const p = this.shapePoint(this.focusShapes[focus], r, this.layout.focus, t);
          tx = p.x;
          ty = p.y;
          alpha = 0.8 * p.bright;
          drift = 1.4;
          moving = p.moving;
        } else {
          tx = this.ambient[i * 2] * width;
          ty = this.ambient[i * 2 + 1] * height;
          alpha = 0.16;
          drift = 18;
        }
      } else {
        const id = CHAPTER_IDS[i % CHAPTER_IDS.length];
        const shape = this.overviewShapes[id];
        const j = Math.floor(i / CHAPTER_IDS.length) % shape.count;
        const p = this.shapePoint(shape, j, this.layout.clusters[id], t);
        const coherence = this.coherence[id];
        tx = p.x;
        ty = p.y;
        const dimmed = highlighted && highlighted !== id ? 0.7 : 1;
        alpha = (0.7 + 0.3 * coherence) * p.bright * dimmed;
        drift = 2.6 * (1 - 0.7 * coherence);
        moving = p.moving;
      }

      const ph = i * 4;
      tx += Math.sin(t * this.phase[ph] + this.phase[ph + 1]) * drift * motion;
      ty += Math.cos(t * this.phase[ph + 2] + this.phase[ph + 3]) * drift * motion;

      const ix = i * 3;
      let x = this.positions[ix];
      let y = this.positions[ix + 1];

      if (pointerOn) {
        const dx = tx - px;
        const dy = ty - py;
        const d2 = dx * dx + dy * dy;
        if (d2 < POINTER_RADIUS * POINTER_RADIUS) {
          const d = Math.sqrt(d2) || 1;
          const f = (1 - d / POINTER_RADIUS) ** 2 * POINTER_PUSH;
          tx += (dx / d) * f;
          ty += (dy / d) * f;
        }
      }

      if (snap) {
        x = tx;
        y = ty;
        this.velocities[i * 2] = 0;
        this.velocities[i * 2 + 1] = 0;
      } else {
        const elapsed = sinceChange - this.delay[i];
        const gate = Math.min(1, Math.max(0.03, elapsed / 0.5));
        const track = moving ? Math.min(1, Math.max(0, elapsed - 1)) : 0;
        const k = (STIFFNESS + (TRACK_STIFFNESS - STIFFNESS) * track) * gate * frames;
        const d = damping + (trackDamping - damping) * track;
        const vx = this.velocities[i * 2] * d + (tx - x) * k;
        const vy = this.velocities[i * 2 + 1] * d + (ty - y) * k;
        this.velocities[i * 2] = vx;
        this.velocities[i * 2 + 1] = vy;
        x += vx;
        y += vy;
      }

      this.positions[ix] = x;
      this.positions[ix + 1] = y;
      this.alphas[i] += (alpha - this.alphas[i]) * alphaEase;
    }

    (this.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    (this.geometry.attributes.aAlpha as THREE.BufferAttribute).needsUpdate = true;
  }

  private nearestCluster(x: number, y: number): ChapterId | null {
    if (this.layout.compact || this.state.focused) return null;
    let best: ChapterId | null = null;
    let bestDistance = Infinity;
    for (const id of CHAPTER_IDS) {
      const slot = this.layout.clusters[id];
      const d = Math.hypot(x - slot.center.x, y - slot.center.y);
      if (d < slot.scale * 1.25 && d < bestDistance) {
        best = id;
        bestDistance = d;
      }
    }
    return best;
  }

  private handlePointerMove = (event: PointerEvent): void => {
    const rect = this.container.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;
    this.pointer = { x, y, active: inside && event.pointerType !== "touch" };
    const cluster = inside ? this.nearestCluster(x, y) : null;
    if (cluster !== this.pointerCluster) {
      this.pointerCluster = cluster;
      this.options.onPointerCluster(cluster);
    }
  };

  private handlePointerLeave = (): void => {
    this.pointer.active = false;
    if (this.pointerCluster) {
      this.pointerCluster = null;
      this.options.onPointerCluster(null);
    }
  };

  private handleVisibility = (): void => {
    this.visible = document.visibilityState === "visible";
    this.syncLoop();
  };
}
