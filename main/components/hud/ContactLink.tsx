"use client";

import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { PROFILE } from "@/content/profile";

const MAILTO = `mailto:${PROFILE.email}`;

export function ContactLink({
  children = "Contact",
  className,
  align = "end",
}: {
  children?: ReactNode;
  className?: string;
  align?: "start" | "end";
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function onClick(event: MouseEvent<HTMLAnchorElement>) {
    if (!navigator.clipboard) return;
    event.preventDefault();
    try {
      await navigator.clipboard.writeText(PROFILE.email);
    } catch {
      window.location.href = MAILTO;
      return;
    }
    setCopied(true);
    scheduleClose();
  }

  function scheduleClose() {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 6000);
  }

  return (
    <span className="contact">
      <a href={MAILTO} onClick={onClick} className={className}>
        {children}
      </a>
      <span
        className="contact__toast"
        data-open={copied ? "true" : "false"}
        data-align={align}
        role="status"
        onMouseEnter={() => window.clearTimeout(timer.current)}
        onMouseLeave={() => copied && scheduleClose()}
      >
        {copied && (
          <>
            <span className="contact__title">
              <svg className="contact__check" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M3.5 8.5l3 3 6-7" />
              </svg>
              Email copied
            </span>
            <span className="contact__body">Unlike Starshield, this part isn’t classified.</span>
            <span className="contact__email">{PROFILE.email}</span>
            <a href={MAILTO} className="contact__open">
              Open mail app <span aria-hidden="true">↗</span>
            </a>
          </>
        )}
      </span>
    </span>
  );
}
