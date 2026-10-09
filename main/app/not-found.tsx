import type { CSSProperties } from "react";
import Link from "next/link";
import { Stamp } from "@/components/brand/Stamp";

export default function NotFound() {
  return (
    <main id="main" className="not-found">
      <p className="not-found__code">404</p>
      <h1 className="not-found__title">
        This page has been{" "}
        <span className="redacted not-found__bar" style={{ "--chars": 9, "--order": 0 } as CSSProperties}>
          <span className="sr-only">redacted</span>
        </span>
        .
        <Stamp top="★ Classified ★" word="Not found" bottom="Eyes only" play className="not-found__stamp" />
      </h1>
      <p className="substrate__footnote">Declassify on: never.</p>
      <Link href="/" className="button button--primary not-found__home">
        Back to home
      </Link>
    </main>
  );
}
