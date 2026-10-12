"use client";

import { Fragment, useEffect, useMemo, useRef, type CSSProperties } from "react";

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

export function Story({ paragraphs, highlights }: { paragraphs: string[]; highlights: string[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const blocks = useMemo(() => toParagraphs(paragraphs, highlights), [paragraphs, highlights]);
  const wordCount = blocks.reduce((sum, words) => sum + words.length, 0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const full = wordCount + SOFT;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    const update = () => {
      frame = 0;
      if (motion.matches) {
        section.style.setProperty("--p", String(full));
        return;
      }
      const { top, height } = section.getBoundingClientRect();
      const travel = height - window.innerHeight;
      const progress = travel > 0 ? Math.min(Math.max(-top / travel / REVEAL_END, 0), 1) : 1;
      section.style.setProperty("--p", (progress * full).toFixed(2));
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
      <div className="story__pin">
        <div className="story__text">
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
