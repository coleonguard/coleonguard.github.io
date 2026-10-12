export function TennisBall({ size, background = "transparent" }: { size: number; background?: string }) {
  const inner = background === "transparent" ? size : size * 0.72;
  return (
    <div style={{ width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center", background }}>
      <svg width={inner} height={inner} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="felt" cx="38%" cy="32%" r="70%">
            <stop offset="0%" stopColor="#e4f06a" />
            <stop offset="70%" stopColor="#c9dc3c" />
            <stop offset="100%" stopColor="#9fb22a" />
          </radialGradient>
          <clipPath id="ball">
            <circle cx="16" cy="16" r="15" />
          </clipPath>
        </defs>
        <circle cx="16" cy="16" r="15" fill="url(#felt)" />
        <g clipPath="url(#ball)" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round">
          <path d="M 7 1.5 C 14 9, 14 23, 7 30.5" />
          <path d="M 25 1.5 C 18 9, 18 23, 25 30.5" />
        </g>
      </svg>
    </div>
  );
}
