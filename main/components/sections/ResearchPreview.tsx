import { PROFILE } from "@/content/profile";
import { PUBLICATIONS, type Publication } from "@/content/research";

const HIDDEN_FROM_HOME = new Set(["J1"]);

const GROUP_ORDER = { published: 0, review: 1, presentation: 2 } as const;

const PAPERS = PUBLICATIONS.filter((p) => p.group !== "presentation" && !HIDDEN_FROM_HOME.has(p.id)).sort(
  (a, b) => GROUP_ORDER[a.group] - GROUP_ORDER[b.group],
);
const FEATURED = PAPERS.filter((p) => p.featured);
const MORE = PAPERS.filter((p) => !p.featured);

function Paper({ p }: { p: Publication }) {
  return (
    <li className="pub">
      <p className="pub__title">{p.title}</p>
      <p className="pub__authors">
        {p.authors.split(", ").map((name, i) => (
          <span key={name}>
            {i > 0 ? ", " : ""}
            {name === PROFILE.name ? <strong>{name}</strong> : name}
          </span>
        ))}
      </p>
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
  );
}

export function ResearchPreview() {
  return (
    <section className="section" aria-labelledby="research-preview">
      <div className="section__head">
        <h2 id="research-preview" className="section__title">
          Research
        </h2>
      </div>
      <ol className="pub-list">
        {FEATURED.map((p) => (
          <Paper key={p.id} p={p} />
        ))}
      </ol>
      {MORE.length > 0 && (
        <details className="pub-more">
          <summary className="pub-more__toggle">
            {MORE.length} more {MORE.length === 1 ? "paper" : "papers"}
          </summary>
          <ol className="pub-list pub-list--more">
            {MORE.map((p) => (
              <Paper key={p.id} p={p} />
            ))}
          </ol>
        </details>
      )}
      <a className="button button--quiet section__cta" href={PROFILE.scholar} target="_blank" rel="noreferrer">
        Google Scholar <span aria-hidden="true">↗</span>
      </a>
    </section>
  );
}
