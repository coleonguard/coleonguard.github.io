import { PROFILE } from "@/content/profile";

export function Intro() {
  return (
    <div className="intro">
      <h1 className="intro__name">Cole Johnson</h1>
      <p className="intro__lead">I build intelligent systems that interact with the physical world.</p>
      <div className="intro__actions">
        <a className="button button--primary" href={PROFILE.portfolio} target="_blank" rel="noreferrer">
          View portfolio <span aria-hidden="true">↗</span>
        </a>
      </div>
    </div>
  );
}

export function HeroFallback() {
  return (
    <section className="hero" data-selected="false" aria-label="Introduction">
      <div className="hero__scene">
        <div className="scene" data-status="loading">
          <div className="scene__fallback" aria-hidden="true" />
        </div>
      </div>
      <Intro />
    </section>
  );
}
