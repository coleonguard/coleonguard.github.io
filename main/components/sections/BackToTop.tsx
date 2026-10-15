"use client";

import type { MouseEvent } from "react";

export function BackToTop() {
  function onClick(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }

  return (
    <a href="#" className="footer__top" onClick={onClick}>
      Back to top <span aria-hidden="true">↑</span>
    </a>
  );
}
