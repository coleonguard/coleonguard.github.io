const VIDEO = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";

export const LYRICS = [
  "never gonna give you up",
  "never gonna let you down",
  "never gonna run around",
  "and desert you",
];

export const SPELL_EVENT = "particles:spell";

export type SpellDetail = { lines: string[]; hold: number; handled: boolean };

let line = 0;

export function nextLyric(): string {
  const lyric = LYRICS[line % LYRICS.length];
  line++;
  return lyric;
}

/** Opens the video in a new tab; falls back to this tab when the popup is blocked. */
export function rickroll(): void {
  const tab = window.open(VIDEO, "_blank");
  if (tab) tab.opener = null;
  else window.location.assign(VIDEO);
}
