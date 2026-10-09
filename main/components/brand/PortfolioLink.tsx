"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import { PROFILE } from "@/content/profile";
import { useReducedMotion } from "@/lib/useReducedMotion";

const UPDATED = new Date(PROFILE.portfolioUpdated).getTime();
const DAY = 86_400_000;
const COUNT_UP_MS = 700;

type Placement = "above" | "below" | "below-end";

type Props = {
  className?: string;
  wrapperClassName?: string;
  placement: Placement;
  children: ReactNode;
};

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function clock(elapsed: number): string {
  const seconds = Math.floor((elapsed % DAY) / 1000);
  return `${pad(Math.floor(seconds / 3600))}:${pad(Math.floor((seconds % 3600) / 60))}:${pad(seconds % 60)}`;
}

export function PortfolioLink({ className, wrapperClassName, placement, children }: Props) {
  const id = useId();
  const reducedMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [now, setNow] = useState<number | null>(null);
  const [progress, setProgress] = useState(1);

  useEffect(() => {
    if (!open) return;
    setNow(Date.now());
    const tick = window.setInterval(() => setNow(Date.now()), 1000);

    let frame = 0;
    if (!reducedMotion) {
      const start = performance.now();
      const step = (t: number) => {
        const u = Math.min(1, (t - start) / COUNT_UP_MS);
        setProgress(1 - Math.pow(1 - u, 3));
        if (u < 1) frame = requestAnimationFrame(step);
      };
      setProgress(0);
      frame = requestAnimationFrame(step);
    }

    return () => {
      window.clearInterval(tick);
      cancelAnimationFrame(frame);
    };
  }, [open, reducedMotion]);

  const elapsed = now === null ? null : Math.max(0, now - UPDATED);
  const days = elapsed === null ? "---" : String(Math.round(Math.floor(elapsed / DAY) * progress));
  const time = elapsed === null ? "--:--:--" : clock(elapsed);
  const since = new Date(UPDATED).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <span
      className={["legacy", wrapperClassName].filter(Boolean).join(" ")}
      data-open={open ? "true" : "false"}
      data-placement={placement}
      onPointerEnter={() => setOpen(true)}
      onPointerLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <a className={className} href={PROFILE.portfolio} target="_blank" rel="noreferrer" aria-describedby={id}>
        {children}
      </a>
      <span id={id} role="tooltip" className="legacy__warning">
        <span className="sr-only">Warning: this portfolio hasn’t been updated since {since}.</span>
        <span className="legacy__title" aria-hidden="true">
          Warning: legacy site ahead
        </span>
        <span className="legacy__sign" aria-hidden="true">
          <span className="legacy__days">{days}</span>
          <span className="legacy__unit">
            days since last update
            <span className="legacy__clock">{time}</span>
          </span>
        </span>
        <span className="legacy__body" aria-hidden="true">
          Untouched since {since}. Expect questionable philosophical ramblings and design choices I now regret.
        </span>
        <span className="legacy__foot" aria-hidden="true">
          Cringe not covered by warranty.
        </span>
      </span>
    </span>
  );
}
