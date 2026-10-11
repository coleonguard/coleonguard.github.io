import { ImageResponse } from "next/og";
import { ACCENT, INK, PAPER } from "@/components/Dot";
import { SITE } from "@/content/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = SITE.name;

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: 80,
          background: PAPER,
          color: INK,
        }}
      >
        <div style={{ width: 28, height: 28, borderRadius: 14, background: ACCENT, marginBottom: 40 }} />
        <div style={{ fontSize: 84, fontWeight: 300, letterSpacing: -2, lineHeight: 1.05 }}>{SITE.name}</div>
        <div style={{ fontSize: 30, marginTop: 24, color: "#5f626a" }}>{SITE.role}</div>
      </div>
    ),
    size,
  );
}
