import { ImageResponse } from "next/og";
import { BrandDot } from "@/components/brand/BrandDot";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(<BrandDot size={32} />, size);
}
