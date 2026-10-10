import type { CSSProperties } from "react";
import { CHAPTER_LIST, type ChapterId, type Phrase } from "@/content/chapters";
import { LyricReveal } from "@/components/brand/LyricReveal";
import { Stamp } from "@/components/brand/Stamp";

function PhraseText({ phrase }: { phrase: Phrase }) {
  let bar = 0;
  return phrase.map((part, i) => {
    if (typeof part === "string") return <span key={i}>{part}</span>;
    const order = bar++;
    return (
      <LyricReveal key={i} className="redacted" style={{ "--chars": part.redact, "--order": order } as CSSProperties}>
        <span className="sr-only">redacted</span>
      </LyricReveal>
    );
  });
}

type Props = {
  active: ChapterId | null;
  variant?: "aside" | "inline";
  declassified?: boolean;
  onDeclassify?: () => void;
};

export function Substrates({ active, variant = "aside", declassified = false, onDeclassify }: Props) {
  return (
    <div className={`substrates substrates--${variant}`}>
      {CHAPTER_LIST.map(({ id, substrate }) => (
        <div
          key={id}
          id={variant === "aside" ? `substrate-${id}` : undefined}
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
              {declassified ? (
                <Stamp
                  key="declassified"
                  className="stamp--quiet"
                  top="★ Cleared ★"
                  word="Declassified"
                  bottom="Never gonna"
                  play={active === id}
                />
              ) : (
                <Stamp
                  key="classified"
                  className="stamp--quiet"
                  top="★ Classified ★"
                  word="Top secret"
                  bottom="Eyes only"
                  play={active === id}
                  onClick={onDeclassify}
                />
              )}
              <p className="substrate__footnote">Approved for public release. Declassify on: never.</p>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
