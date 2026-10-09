import { ImageResponse } from "next/og";
import { BrandDot } from "@/components/brand/BrandDot";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(<BrandDot size={180} />, size);
}
