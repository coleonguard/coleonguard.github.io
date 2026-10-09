import type { Metadata } from "next";
import { SiteFooter } from "@/components/sections/HomeSections";
import { AWARDS, EDUCATION, PATENTS, PROFILE, TIMELINE } from "@/content/profile";

export const metadata: Metadata = { title: "About · Cole Johnson" };

export default function AboutPage() {
  return (
    <>
      <main id="main" className="page">
        <header className="page__head">
          <h1 className="page__title">Cole Johnson</h1>
          <p className="page__lead">
            I work where learning meets the physical world. I spent four years in robotics research at Georgia
            Tech and Caltech, co-founded Terranova to raise flood-prone land with field robots, and founded Echo
            to understand people through conversation. Next, I’m joining SpaceX to work on systems in orbit.
          </p>
          <p className="page__actions">
            <a className="button button--primary" href={PROFILE.resume} target="_blank" rel="noreferrer">
              Résumé ↗
            </a>
            <a className="button button--quiet" href={`mailto:${PROFILE.email}`}>
              {PROFILE.email}
            </a>
            <a className="button button--quiet" href={PROFILE.linkedin} target="_blank" rel="noreferrer">
              LinkedIn ↗
            </a>
          </p>
        </header>

        <section className="page__section" aria-labelledby="timeline">
          <h2 id="timeline" className="page__section-title">
            Timeline
          </h2>
          <ol className="timeline">
            {TIMELINE.map((entry) => (
              <li key={entry.organization} className="timeline__item">
                <p className="timeline__dates">{entry.dates}</p>
                <div>
                  <p className="timeline__org">{entry.organization}</p>
                  <p className="timeline__role">{entry.role}</p>
                  <p className="timeline__detail">{entry.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="page__section" aria-labelledby="education">
          <h2 id="education" className="page__section-title">
            Education
          </h2>
          <ol className="timeline">
            {EDUCATION.map((e) => (
              <li key={e.degree} className="timeline__item">
                <p className="timeline__dates">{e.dates}</p>
                <div>
                  <p className="timeline__org">{e.degree}</p>
                  <p className="timeline__role">{e.school}</p>
                  <p className="timeline__detail">{e.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <div className="page__columns">
          <section className="page__section" aria-labelledby="awards">
            <h2 id="awards" className="page__section-title">
              Awards
            </h2>
            <ul className="plain-list">
              {AWARDS.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </section>
          <section className="page__section" aria-labelledby="patents">
            <h2 id="patents" className="page__section-title">
              Patents
            </h2>
            <ul className="plain-list">
              {PATENTS.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
