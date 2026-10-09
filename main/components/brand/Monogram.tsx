const ROWS = [
  ".###..###",
  "#......#.",
  "#......#.",
  "#......#.",
  "#......#.",
  "#....#.#.",
  ".###..#..",
];

export function Monogram({ size }: { size: number }) {
  const cell = Math.floor((size * 0.86) / ROWS[0].length);
  const dot = Math.max(2, Math.round(cell * 0.72));
  return (
    <div
      style={{
        width: size,
        height: size,
        background: "#0b0b0c",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: size * 0.18,
      }}
    >
      {ROWS.map((row, r) => (
        <div key={r} style={{ display: "flex" }}>
          {row.split("").map((c, i) => (
            <div key={i} style={{ width: cell, height: cell, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {c === "#" ? <div style={{ width: dot, height: dot, borderRadius: dot, background: "#f4f4f2" }} /> : null}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
