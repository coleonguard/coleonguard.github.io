import { ImageResponse } from "next/og";
import { Dot } from "@/components/Dot";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(<Dot size={180} />, size);
}
