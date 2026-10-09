"use client";

import { useEffect, useRef, useState } from "react";

const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWER = "abcdefghijklmnopqrstuvwxyz";
const DURATION = 900;

function glyphFor(char: string): string {
  if (char === " ") return " ";
  const set = char === char.toUpperCase() && char !== char.toLowerCase() ? UPPER : LOWER;
  return set[Math.floor(Math.random() * set.length)];
}

type Props = {
  text: string;
  play: boolean;
  delay?: number;
};

function scramble(text: string, revealed: number): string {
  let out = text.slice(0, revealed);
  for (let i = revealed; i < text.length; i++) {
    out += glyphFor(text[i]);
  }
  return out;
}

export function DecodeText({ text, play, delay = 0 }: Props) {
  const [shown, setShown] = useState(text);
  const played = useRef(false);

  useEffect(() => {
    if (!play || played.current) return;
    played.current = true;
    let frame = 0;
    let start = 0;
    let last = 0;
    setShown(scramble(text, 0));
    const tick = (now: number) => {
      if (!start) start = now + delay;
      const progress = Math.min(1, Math.max(0, (now - start) / DURATION));
      if (progress >= 1) {
        setShown(text);
        return;
      }
      if (now - last > 40) {
        last = now;
        setShown(scramble(text, Math.floor(progress * text.length)));
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      played.current = false;
      setShown(text);
    };
  }, [play, text, delay]);

  return (
    <span className="decode">
      <span className="decode__ghost">{text}</span>
      <span className="decode__shown" aria-hidden="true">
        {shown}
      </span>
    </span>
  );
}
