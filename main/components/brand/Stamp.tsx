type Props = {
  top: string;
  word: string;
  bottom: string;
  play: boolean;
  className?: string;
  onClick?: () => void;
};

export function Stamp({ top, word, bottom, play, className, onClick }: Props) {
  return (
    <span
      className={className ? `stamp ${className}` : "stamp"}
      data-play={play ? "true" : "false"}
      aria-hidden="true"
      onClick={onClick}
    >
      <span className="stamp__ink">
        <span className="stamp__rule">{top}</span>
        <span className="stamp__word">{word}</span>
        <span className="stamp__rule">{bottom}</span>
      </span>
    </span>
  );
}
