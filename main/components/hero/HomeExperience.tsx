"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CHAPTERS, CHAPTER_LIST, type ChapterId } from "@/content/chapters";
import { computeLayout } from "@/lib/layout";
import { useChapterState } from "@/lib/useChapterState";
import { useElementSize } from "@/lib/useElementSize";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { ChapterLogos } from "@/components/brand/ChapterLogos";
import { ChapterPanel } from "@/components/chapter/ChapterPanel";
import { ChapterSelectors } from "@/components/hud/ChapterSelectors";
import { Constellation } from "@/components/scene/Constellation";
import { Intro } from "./Intro";

export function HomeExperience() {
  const { selected, select } = useChapterState();
  const reducedMotion = useReducedMotion();
  const [labelHighlight, setLabelHighlight] = useState<ChapterId | null>(null);
  const [pointerCluster, setPointerCluster] = useState<ChapterId | null>(null);
  const [preview, setPreview] = useState<ChapterId>("robotics");
  const sceneRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const returnFocus = useRef<Map<string, HTMLButtonElement>>(new Map());
  const lastSelected = useRef<ChapterId | null>(null);
  const size = useElementSize(sceneRef);

  const layout = size ? computeLayout(size.width, size.height) : null;
  const compact = layout?.compact ?? false;
  const highlighted = labelHighlight ?? pointerCluster;
  const active = selected ?? (compact ? preview : highlighted);
  const activeChapter = active ? CHAPTERS[active] : null;

  const choose = useCallback(
    (id: ChapterId) => {
      setPreview(id);
      select(id);
    },
    [select],
  );

  const back = useCallback(() => select(null), [select]);

  useEffect(() => {
    if (selected) {
      headingRef.current?.focus({ preventScroll: !compact });
    } else if (lastSelected.current) {
      const key = compact ? "selector" : "label";
      returnFocus.current.get(`${key}-${lastSelected.current}`)?.focus({ preventScroll: true });
    }
    lastSelected.current = selected;
  }, [selected, compact]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && selected) back();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, back]);

  const register = useCallback((key: string, el: HTMLButtonElement | null) => {
    if (el) returnFocus.current.set(key, el);
    else returnFocus.current.delete(key);
  }, []);
  const registerSelector = useCallback(
    (id: ChapterId, el: HTMLButtonElement | null) => register(`selector-${id}`, el),
    [register],
  );

  return (
    <section className="hero" data-selected={selected ? "true" : "false"} aria-label="Introduction">
      <div className="hero__scene" ref={sceneRef}>
        {reducedMotion !== null && (
          <Constellation
            focused={selected}
            preview={preview}
            highlighted={labelHighlight}
            reducedMotion={reducedMotion}
            onPointerCluster={setPointerCluster}
          />
        )}

        {layout && !layout.compact && !selected && (
          <div className="cluster-labels">
            <div
              className="cluster-labels__rule"
              style={{ top: layout.clusters.robotics.center.y + layout.clusters.robotics.scale + 6 }}
              aria-hidden="true"
            />
            {CHAPTER_LIST.map((chapter) => {
              const slot = layout.clusters[chapter.id];
              const isHighlighted = highlighted === chapter.id;
              return (
                <div
                  key={chapter.id}
                  className="cluster-label"
                  data-highlighted={isHighlighted ? "true" : "false"}
                  style={{
                    left: slot.center.x - slot.scale,
                    top: slot.center.y + slot.scale + 18,
                  }}
                >
                  <button
                    ref={(el) => register(`label-${chapter.id}`, el)}
                    type="button"
                    className="cluster-label__button"
                    aria-label={`${chapter.index} ${chapter.label}`}
                    aria-describedby={`tip-${chapter.id}`}
                    onClick={() => choose(chapter.id)}
                    onPointerEnter={() => setLabelHighlight(chapter.id)}
                    onPointerLeave={() => setLabelHighlight(null)}
                    onFocus={() => setLabelHighlight(chapter.id)}
                    onBlur={() => setLabelHighlight(null)}
                  >
                    <ChapterLogos chapter={chapter.id} scale={1.25} decorative className="cluster-label__logos" />
                  </button>
                  <span className="cluster-label__years">{chapter.years}</span>
                  <span id={`tip-${chapter.id}`} className="cluster-label__tip" role="tooltip">
                    {chapter.tooltip}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Intro />

      {selected && (
        <div className="hero__panel">
          <ChapterPanel key={selected} ref={headingRef} chapter={CHAPTERS[selected]} onBack={back} />
        </div>
      )}

      <div className="hud">
        <div className="hud__caption" aria-live="polite">
          {activeChapter && (
            <>
              <span className="hud__caption-title">
                {activeChapter.index} / {activeChapter.label}
              </span>
              <span className="hud__caption-field">{activeChapter.caption}</span>
            </>
          )}
        </div>
        <ChapterSelectors
          active={selected ?? (compact ? preview : null)}
          onSelect={choose}
          onHighlight={setLabelHighlight}
          register={registerSelector}
        />
      </div>
    </section>
  );
}
