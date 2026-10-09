"use client";

import { rickroll } from "@/lib/rickroll";

export function DeclassifyLink() {
  return (
    <button type="button" className="declassify-link" onClick={rickroll}>
      Request declassification ↗
    </button>
  );
}
