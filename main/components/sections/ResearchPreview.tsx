"use client";

import { useState } from "react";
import { PUBLICATIONS } from "@/content/research";

const INITIAL_COUNT = 5;
const HIDDEN_FROM_HOME = new Set(["J1"]);

const GROUP_ORDER = { published: 0, review: 1, presentation: 2 } as const;

const PAPERS = PUBLICATIONS.filter((p) => p.group !== "presentation" && !HIDDEN_FROM_HOME.has(p.id)).sort(
  (a, b) => GROUP_ORDER[a.group] - GROUP_ORDER[b.group],
);

export function ResearchPreview() {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? PAPERS : PAPERS.slice(0, INITIAL_COUNT);

  return (
    <section className="section" aria-labelledby="research-preview">
      <div className="section__head">
        <h2 id="research-preview" className="section__title">
          Learning-based control for prostheses and legged robots.
        </h2>
      </div>
      <ol className="pub-list" id="publication-list">
        {visible.map((p) => (
          <li key={p.id} className="pub" data-featured={p.featured ? "true" : undefined}>
            <p className="pub__title">{p.title}</p>
            <p className="pub__meta">
              {p.venue} · {p.year}
              {p.note ? ` · ${p.note}` : ""}
            </p>
            {expanded && p.links.length > 0 && (
              <p className="pub__links">
                {p.links.map((link) => (
                  <a key={link.href} href={link.href} target="_blank" rel="noreferrer" className="text-link">
                    {link.label} ↗
                  </a>
                ))}
              </p>
            )}
          </li>
        ))}
      </ol>
      {PAPERS.length > INITIAL_COUNT && (
        <button
          type="button"
          className="text-link"
          aria-expanded={expanded}
          aria-controls="publication-list"
          onClick={() => setExpanded((e) => !e)}
        >
          {expanded ? "See less" : "See more"}
        </button>
      )}
    </section>
  );
}
