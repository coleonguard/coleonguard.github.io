"use client";

import { useEffect, useRef, useState } from "react";
import type { ChapterId } from "@/content/chapters";
import { SPELL_EVENT, type SpellDetail } from "@/lib/rickroll";
import type { IntroStage, SceneEngine } from "./engine";

type Props = {
  preview: ChapterId;
  highlighted: ChapterId | null;
  reducedMotion: boolean;
  intro: boolean;
  onPointerCluster: (id: ChapterId | null) => void;
  onIntro: (stage: IntroStage) => void;
};

export function Constellation({ preview, highlighted, reducedMotion, intro, onPointerCluster, onIntro }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<SceneEngine | null>(null);
  const callbacks = useRef({ onPointerCluster, onIntro });
  const latest = useRef({ preview, highlighted });
  const introRef = useRef(intro);
  const [status, setStatus] = useState<"loading" | "ready" | "unavailable">("loading");

  callbacks.current = { onPointerCluster, onIntro };
  latest.current = { preview, highlighted };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let disposed = false;

    import("./engine")
      .then(({ SceneEngine }) => {
        if (disposed) return;
        const engine = new SceneEngine(container, {
          reducedMotion,
          intro: introRef.current,
          onPointerCluster: (id) => callbacks.current.onPointerCluster(id),
          onIntro: (stage) => callbacks.current.onIntro(stage),
        });
        introRef.current = false;
        engine.setState(latest.current);
        engineRef.current = engine;        setStatus("ready");
      })
      .catch(() => {
        if (!disposed) setStatus("unavailable");
      });

    return () => {
      disposed = true;
      engineRef.current?.destroy();
      engineRef.current = null;
    };
  }, [reducedMotion]);

  useEffect(() => {
    engineRef.current?.setState({ preview, highlighted });
  }, [preview, highlighted]);

  useEffect(() => {
    const onSpell = (event: Event) => {
      const detail = (event as CustomEvent<SpellDetail>).detail;
      if (engineRef.current?.spell(detail.lines, detail.hold)) detail.handled = true;
    };
    window.addEventListener(SPELL_EVENT, onSpell);
    return () => window.removeEventListener(SPELL_EVENT, onSpell);
  }, []);

  return (
    <div ref={containerRef} className="scene" data-status={status}>
      {status === "unavailable" && (
        <div
          className="scene__fallback"
          role="img"
          aria-label="Monochrome illustration: a walking figure with a prosthetic leg, a house above raised ground, people connected by a network, and satellites orbiting Earth."
        />
      )}
    </div>
  );
}
