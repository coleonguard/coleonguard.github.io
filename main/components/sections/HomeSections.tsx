import type { CSSProperties } from "react";
import { CHAPTERS, type ChapterId } from "@/content/chapters";
import { ChapterLogos } from "@/components/brand/ChapterLogos";
import { LyricReveal } from "@/components/brand/LyricReveal";
import { PortfolioLink } from "@/components/brand/PortfolioLink";

const ORDER: ChapterId[] = ["space", "echo", "terranova", "robotics"];

const PUNCHLINE = "That’s";

function RedactingText({ text }: { text: string }) {
  const cut = text.indexOf(PUNCHLINE);
  const secret = cut === -1 ? text : text.slice(0, cut);
  const rest = cut === -1 ? "" : text.slice(cut);
  return (
    <>
      {secret
        .trim()
        .split(" ")
        .map((word, i) => (
          <span key={i}>
            <LyricReveal className="redactable" style={{ "--order": i } as CSSProperties}>
              {word}
            </LyricReveal>{" "}
          </span>
        ))}
      {rest}
    </>
  );
}

function Summary({ id, text }: { id: ChapterId; text: string }) {
  switch (id) {
    case "space":
      return <RedactingText text={text} />;
    case "echo":
      return (
        <>
          {text}
          <span className="typing" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        </>
      );
    case "terranova":
    case "robotics":
      return text;
    default: {
      const unhandled: never = id;
      return unhandled;
    }
  }
}

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
            <li key={id} className="work-row" data-chapter={id}>
              <span className="work-row__mark">
                <ChapterLogos chapter={id} className="work-row__logos" />
                {id === "terranova" && (
                  <span className="work-row__lift" aria-hidden="true">
                    ↑ 1 ft
                  </span>
                )}
              </span>
              <span className="work-row__head">
                <span className="work-row__title">{chapter.role}</span>
                <span className="work-row__role">{chapter.dates}</span>
              </span>
              <span className="work-row__summary">
                <Summary id={id} text={chapter.blurb ?? chapter.highlights[0] ?? chapter.summary} />
              </span>
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
