import { CHAPTERS, type ChapterId } from "@/content/chapters";
import { ChapterLogos } from "@/components/brand/ChapterLogos";
import { PortfolioLink } from "@/components/brand/PortfolioLink";

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
            <li key={id} className="work-row">
              <ChapterLogos chapter={id} className="work-row__logos" />
              <span className="work-row__head">
                <span className="work-row__title">{chapter.role}</span>
                <span className="work-row__role">{chapter.dates}</span>
              </span>
              <span className="work-row__summary">{chapter.blurb ?? chapter.highlights[0] ?? chapter.summary}</span>
            </li>
          );
        })}
      </ul>
      <PortfolioLink className="button button--primary" wrapperClassName="section__cta" placement="above">
        View full portfolio <span aria-hidden="true">↗</span>
      </PortfolioLink>
    </section>
  );
}
