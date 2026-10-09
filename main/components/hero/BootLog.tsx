import type { CSSProperties } from "react";

const LINES: { label: string; status: string; redacted?: boolean }[] = [
  { label: "human body", status: "ok" },
  { label: "simple physics", status: "ok" },
  { label: "social fabric", status: "ok" },
  { label: "in orbit", status: "[redacted]", redacted: true },
];

export function BootLog() {
  return (
    <div className="bootlog" aria-hidden="true">
      <p className="bootlog__line" style={{ "--line": 0 } as CSSProperties}>
        &gt; init substrates
      </p>
      {LINES.map((line, i) => (
        <p key={line.label} className="bootlog__line bootlog__row" style={{ "--line": i + 1 } as CSSProperties}>
          <span>
            {line.redacted && <span className="bootlog__bar" />}
            {line.label}
          </span>
          <span className="bootlog__dots" />
          <span className={line.redacted ? "bootlog__status bootlog__status--redacted" : "bootlog__status"}>
            {line.status}
          </span>
        </p>
      ))}
      <p className="bootlog__line" style={{ "--line": LINES.length + 1 } as CSSProperties}>
        ready.
      </p>
    </div>
  );
}
