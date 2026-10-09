import type { CSSProperties } from "react";
import { CHAPTER_LIST, type ChapterId, type Phrase } from "@/content/chapters";

function PhraseText({ phrase }: { phrase: Phrase }) {
  let bar = 0;
  return phrase.map((part, i) => {
    if (typeof part === "string") return <span key={i}>{part}</span>;
    const order = bar++;
    return (
      <span
        key={i}
        className="redacted"
        style={{ "--chars": part.redact, "--order": order } as CSSProperties}
      >
        <span className="sr-only">redacted</span>
      </span>
    );
  });
}

export function Substrates({ active }: { active: ChapterId | null }) {
  return (
    <div className="substrates">
      {CHAPTER_LIST.map(({ id, substrate }) => (
        <div
          key={id}
          id={`substrate-${id}`}
          className="substrate"
          data-active={active === id ? "true" : "false"}
          aria-hidden={active !== id}
          data-classified={substrate.classified ? "true" : "false"}
        >
          <p className="substrate__through">
            <span className="substrate__lead">Intelligence through </span>
            <PhraseText phrase={substrate.through} />
          </p>
          <p className="substrate__text">
            <PhraseText phrase={substrate.text} />
          </p>
          {substrate.classified && (
            <>
              <span className="substrate__stamp" aria-hidden="true">
                Top secret
              </span>
              <p className="substrate__footnote">Approved for public release. Declassify on: never.</p>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
