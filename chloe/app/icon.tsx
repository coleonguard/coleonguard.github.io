import { ImageResponse } from "next/og";
import { Dot } from "@/components/Dot";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(<Dot size={32} />, size);
}
