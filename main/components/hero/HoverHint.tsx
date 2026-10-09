export function HoverHint({ visible }: { visible: boolean }) {
  return (
    <div className="hover-hint" data-visible={visible ? "true" : "false"} aria-hidden="true">
      <p className="substrate__through">
        <span className="substrate__lead">Intelligence through </span>
        <span className="hover-hint__blank" />
      </p>
      <p className="hover-hint__cue">Hover a form to complete the sentence ↓</p>
    </div>
  );
}
