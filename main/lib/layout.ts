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

const OVERVIEW_POSITIONS: Record<ChapterId, Point> = {
  robotics: { x: 0.16, y: 0.3 },
  terranova: { x: 0.38, y: 0.74 },
  echo: { x: 0.66, y: 0.27 },
  space: { x: 0.86, y: 0.68 },
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
  const regionLeft = width * 0.36;
  const regionRight = width - gutter;
  const regionTop = 96;
  const regionBottom = height - 132;
  const regionWidth = regionRight - regionLeft;
  const regionHeight = regionBottom - regionTop;
  const scale = Math.max(48, Math.min(regionWidth * 0.12, regionHeight * 0.2));

  const clusters = Object.fromEntries(
    CHAPTER_IDS.map((id) => {
      const p = OVERVIEW_POSITIONS[id];
      return [
        id,
        {
          center: { x: regionLeft + p.x * regionWidth, y: regionTop + p.y * regionHeight },
          scale,
        },
      ];
    }),
  ) as Record<ChapterId, ClusterSlot>;

  const focus = {
    center: { x: width * 0.68, y: height * 0.48 },
    scale: Math.min(width * 0.24, height * 0.34),
  };

  return { width, height, compact, clusters, focus };
}
