import { PortfolioLink } from "@/components/brand/PortfolioLink";
import { DecodeText } from "./DecodeText";

const LEAD = "I build intelligent systems that interact with the physical world.";

export function Intro({ decode }: { decode: boolean }) {
  return (
    <div className="intro">
      <h1 className="intro__name">Cole Johnson</h1>
      <p className="intro__lead">
        <DecodeText text={LEAD} play={decode} delay={250} />
      </p>
      <div className="intro__actions">
        <PortfolioLink className="button button--primary" placement="below">
          View portfolio <span aria-hidden="true">↗</span>
        </PortfolioLink>
      </div>
    </div>
  );
}
