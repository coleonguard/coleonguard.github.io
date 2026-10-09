"use client";

import { useEffect } from "react";
import { PROFILE } from "@/content/profile";
import { rickroll } from "@/lib/rickroll";

declare global {
  interface Window {
    declassify?: () => string;
  }
}

let printed = false;

export function ConsoleNote() {
  useEffect(() => {
    window.declassify = () => {
      rickroll();
      return "Clearance granted.";
    };
    if (printed) return;
    printed = true;
    console.log(
      `%c· · ·  C O L E   J O H N S O N  · · ·%c\n\nYou read source code for fun. Same.\nSay hi: ${PROFILE.email}\n\nCleared for the classified stuff? Run declassify()`,
      "font: 600 12px ui-monospace, monospace; letter-spacing: 0.1em; color: #c8a06a;",
      "font: 12px ui-monospace, monospace; color: #8a8d93;",
    );
  }, []);
  return null;
}
