import { ImageResponse } from "next/og";
import { PAPER } from "@/components/Dot";
import { TennisBall } from "@/components/TennisBall";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(<TennisBall size={180} background={PAPER} />, size);
}
