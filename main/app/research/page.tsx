import type { Metadata } from "next";
import { SiteFooter } from "@/components/sections/HomeSections";
import { PROFILE } from "@/content/profile";
import { PUBLICATIONS, PUBLICATION_GROUPS } from "@/content/research";

export const metadata: Metadata = { title: "Research · Cole Johnson" };

export default function ResearchPage() {
  return (
    <>
      <main id="main" className="page">
        <header className="page__head">
          <p className="eyebrow">Research</p>
          <h1 className="page__title">Publications</h1>
          <p className="page__lead">
            Learning-based control for prosthetic legs and hands, safety-aware planning for legged robots, and,
            more recently, learning human simulators from language. Longer project write-ups live in the{" "}
            <a href={`${PROFILE.portfolio}/research`} target="_blank" rel="noreferrer" className="text-link">
              research portfolio ↗
            </a>
            .
          </p>
        </header>

        {PUBLICATION_GROUPS.map((group) => {
          const items = PUBLICATIONS.filter((p) => p.group === group.id);
          return (
            <section key={group.id} className="page__section" aria-labelledby={`group-${group.id}`}>
              <h2 id={`group-${group.id}`} className="page__section-title">
                {group.title}
              </h2>
              <ol className="pub-list">
                {items.map((p) => (
                  <li key={p.id} className="pub" data-featured={p.featured ? "true" : undefined}>
                    <p className="pub__title">{p.title}</p>
                    <p className="pub__authors">{p.authors}</p>
                    <p className="pub__meta">
                      {p.venue} · {p.year}
                      {p.note ? ` · ${p.note}` : ""}
                    </p>
                    {p.links.length > 0 && (
                      <p className="pub__links">
                        {p.links.map((link) => (
                          <a key={link.href} href={link.href} target="_blank" rel="noreferrer" className="text-link">
                            {link.label} ↗
                          </a>
                        ))}
                      </p>
                    )}
                  </li>
                ))}
              </ol>
            </section>
          );
        })}
      </main>
      <SiteFooter />
    </>
  );
}
