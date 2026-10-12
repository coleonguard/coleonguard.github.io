"use client";

import { Fragment, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useCanvasLoop, type Draw } from "@/components/canvas/useCanvasLoop";
import { createStoryScene, type Beats, type Rect } from "@/components/story/scene";

type Word = { text: string; accent: boolean; tail: string; index: number };

// Words fading in at once; the reveal finishes at REVEAL_END of the pinned scroll.
const SOFT = 6;
const REVEAL_END = 0.85;

function toParagraphs(paragraphs: string[], highlights: string[]): Word[][] {
  let index = 0;
  return paragraphs.map((text) => {
    const marks = highlights
      .map((phrase) => ({ start: text.indexOf(phrase), end: text.indexOf(phrase) + phrase.length }))
      .filter((mark) => mark.start >= 0);
    const words: Word[] = [];
    for (const match of text.matchAll(/\S+/g)) {
      const at = match.index ?? 0;
      const mark = marks.find((m) => at >= m.start && at < m.end);
      const cut = mark ? Math.min(match[0].length, mark.end - at) : match[0].length;
      words.push({ text: match[0].slice(0, cut), accent: Boolean(mark), tail: match[0].slice(cut), index: index++ });
    }
    return words;
  });
}

function toBeats(blocks: Word[][], full: number): Beats {
  const start = (n: number) => ((blocks[n]?.[0]?.index ?? full) / full) * REVEAL_END;
  return [start(1), start(2), start(3), REVEAL_END];
}

export function Story({ paragraphs, highlights }: { paragraphs: string[]; highlights: string[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const textRectRef = useRef<Rect>({ left: 0, top: 0, right: 0, bottom: 0 });
  const blocks = useMemo(() => toParagraphs(paragraphs, highlights), [paragraphs, highlights]);
  const wordCount = blocks.reduce((sum, words) => sum + words.length, 0);
  const beatsRef = useRef<Beats>([0.2, 0.4, 0.6, REVEAL_END]);

  useEffect(() => {
    beatsRef.current = toBeats(blocks, wordCount + SOFT);
  }, [blocks, wordCount]);

  const [draw] = useState(() => {
    const scene = createStoryScene();
    const render: Draw = (ctx, { t, still, palette, width, height }) =>
      scene(ctx, {
        progress: still ? 1 : progressRef.current,
        beats: beatsRef.current,
        width,
        height,
        text: textRectRef.current,
        palette,
        t,
      });
    return render;
  });
  const canvasRef = useCanvasLoop(draw, pinRef);

  useEffect(() => {
    const pin = pinRef.current;
    const text = textRef.current;
    if (!pin || !text) return;
    const measure = () => {
      const outer = pin.getBoundingClientRect();
      const inner = text.getBoundingClientRect();
      textRectRef.current = {
        left: Math.round(inner.left - outer.left),
        top: Math.round(inner.top - outer.top),
        right: Math.round(inner.right - outer.left),
        bottom: Math.round(inner.bottom - outer.top),
      };
    };
    const sizes = new ResizeObserver(measure);
    sizes.observe(pin);
    sizes.observe(text);
    measure();
    return () => sizes.disconnect();
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const full = wordCount + SOFT;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    const update = () => {
      frame = 0;
      if (motion.matches) {
        progressRef.current = 1;
        section.style.setProperty("--p", String(full));
        return;
      }
      const { top, height } = section.getBoundingClientRect();
      const travel = height - window.innerHeight;
      const progress = travel > 0 ? Math.min(Math.max(-top / travel, 0), 1) : 1;
      progressRef.current = progress;
      section.style.setProperty("--p", (Math.min(1, progress / REVEAL_END) * full).toFixed(2));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    motion.addEventListener("change", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      motion.removeEventListener("change", schedule);
    };
  }, [wordCount]);

  return (
    <section
      ref={sectionRef}
      id="story"
      className="story"
      aria-label="Background"
      style={{ "--soft": SOFT } as CSSProperties}
    >
      <div ref={pinRef} className="story__pin">
        <canvas
          ref={canvasRef}
          className="story__scene"
          role="img"
          aria-label="A tennis ball bounces in, breaks apart into atoms, and the atoms order into a crystal and settle into a thin film"
        />
        <div ref={textRef} className="story__text">
          {blocks.map((words, p) => (
            <p key={p}>
              {words.map((word) => (
                <Fragment key={word.index}>
                  <span className="story__word" style={{ "--i": word.index } as CSSProperties}>
                    {word.accent ? <span className="story__accent">{word.text}</span> : word.text}
                    {word.tail}
                  </span>{" "}
                </Fragment>
              ))}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
