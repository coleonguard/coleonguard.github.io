import { CHAPTER_IDS, type ChapterId } from "@/content/chapters";

type Props = { chapter: ChapterId };

/** A crop of the banner panel for a chapter. Always labeled as an illustration. */
export function Illustration({ chapter }: Props) {
  const position = (CHAPTER_IDS.indexOf(chapter) / (CHAPTER_IDS.length - 1)) * 100;
  return (
    <figure className="illustration">
      <div className="illustration__image" style={{ backgroundPosition: `${position}% 50%` }} aria-hidden="true" />
      <figcaption className="illustration__caption">Illustration</figcaption>
    </figure>
  );
}
