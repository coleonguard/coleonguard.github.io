"use client";

type Props = {
  onReset: () => void;
  canReset: boolean;
};

export function MotionControls({ onReset, canReset }: Props) {
  return (
    <div className="motion" role="group" aria-label="Scene controls">
      <button type="button" className="hud-button" onClick={onReset} disabled={!canReset}>
        Reset view
      </button>
    </div>
  );
}
