import { PortfolioLink } from "@/components/brand/PortfolioLink";

export function Intro() {
  return (
    <div className="intro">
      <h1 className="intro__name">Cole Johnson</h1>
      <p className="intro__lead">I build intelligent systems that interact with the physical world.</p>
      <div className="intro__actions">
        <PortfolioLink className="button button--primary" placement="below">
          View portfolio <span aria-hidden="true">↗</span>
        </PortfolioLink>
      </div>
    </div>
  );
}
