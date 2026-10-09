"use client";

type Props = {
  paused: boolean;
  motionReduced: boolean;
  onTogglePaused: () => void;
  onReset: () => void;
  canReset: boolean;
};

export function MotionControls({ paused, motionReduced, onTogglePaused, onReset, canReset }: Props) {
  return (
    <div className="motion" role="group" aria-label="Scene controls">
      {motionReduced ? (
        <span className="hud-note">Motion reduced</span>
      ) : (
        <button type="button" className="hud-button" aria-pressed={paused} onClick={onTogglePaused}>
          {paused ? "Resume motion" : "Pause motion"}
        </button>
      )}
      <button type="button" className="hud-button" onClick={onReset} disabled={!canReset}>
        Reset view
      </button>
    </div>
  );
}
