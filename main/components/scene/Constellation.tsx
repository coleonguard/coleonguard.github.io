"use client";

import { useEffect, useRef, useState } from "react";
import type { ChapterId } from "@/content/chapters";
import type { SceneEngine } from "./engine";

type Props = {
  focused: ChapterId | null;
  preview: ChapterId;
  highlighted: ChapterId | null;
  reducedMotion: boolean;
  onPointerCluster: (id: ChapterId | null) => void;
  onSelect: (id: ChapterId) => void;
};

export function Constellation({
  focused,
  preview,
  highlighted,
  reducedMotion,
  onPointerCluster,
  onSelect,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<SceneEngine | null>(null);
  const callbacks = useRef({ onPointerCluster, onSelect });
  const latest = useRef({ focused, preview, highlighted });
  const [status, setStatus] = useState<"loading" | "ready" | "unavailable">("loading");

  callbacks.current = { onPointerCluster, onSelect };
  latest.current = { focused, preview, highlighted };

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
        engine.setState(latest.current);
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
