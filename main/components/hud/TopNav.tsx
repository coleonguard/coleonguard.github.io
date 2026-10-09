import Link from "next/link";
import { PROFILE } from "@/content/profile";
import { PortfolioLink } from "@/components/brand/PortfolioLink";

export function TopNav() {
  return (
    <header className="topnav">
      <Link href="/" className="topnav__wordmark">
        Cole Johnson
      </Link>
      <nav aria-label="Primary" className="topnav__links">
        <PortfolioLink placement="below-end">
          Portfolio <span aria-hidden="true">↗</span>
        </PortfolioLink>
        <a href={`mailto:${PROFILE.email}`}>Contact</a>
      </nav>
    </header>
  );
}
