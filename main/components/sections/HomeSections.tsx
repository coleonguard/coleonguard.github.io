import Link from "next/link";
import { CHAPTERS, type ChapterId } from "@/content/chapters";
import { PROFILE } from "@/content/profile";
import { ChapterLogos } from "@/components/brand/ChapterLogos";

const ORDER: ChapterId[] = ["space", "echo", "terranova", "robotics"];

export function SelectedWork() {
  return (
    <section className="section" aria-labelledby="selected-work">
      <div className="section__head">
        <h2 id="selected-work" className="section__title">
          Work
        </h2>
      </div>
      <ul className="work-list">
        {ORDER.map((id) => {
          const chapter = CHAPTERS[id];
          return (
            <li key={id}>
              <Link href={`/?chapter=${id}`} className="work-row">
                <ChapterLogos chapter={id} className="work-row__logos" />
                <span className="work-row__head">
                  <span className="work-row__title">{chapter.organization}</span>
                  <span className="work-row__role">
                    {chapter.role} · {chapter.dates}
                  </span>
                </span>
                <span className="work-row__summary">{chapter.blurb ?? chapter.highlights[0] ?? chapter.summary}</span>
                <span className="work-row__arrow" aria-hidden="true">
                  →
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      <a className="button button--primary section__cta" href={PROFILE.portfolio} target="_blank" rel="noreferrer">
        View full portfolio <span aria-hidden="true">↗</span>
      </a>
    </section>
  );
}
