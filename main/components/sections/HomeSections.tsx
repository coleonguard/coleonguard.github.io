import Link from "next/link";
import { CHAPTERS, type ChapterId } from "@/content/chapters";
import { PROFILE } from "@/content/profile";
import { Illustration } from "./Illustration";

const SELECTED: ChapterId[] = ["terranova", "echo", "robotics", "space"];

export function SelectedWork() {
  return (
    <section className="section" aria-labelledby="selected-work">
      <div className="section__head">
        <h2 id="selected-work" className="section__title">
          Work
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