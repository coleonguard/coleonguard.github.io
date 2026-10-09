"use client";

import { CHAPTER_LIST, type ChapterId } from "@/content/chapters";

type Props = {
  active: ChapterId | null;
  onSelect: (id: ChapterId) => void;
  onHighlight: (id: ChapterId | null) => void;
  register: (id: ChapterId, element: HTMLButtonElement | null) => void;
};

export function ChapterSelectors({ active, onSelect, onHighlight, register }: Props) {
  return (
    <nav aria-label="Chapters" className="selectors">
      {CHAPTER_LIST.map((chapter) => (
        <button
          key={chapter.id}
          ref={(el) => register(chapter.id, el)}
          type="button"
          className="selectors__item"
          aria-current={active === chapter.id ? "true" : undefined}
          onClick={() => onSelect(chapter.id)}
          onPointerEnter={() => onHighlight(chapter.id)}
          onPointerLeave={() => onHighlight(null)}
          onFocus={() => onHighlight(chapter.id)}
          onBlur={() => onHighlight(null)}
        >
          <span className="selectors__index">{chapter.index}</span>
          <span>{chapter.label}</span>
        </button>
      ))}
    </nav>
  );
}
