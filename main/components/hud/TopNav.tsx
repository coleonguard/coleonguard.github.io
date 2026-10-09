import Link from "next/link";
import { PROFILE } from "@/content/profile";

export function TopNav() {
  return (
    <header className="topnav">
      <Link href="/" className="topnav__wordmark">
        Cole Johnson
      </Link>
      <nav aria-label="Primary" className="topnav__links">
        <a href={PROFILE.portfolio} target="_blank" rel="noreferrer">
          Portfolio <span aria-hidden="true">↗</span>
        </a>
        <a href={`mailto:${PROFILE.email}`}>Contact</a>
      </nav>
    </header>
  );
}
