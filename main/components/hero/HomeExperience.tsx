"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { CHAPTERS, CHAPTER_LIST, type ChapterId } from "@/content/chapters";
import { computeLayout } from "@/lib/layout";
import { useElementSize } from "@/lib/useElementSize";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { rickroll } from "@/lib/rickroll";
import { ChapterLogos } from "@/components/brand/ChapterLogos";
import { ChapterSelectors } from "@/components/hud/ChapterSelectors";
import { Constellation } from "@/components/scene/Constellation";
import type { IntroStage } from "@/components/scene/engine";
import { BootLog } from "./BootLog";
import { HoverHint } from "./HoverHint";
import { Intro } from "./Intro";
import { Substrates } from "./Substrate";

type HeroIntro = "off" | IntroStage;

/** Fallbacks in case the particle engine never starts (no WebGL, slow load) or stalls. */
const START_TIMEOUT = 4000;
const STAGE_TIMEOUT = 4500;

function useIntroStage() {
  const [stage, setStage] = useState<HeroIntro>("off");
  const [engineStarted, setEngineStarted] = useState(false);

  useEffect(() => {
    if (document.documentElement.classList.contains("intro-pending")) setStage("name");
  }, []);

  useEffect(() => {
    if (stage === "done") {
      document.documentElement.classList.remove("intro-pending");
      try {
        sessionStorage.setItem("intro-seen", "1");
      } catch {}
      return;
    }
    if (stage === "off") return;
    const next = stage === "name" ? "forming" : "done";
    const wait = engineStarted ? STAGE_TIMEOUT : START_TIMEOUT;
    const timer = window.setTimeout(() => setStage(next), wait);
    return () => window.clearTimeout(timer);
  }, [stage, engineStarted]);

  const advance = useCallback((next: IntroStage) => {
    if (next === "name") {
      setEngineStarted(true);
      return;
    }
    setStage((current) => (current === "off" || current === "done" ? current : next));
  }, []);

  return [stage, advance] as const;
}

const ROLL_DELAY = 650;
const DECLASSIFIED_FOR = 4000;

function useDeclassify() {
  const [declassified, setDeclassified] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const declassify = useCallback(() => {
    setDeclassified(true);
    timers.current.push(
      window.setTimeout(rickroll, ROLL_DELAY),
      window.setTimeout(() => setDeclassified(false), DECLASSIFIED_FOR),
    );
  }, []);

  return [declassified, declassify] as const;
}

const HINT_SEEN = "hover-hint-seen";

function useExplored(highlighted: ChapterId | null) {
  const [explored, setExplored] = useState(true);

  useEffect(() => {
    try {
      setExplored(sessionStorage.getItem(HINT_SEEN) === "1");
    } catch {
      setExplored(false);
    }
  }, []);

  useEffect(() => {
    if (!highlighted || explored) return;
    setExplored(true);
    try {
      sessionStorage.setItem(HINT_SEEN, "1");
    } catch {}
  }, [highlighted, explored]);

  return explored;
}

export function HomeExperience() {
  const reducedMotion = useReducedMotion();
  const [introStage, advanceIntro] = useIntroStage();
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
  const explored = useExplored(highlighted);
  const [declassified, declassify] = useDeclassify();
  const introSettled = introStage === "done" || introStage === "off";

  return (
    <section className="hero" aria-label="Introduction" data-intro={introStage}>
      <div
        className="hero__scene"
        ref={sceneRef}
        onClick={() => {
          if (!compact && highlighted === "space" && !declassified) declassify();
        }}
      >
        {reducedMotion !== null && (
          <Constellation
            preview={preview}
            highlighted={labelHighlight}
            reducedMotion={reducedMotion}
            intro={introStage === "name"}
            onPointerCluster={setPointerCluster}
            onIntro={advanceIntro}
          />
        )}

        {layout && !layout.compact && (
          <div className="cluster-labels">
            <div
              className="cluster-labels__rule"
              style={{ top: layout.clusters.robotics.center.y + layout.clusters.robotics.scale + 6 }}
              aria-hidden="true"
            />
            {CHAPTER_LIST.map((chapter, i) => {
              const slot = layout.clusters[chapter.id];
              return (
                <div
                  key={chapter.id}
                  className="cluster-label"
                  data-highlighted={highlighted === chapter.id ? "true" : "false"}
                  style={
                    {
                      left: slot.center.x,
                      top: slot.center.y + slot.scale + 18,
                      "--i": i,
                    } as CSSProperties
                  }
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
                  <span className="cluster-label__title">{chapter.title}</span>
                  <span className="cluster-label__years">{chapter.years}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Intro decode={introStage === "forming" || introStage === "done"} />

      {layout && !layout.compact && (
        <Substrates active={introSettled ? highlighted : null} declassified={declassified} />
      )}
      {layout && !layout.compact && <HoverHint visible={introSettled && !explored && !highlighted} />}
      {layout && !layout.compact && (introStage === "name" || introStage === "forming") && <BootLog />}

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

      {compact && (
        <Substrates active={preview} variant="inline" declassified={declassified} onDeclassify={declassify} />
      )}
    </section>
  );
}
