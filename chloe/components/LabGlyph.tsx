"use client";

import { useRef, useState } from "react";
import { useCanvasLoop, type Draw } from "@/components/canvas/useCanvasLoop";
import { GLYPHS, type GlyphName } from "@/components/lab/glyphs";

const STILL_TIME = 1.8;

export function LabGlyph({ name }: { name: GlyphName }) {
  const frameRef = useRef<HTMLSpanElement>(null);
  const [draw] = useState(() => {
    const render: Draw = (ctx, { t, still, palette, width, height }) =>
      GLYPHS[name](ctx, still ? STILL_TIME : t, width, height, palette);
    return render;
  });
  const canvasRef = useCanvasLoop(draw, frameRef);

  return (
    <span ref={frameRef} className="lab-glyph" aria-hidden="true">
      <canvas ref={canvasRef} className="lab-glyph__canvas" />
    </span>
  );
}
