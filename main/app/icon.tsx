import { ImageResponse } from "next/og";
import { Monogram } from "@/components/brand/Monogram";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(<Monogram size={32} />, size);
}
