export const INK = "#16171b";
export const PAPER = "#f6f4ef";
export const ACCENT = "#2f4bc4";

export function Dot({ size }: { size: number }) {
  return (
    <div style={{ width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent" }}>
      <div
        style={{
          width: size * 0.75,
          height: size * 0.75,
          borderRadius: "50%",
          background: ACCENT,
          border: `${Math.max(1.5, size * 0.06)}px solid ${PAPER}`,
        }}
      />
    </div>
  );
}
