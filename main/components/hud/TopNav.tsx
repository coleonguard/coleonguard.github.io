import Link from "next/link";
import { PortfolioLink } from "@/components/brand/PortfolioLink";
import { PROFILE } from "@/content/profile";
import { ContactLink } from "./ContactLink";

export function TopNav() {
  return (
    <header className="topnav">
      <Link href="/" className="topnav__wordmark">
        Cole Johnson
      </Link>
      <nav aria-label="Primary" className="topnav__links">
        <PortfolioLink placement="below-end">
          Portfolio{" "}
          <span className="topnav__arrow" aria-hidden="true">
            ↗
          </span>
        </PortfolioLink>
        <a href={PROFILE.linkedin} target="_blank" rel="noreferrer">
          LinkedIn{" "}
          <span className="topnav__arrow" aria-hidden="true">
            ↗
          </span>
        </a>
        <ContactLink />
      </nav>
    </header>
  );
}
