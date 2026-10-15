import { ContactLink } from "@/components/hud/ContactLink";
import { PROFILE } from "@/content/profile";
import { BackToTop } from "@/components/sections/BackToTop";

const LINKEDIN_HANDLE = PROFILE.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\//, "").replace(/\/$/, "");

export function Closing() {
  return (
    <section className="section closing" aria-labelledby="closing">
      <div className="closing__intro">
        <h2 id="closing" className="section__title">
          Got something cool?
        </h2>
        <p className="closing__lead">Let’s talk.</p>
      </div>
      <ul className="closing__links">
        <li>
          <ContactLink className="closing__row">
            <span className="closing__label">Email</span>
            <span className="closing__value">{PROFILE.email}</span>
            <span className="closing__hint">Copy</span>
          </ContactLink>
        </li>
        <li>
          <a className="closing__row" href={PROFILE.linkedin} target="_blank" rel="noreferrer">
            <span className="closing__label">LinkedIn</span>
            <span className="closing__value">{LINKEDIN_HANDLE}</span>
            <span className="closing__hint" aria-hidden="true">
              ↗
            </span>
          </a>
        </li>
      </ul>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="footer">
      <span>© {new Date().getFullYear()} Cole Johnson</span>
      <BackToTop />
    </footer>
  );
}
