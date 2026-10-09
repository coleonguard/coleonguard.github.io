"use client";

import { useEffect } from "react";
import { PROFILE } from "@/content/profile";

let printed = false;

export function ConsoleNote() {
  useEffect(() => {
    if (printed) return;
    printed = true;
    console.log(
      `%c· · ·  C O L E   J O H N S O N  · · ·%c\n\nYou read source code for fun. Same.\nSay hi: ${PROFILE.email}`,
      "font: 600 12px ui-monospace, monospace; letter-spacing: 0.1em; color: #c8a06a;",
      "font: 12px ui-monospace, monospace; color: #8a8d93;",
    );
  }, []);
  return null;
}
