"use client";

import { useEffect, useRef, useState } from "react";
import type { ChapterId } from "@/content/chapters";
import type { SceneEngine } from "./engine";

type Props = {
  focused: ChapterId | null;
  preview: ChapterId;
  highlighted: ChapterId | null;
  paused: boolean;
  reducedMotion: boolean;
  onPointerCluster: (id: ChapterId | null) => void;
  onSelect: (id: ChapterId) => void;
};

export function Constellation({
  focused,
  preview,
  highlighted,
  paused,
  reducedMotion,
  onPointerCluster,
  onSelect,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<SceneEngine | null>(null);
  const callbacks = useRef({ onPointerCluster, onSelect });
  const latest = useRef({ focused, preview, highlighted, paused });
  const [status, setStatus] = useState<"loading" | "ready" | "unavailable">("loading");

  callbacks.current = { onPointerCluster, onSelect };
  latest.current = { focused, preview, highlighted, paused };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let disposed = false;

    import("./engine")
      .then(({ SceneEngine }) => {
        if (disposed) return;
        const engine = new SceneEngine(container, {
          reducedMotion,
          onPointerCluster: (id) => callbacks.current.onPointerCluster(id),
          onSelect: (id) => callbacks.current.onSelect(id),
        });
        const { focused: f, preview: p, highlighted: h, paused: paused0 } = latest.current;
        engine.setState({ focused: f, preview: p, highlighted: h });
        engine.setPaused(paused0);
        engineRef.current = engine;
        setStatus("ready");
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
    engineRef.current?.setState({ focused, preview, highlighted });
  }, [focused, preview, highlighted]);

  useEffect(() => {
    engineRef.current?.setPaused(paused);
  }, [paused]);

  return (
    <div ref={containerRef} className="scene" data-status={status}>
      {status !== "ready" && (
        <div
          className="scene__fallback"
          role="img"
          aria-label="Monochrome illustration: a walking figure with a prosthetic leg, a house above raised ground, people connected by a network, and satellites orbiting Earth."
        />
      )}
    </div>
  );
}
