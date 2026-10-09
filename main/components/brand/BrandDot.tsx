export function BrandDot({ size }: { size: number }) {
  const dot = Math.round(size * 0.75);
  const ring = Math.max(1.5, size * 0.06);
  return (
    <div style={{ width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          width: dot,
          height: dot,
          borderRadius: dot,
          background: "#0b0b0c",
          border: `${ring}px solid rgba(244, 244, 242, 0.55)`,
        }}
      />
    </div>
  );
}
