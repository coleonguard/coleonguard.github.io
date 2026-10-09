"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { PROFILE } from "@/content/profile";

const MAILTO = `mailto:${PROFILE.email}`;

export function ContactLink() {
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
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 3200);
  }

  return (
    <span className="contact">
      <a href={MAILTO} onClick={onClick}>
        Contact
      </a>
      <span className="contact__toast" data-open={copied ? "true" : "false"} role="status">
        {copied && (
          <>
            <span className="contact__title">Email copied</span>
            <span className="contact__body">Unlike Starshield, this part isn’t classified.</span>
            <span className="contact__row">
              <span className="contact__email">{PROFILE.email}</span>
              <a href={MAILTO} className="contact__open">
                Open mail app
              </a>
            </span>
          </>
        )}
      </span>
    </span>
  );
}
