import { Fragment } from "react";
import type { ChapterId } from "@/content/chapters";

type Logo = { src: string; alt: string; aspect: number; height: number };

/** Heights are tuned per mark so the wordmarks read at a similar optical size. */
const LOGOS: Record<ChapterId, Logo[]> = {
  robotics: [
    { src: "/logos/georgia-tech.svg", alt: "Georgia Tech", aspect: 2.258, height: 32 },
    { src: "/logos/caltech.svg", alt: "Caltech", aspect: 4.149, height: 21 },
  ],
  terranova: [{ src: "/logos/terranova.svg", alt: "Terranova", aspect: 6.833, height: 24 }],
  echo: [{ src: "/logos/echo.svg", alt: "Echo", aspect: 2.745, height: 26 }],
  space: [{ src: "/logos/spacex.svg", alt: "SpaceX", aspect: 8, height: 20 }],
};

type Props = {
  chapter: ChapterId;
  /** Multiplies the tuned heights. */
  scale?: number;
  /** Hide the marks from assistive tech when the parent already names the chapter. */
  decorative?: boolean;
  className?: string;
};

export function ChapterLogos({ chapter, scale = 1, decorative = false, className }: Props) {
  return (
    <span className={className}>
      {LOGOS[chapter].map((logo, i) => {
        const height = Math.round(logo.height * scale);
        return (
          <Fragment key={logo.src}>
            {i > 0 && (
              <span className="logo-plus" aria-hidden="true" style={{ fontSize: Math.round(22 * scale) }}>
                +
              </span>
            )}
            <img
              src={logo.src}
              alt={decorative ? "" : logo.alt}
              width={Math.round(height * logo.aspect)}
              height={height}
            />
          </Fragment>
        );
      })}
    </span>
  );
}
