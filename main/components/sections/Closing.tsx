import { ContactLink } from "@/components/hud/ContactLink";
import { PROFILE } from "@/content/profile";
import { BackToTop } from "@/components/sections/BackToTop";
export function Closing() {
  return (
    <section className="section closing" aria-labelledby="closing">
      <h2 id="closing" className="section__title">
        Got something cool?
      </h2>
      <p className="closing__lead">Let’s talk.</p>
      <div className="closing__actions">
        <ContactLink className="button button--primary" align="start">
          Email me
        </ContactLink>
        <a className="button button--quiet" href={PROFILE.linkedin} target="_blank" rel="noreferrer">
          LinkedIn <span aria-hidden="true">↗</span>
        </a>
      </div>
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
