"use client";

import Link from "next/link";
import { forwardRef } from "react";
import type { Chapter } from "@/content/chapters";

type Props = {
  chapter: Chapter;
  onBack: () => void;
};

export const ChapterPanel = forwardRef<HTMLHeadingElement, Props>(function ChapterPanel(
  { chapter, onBack },
  headingRef,
) {
  return (
    <article className="panel" aria-labelledby={`panel-${chapter.id}`}>
      <button type="button" className="panel__back" onClick={onBack}>
        <span aria-hidden="true">←</span> Back to overview
      </button>
      <p className="eyebrow">
        {chapter.index} / {chapter.field}
      </p>
      <h2 id={`panel-${chapter.id}`} ref={headingRef} tabIndex={-1} className="panel__title">
        {chapter.organization}
      </h2>
      <p className="panel__role">
        {chapter.role} <span aria-hidden="true">·</span> {chapter.dates}
      </p>
      <p className="panel__summary">{chapter.summary}</p>
      {chapter.highlights.length > 0 && (
        <ul className="panel__highlights">
          {chapter.highlights.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
      <div className="panel__links">
        {chapter.links.map((link) =>
          link.external ? (
            <a key={link.href} href={link.href} target="_blank" rel="noreferrer" className="text-link">
              {link.label} <span aria-hidden="true">↗</span>
            </a>
          ) : (
            <Link key={link.href} href={link.href} className="text-link">
              {link.label} <span aria-hidden="true">→</span>
            </Link>
          ),
        )}
      </div>
    </article>
  );
});
