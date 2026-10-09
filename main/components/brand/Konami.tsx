"use client";

import { useEffect } from "react";
import { rickroll, SPELL_EVENT, type SpellDetail } from "@/lib/rickroll";

const CODE = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a"];
const MESSAGE = ["NEVER GONNA", "GIVE YOU UP"];
const HOLD = 1.6;
const ROLL_AFTER = 1900;

export function Konami() {
  useEffect(() => {
    let progress = 0;
    const onKey = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key === CODE[progress]) progress++;
      else if (key === CODE[0]) progress = progress === 2 ? 2 : 1;
      else progress = 0;
      if (progress < CODE.length) return;
      progress = 0;
      const detail: SpellDetail = { lines: MESSAGE, hold: HOLD, handled: false };
      window.dispatchEvent(new CustomEvent(SPELL_EVENT, { detail }));
      if (detail.handled) window.setTimeout(rickroll, ROLL_AFTER);
      else rickroll();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return null;
}
