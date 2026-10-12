import type { Point } from "./useCanvasLoop";

// Shared between the bio scene and the portrait so the portrait's dots can lift off the bio's film.
// Film points are [viewport x, distance above the bottom edge of #story]; filmAlpha is each point's resting opacity.
export const handoff: { film: Point[]; filmAlpha: number[]; lift: number } = { film: [], filmAlpha: [], lift: 0 };
