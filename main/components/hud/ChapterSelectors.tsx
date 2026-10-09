"use client";

import { CHAPTER_LIST, type ChapterId } from "@/content/chapters";
import { ChapterLogos } from "@/components/brand/ChapterLogos";

type Props = {
  active: ChapterId | null;
  onSelect: (id: ChapterId) => void;
  onHighlight: (id: ChapterId | null) => void;
};

export function ChapterSelectors({ active, onSelect, onHighlight }: Props) {
  return (
    <nav aria-label="Chapters" className="selectors">
      {CHAPTER_LIST.map((chapter) => (
        <button
          key={chapter.id}
          type="button"
          className="selectors__item"
          aria-label={`${chapter.index} ${chapter.label}`}
          aria-current={active === chapter.id ? "true" : undefined}
          onClick={() => onSelect(chapter.id)}
          onPointerEnter={() => onHighlight(chapter.id)}
          onPointerLeave={() => onHighlight(null)}
          onFocus={() => onHighlight(chapter.id)}
          onBlur={() => onHighlight(null)}
        >
          <span className="selectors__index">{chapter.index}</span>
          <span className="selectors__label">{chapter.label}</span>
          <ChapterLogos chapter={chapter.id} scale={0.72} decorative className="selectors__logos" />
        </button>
      ))}
    </nav>
  );
}
