"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CHAPTERS, CHAPTER_LIST, type ChapterId } from "@/content/chapters";
import { computeLayout } from "@/lib/layout";
import { useChapterState } from "@/lib/useChapterState";
import { useElementSize } from "@/lib/useElementSize";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { ChapterPanel } from "@/components/chapter/ChapterPanel";
import { ChapterSelectors } from "@/components/hud/ChapterSelectors";
import { MotionControls } from "@/components/hud/MotionControls";
import { Constellation } from "@/components/scene/Constellation";
import { Intro } from "./Intro";

export function HomeExperience() {
  const { selected, select } = useChapterState();
  const reducedMotion = useReducedMotion();
  const [paused, setPaused] = useState(false);
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
      returnFocus.current.get(`selector-${lastSelected.current}`)?.focus({ preventScroll: true });
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

  const registerSelector = useCallback((id: ChapterId, el: HTMLButtonElement | null) => {
    const key = `selector-${id}`;
    if (el) returnFocus.current.set(key, el);
    else returnFocus.current.delete(key);
  }, []);

  return (
    <section className="hero" data-selected={selected ? "true" : "false"} aria-label="Introduction">
      <div className="hero__scene" ref={sceneRef}>
        {reducedMotion !== null && (
          <Constellation
            focused={selected}
            preview={preview}
            highlighted={labelHighlight}
            paused={paused}
            reducedMotion={reducedMotion}
            onPointerCluster={setPointerCluster}
            onSelect={choose}
          />
        )}

        {layout && !layout.compact && !selected && (
          <div className="cluster-labels">
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
                    top: slot.center.y + slot.scale + 14,
                  }}
                >
                  <button
                    type="button"
                    className="cluster-label__button"
                    aria-describedby={`tip-${chapter.id}`}
                    onClick={() => choose(chapter.id)}
                    onPointerEnter={() => setLabelHighlight(chapter.id)}
                    onPointerLeave={() => setLabelHighlight(null)}
                    onFocus={() => setLabelHighlight(chapter.id)}
                    onBlur={() => setLabelHighlight(null)}
                  >
                    <span className="cluster-label__index">{chapter.index}</span> / {chapter.label}
                  </button>
                  <span id={`tip-${chapter.id}`} className="cluster-label__tip" role="tooltip">
                    {chapter.tooltip}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Intro onExplore={() => choose("robotics")} />

      {selected && (
        <div className="hero__panel">
          <ChapterPanel key={selected} ref={headingRef} chapter={CHAPTERS[selected]} onBack={back} />
        </div>
      )}

      <div className="hud">
        <div className="hud__caption" aria-live="polite">
          {activeChapter ? (
            <>
              <span className="hud__caption-title">
                {activeChapter.index} / {activeChapter.label}
              </span>
              <span className="hud__caption-field">{activeChapter.caption}</span>
            </>
          ) : (
            <>
              <span className="hud__caption-title">Four chapters</span>
              <span className="hud__caption-field">Hover a system, or choose one below.</span>
            </>
          )}
        </div>
        <ChapterSelectors
          active={selected ?? (compact ? preview : null)}
          onSelect={choose}
          onHighlight={setLabelHighlight}
          register={registerSelector}
        />
        <MotionControls
          paused={paused}
          motionReduced={reducedMotion === true}
          onTogglePaused={() => setPaused((p) => !p)}
          onReset={back}
          canReset={selected !== null}
        />
      </div>
    </section>
  );
}
