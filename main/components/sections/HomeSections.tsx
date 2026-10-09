import Link from "next/link";
import { CHAPTERS, type ChapterId } from "@/content/chapters";
import { PROFILE } from "@/content/profile";
import { PUBLICATIONS } from "@/content/research";
import { Illustration } from "./Illustration";

const SELECTED: ChapterId[] = ["terranova", "echo", "robotics", "space"];

export function SelectedWork() {
  return (
    <section className="section" aria-labelledby="selected-work">
      <div className="section__head">
        <h2 id="selected-work" className="section__title">
          Systems I’ve built, researched, and helped bring into the world.
        </h2>
      </div>
      <div className="work-grid">
        {SELECTED.map((id) => {
          const chapter = CHAPTERS[id];
          return (
            <article key={id} className="work-card">
              <Illustration chapter={id} />
              <p className="eyebrow">
                {chapter.index} / {chapter.label}
              </p>
              <h3 className="work-card__title">{chapter.organization}</h3>
              <p className="work-card__role">
                {chapter.role} · {chapter.dates}
              </p>
              <p className="work-card__summary">{chapter.highlights[0] ?? chapter.summary}</p>
              <Link href={`/?chapter=${id}`} className="text-link">
                Open chapter <span aria-hidden="true">→</span>
              </Link>
            </article>
          );
        })}
      </div>
      <a className="button button--primary section__cta" href={PROFILE.portfolio} target="_blank" rel="noreferrer">
        View full portfolio <span aria-hidden="true">↗</span>
      </a>
    </section>
  );
}

export function ResearchPreview() {
  const preview = PUBLICATIONS.filter((p) => p.group === "published").slice(0, 5);
  return (
    <section className="section" aria-labelledby="research-preview">
      <div className="section__head">
        <h2 id="research-preview" className="section__title">
          Learning-based control for prostheses and legged robots.
        </h2>
      </div>
      <ol className="pub-list">
        {preview.map((p) => (
          <li key={p.id} className="pub" data-featured={p.featured ? "true" : undefined}>
            <p className="pub__title">{p.title}</p>
            <p className="pub__meta">
              {p.venue} · {p.year}
              {p.note ? ` · ${p.note}` : ""}
            </p>
          </li>
        ))}
      </ol>
      <Link href="/research" className="text-link">
        See more <span aria-hidden="true">→</span>
      </Link>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="footer">
      <div>
        <p className="footer__name">Cole Johnson</p>
        <p className="footer__line">Robotics, intelligence, and systems that act in the world.</p>
      </div>
      <nav aria-label="Footer" className="footer__links">
        <Link href="/about">About</Link>
        <Link href="/research">Research</Link>
        <a href={PROFILE.portfolio} target="_blank" rel="noreferrer">
          Portfolio ↗
        </a>
        <a href={PROFILE.resume} target="_blank" rel="noreferrer">
          Résumé ↗
        </a>
        <a href={PROFILE.linkedin} target="_blank" rel="noreferrer">
          LinkedIn ↗
        </a>
        <a href={`mailto:${PROFILE.email}`}>{PROFILE.email}</a>
      </nav>
    </footer>
  );
}
