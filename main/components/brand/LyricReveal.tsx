"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { nextLyric } from "@/lib/rickroll";

const SHOW_FOR = 2400;

type Props = {
  className: string;
  style?: CSSProperties;
  children?: ReactNode;
};

export function LyricReveal({ className, style, children }: Props) {
  const [slip, setSlip] = useState<{ text: string; key: number } | null>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const reveal = () => {
    const text = nextLyric();
    setSlip((current) => ({ text, key: (current?.key ?? 0) + 1 }));
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setSlip(null), SHOW_FOR);
  };

  return (
    <span className={`${className} lyric-host`} style={style} onClick={reveal}>
      {children}
      {slip && (
        <span key={slip.key} className="lyric-slip" aria-hidden="true">
          {slip.text}
        </span>
      )}
    </span>
  );
}
