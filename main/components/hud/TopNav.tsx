import Link from "next/link";
import { PortfolioLink } from "@/components/brand/PortfolioLink";
import { ContactLink } from "./ContactLink";

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
        <ContactLink />
      </nav>
    </header>
  );
}
