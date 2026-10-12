import { PldStage } from "@/components/hero/PldStage";
import { Story } from "@/components/Story";
import { BEYOND, EDUCATION, EXPERIENCE, HONORS, PUBLICATIONS, SITE, type Entry } from "@/content/site";

function EntryList({ entries }: { entries: Entry[] }) {
  return (
    <ul className="entry-list">
      {entries.map((entry) => (
        <li key={entry.title} className="entry">
          <h3 className="entry__title">{entry.title}</h3>
          <p className="entry__detail">{entry.detail}</p>
          <span className="entry__dates">{entry.dates}</span>
        </li>
      ))}
    </ul>
  );
}

export default function Home() {
  return (
    <>
      <nav className="topnav" aria-label="Primary">
        <a className="topnav__wordmark" href="#main">
          {SITE.name}
        </a>
        <div className="topnav__links">
          <a href="#research">Research</a>
          <a href="#experience">Experience</a>
          <a href={SITE.linkedin} target="_blank" rel="noopener noreferrer">
            LinkedIn<span className="topnav__arrow"> ↗</span>
          </a>
        </div>
      </nav>

      <main id="main">
        <PldStage>
          <header className="hero">
            <div className="hero__text">
              <p className="eyebrow">{SITE.role}</p>
              <h1 className="hero__title">{SITE.name}</h1>
              <p className="hero__intro">{SITE.intro}</p>
              <div className="hero__actions">
                <a className="button button--primary" href="#research">
                  Read the research
                </a>
                <a className="button button--quiet" href={SITE.linkedin} target="_blank" rel="noopener noreferrer">
                  LinkedIn ↗
                </a>
              </div>
            </div>
            <div className="hero__figure">
              <div className="hero__slot" data-pld-target />
            </div>
          </header>
        </PldStage>

        <Story paragraphs={SITE.story} highlights={SITE.storyHighlights} />

        <section id="research" className="section">
          <div className="section__head">
            <p className="eyebrow">Research</p>
            <h2 className="section__title">Publications</h2>
          </div>
          <ol className="pub-list">
            {PUBLICATIONS.map((pub) => (
              <li key={pub.title} className="pub">
                <span className="pub__year">{pub.year}</span>
                <div className="pub__body">
                  <h3 className="pub__title">{pub.title}</h3>
                  <p className="pub__authors">{pub.authors}</p>
                  <p className="pub__venue">
                    {pub.venue}
                    {pub.note ? <span className="pub__note">{pub.note}</span> : null}
                  </p>
                </div>
                <div className="pub__links">
                  {pub.links.map((link) => (
                    <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">
                      {link.label} ↗
                    </a>
                  ))}
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section id="experience" className="section">
          <div className="section__head">
            <p className="eyebrow">Experience</p>
            <h2 className="section__title">Labs and research groups</h2>
          </div>
          <ul className="role-list">
            {EXPERIENCE.map((role) => (
              <li key={role.org} className="role">
                <div className="role__meta">
                  <span>{role.dates}</span>
                  <span>{role.place}</span>
                </div>
                <div className="role__head">
                  <h3 className="role__org">{role.org}</h3>
                  <p className="role__title">{role.title}</p>
                </div>
                <p className="role__summary">{role.summary}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="section section--split">
          <div>
            <div className="section__head">
              <p className="eyebrow">Education</p>
            </div>
            <EntryList entries={EDUCATION} />
          </div>
          <div>
            <div className="section__head">
              <p className="eyebrow">Honors</p>
            </div>
            <EntryList entries={HONORS} />
          </div>
        </section>

        <section className="section">
          <div className="section__head">
            <p className="eyebrow">Beyond the lab</p>
            <h2 className="section__title">Service and languages</h2>
          </div>
          <EntryList entries={BEYOND} />
        </section>

        <section className="section contact">
          <h2 className="section__title">Get in touch.</h2>
          <p className="contact__note">The best way to reach me is on LinkedIn.</p>
          <a className="button button--primary" href={SITE.linkedin} target="_blank" rel="noopener noreferrer">
            Message on LinkedIn ↗
          </a>
        </section>
      </main>

      <footer className="footer">
        <span>© {new Date().getFullYear()} {SITE.name}</span>
        <span>Los Angeles</span>
      </footer>
    </>
  );
}
