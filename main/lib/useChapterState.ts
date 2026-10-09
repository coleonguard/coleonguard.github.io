"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { isChapterId, type ChapterId } from "@/content/chapters";

const PARAM = "chapter";

/** Selected chapter, mirrored into `?chapter=` so browser Back returns to the overview. */
export function useChapterState() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const value = params.get(PARAM);
  const selected: ChapterId | null = isChapterId(value) ? value : null;

  const select = useCallback(
    (id: ChapterId | null) => {
      if (id === selected) return;
      const href = id ? `${pathname}?${PARAM}=${id}` : pathname;
      if (id && selected) {
        router.replace(href, { scroll: false });
      } else {
        router.push(href, { scroll: false });
      }
    },
    [pathname, router, selected],
  );

  return { selected, select };
}
