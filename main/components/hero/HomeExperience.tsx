"use client";

import { useRef, useState } from "react";
import { CHAPTERS, CHAPTER_LIST, type ChapterId } from "@/content/chapters";
import { computeLayout } from "@/lib/layout";
import { useElementSize } from "@/lib/useElementSize";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { ChapterLogos } from "@/components/brand/ChapterLogos";
import { ChapterSelectors } from "@/components/hud/ChapterSelectors";
import { Constellation } from "@/components/scene/Constellation";
import { Intro } from "./Intro";
import { Substrates } from "./Substrate";

export function HomeExperience() {
  const reducedMotion = useReducedMotion();
  const [labelHighlight, setLabelHighlight] = useState<ChapterId | null>(null);
  const [pointerCluster, setPointerCluster] = useState<ChapterId | null>(null);
  const [preview, setPreview] = useState<ChapterId>("robotics");
  const sceneRef = useRef<HTMLDivElement>(null);
  const size = useElementSize(sceneRef);

  const layout = size ? computeLayout(size.width, size.height) : null;
  const compact = layout?.compact ?? false;
  const highlighted = labelHighlight ?? pointerCluster;
  const active = compact ? preview : highlighted;
  const activeChapter = active ? CHAPTERS[active] : null;

  return (
    <section className="hero" aria-label="Introduction">
      <div className="hero__scene" ref={sceneRef}>
        {reducedMotion !== null && (
          <Constellation
            preview={preview}
            highlighted={labelHighlight}
            reducedMotion={reducedMotion}
            onPointerCluster={setPointerCluster}
          />
        )}

        {layout && !layout.compact && (
          <div className="cluster-labels">
            <div
              className="cluster-labels__rule"
              style={{ top: layout.clusters.robotics.center.y + layout.clusters.robotics.scale + 6 }}
              aria-hidden="true"
            />
            {CHAPTER_LIST.map((chapter) => {
              const slot = layout.clusters[chapter.id];
              return (
                <div
                  key={chapter.id}
                  className="cluster-label"
                  data-highlighted={highlighted === chapter.id ? "true" : "false"}
                  style={{
                    left: slot.center.x,
                    top: slot.center.y + slot.scale + 18,
                  }}
                >
                  <span
                    tabIndex={0}
                    className="cluster-label__button"
                    aria-describedby={`substrate-${chapter.id}`}
                    onPointerEnter={() => setLabelHighlight(chapter.id)}
                    onPointerLeave={() => setLabelHighlight(null)}
                    onFocus={() => setLabelHighlight(chapter.id)}
                    onBlur={() => setLabelHighlight(null)}
                  >
                    <ChapterLogos chapter={chapter.id} scale={1.25} className="cluster-label__logos" />
                  </span>
                  <span className="cluster-label__years">{chapter.years}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Intro />

      {layout && !layout.compact && <Substrates active={highlighted} />}

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
        <ChapterSelectors active={compact ? preview : null} onSelect={setPreview} onHighlight={setLabelHighlight} />
      </div>
    </section>
  );
}
