import Link from "next/link";
import { CHAPTERS, type ChapterId } from "@/content/chapters";
import { PROFILE } from "@/content/profile";

const ORDER: ChapterId[] = ["space", "echo", "terranova", "robotics"];

type Logo = { src: string; alt: string; width: number; height: number };

/** Heights are tuned per mark so the wordmarks read at a similar optical size. */
const LOGOS: Record<ChapterId, Logo[]> = {
  space: [{ src: "/logos/spacex.svg", alt: "SpaceX", width: 160, height: 20 }],
  echo: [{ src: "/logos/echo.svg", alt: "Echo", width: 71, height: 26 }],
  terranova: [{ src: "/logos/terranova.svg", alt: "Terranova", width: 164, height: 24 }],
  robotics: [
    { src: "/logos/georgia-tech.svg", alt: "Georgia Tech", width: 72, height: 32 },
    { src: "/logos/caltech.svg", alt: "Caltech", width: 87, height: 21 },
  ],
};

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
                <span className="work-row__logos">
                  {LOGOS[id].map((logo) => (
                    <img key={logo.src} src={logo.src} alt={logo.alt} width={logo.width} height={logo.height} />
                  ))}
                </span>
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
