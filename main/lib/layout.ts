import { CHAPTER_IDS, type ChapterId } from "@/content/chapters";

export const COMPACT_BREAKPOINT = 900;

export type Point = { x: number; y: number };

export type ClusterSlot = {
  center: Point;
  /** Half-extent of the form, in CSS pixels. */
  scale: number;
};

export type SceneLayout = {
  width: number;
  height: number;
  compact: boolean;
  clusters: Record<ChapterId, ClusterSlot>;
  focus: ClusterSlot;
};

export function computeLayout(width: number, height: number): SceneLayout {
  const compact = width < COMPACT_BREAKPOINT;

  if (compact) {
    const scale = Math.min(width * 0.36, height * 0.4);
    const center = { x: width / 2, y: height / 2 };
    const slot = { center, scale };
    const clusters = Object.fromEntries(CHAPTER_IDS.map((id) => [id, slot])) as Record<
      ChapterId,
      ClusterSlot
    >;
    return { width, height, compact, clusters, focus: slot };
  }

  const gutter = width >= 1280 ? 48 : 24;
  const rowTop = Math.max(height * 0.44, 390);
  const rowBottom = height - 112;
  const slotWidth = (width - gutter * 2) / CHAPTER_IDS.length;
  const scale = Math.max(48, Math.min(slotWidth * 0.4, ((rowBottom - rowTop) / 2) * 0.96));
  const centerY = (rowTop + rowBottom) / 2;

  const clusters = Object.fromEntries(
    CHAPTER_IDS.map((id, i) => [id, { center: { x: gutter + slotWidth * (i + 0.5), y: centerY }, scale }]),
  ) as Record<ChapterId, ClusterSlot>;

  const focus = {
    center: { x: width * 0.68, y: height * 0.48 },
    scale: Math.min(width * 0.24, height * 0.34),
  };

  return { width, height, compact, clusters, focus };
}
