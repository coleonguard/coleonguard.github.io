type Props = {
  top: string;
  word: string;
  bottom: string;
  play: boolean;
  className?: string;
};

export function Stamp({ top, word, bottom, play, className }: Props) {
  return (
    <span className={className ? `stamp ${className}` : "stamp"} data-play={play ? "true" : "false"} aria-hidden="true">
      <span className="stamp__ink">
        <span className="stamp__rule">{top}</span>
        <span className="stamp__word">{word}</span>
        <span className="stamp__rule">{bottom}</span>
      </span>
    </span>
  );
}
