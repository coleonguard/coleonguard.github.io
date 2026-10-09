export const CHAPTER_IDS = ["robotics", "terranova", "echo", "space"] as const;

export type ChapterId = (typeof CHAPTER_IDS)[number];

export type ChapterLink = {
  label: string;
  href: string;
};

/** A run of text, or a redaction bar roughly `redact` characters wide. */
export type Phrase = (string | { redact: number })[];

export type Substrate = {
  /** Completes "Intelligence through …". */
  through: Phrase;
  text: Phrase;
  classified?: boolean;
};

export type Chapter = {
  id: ChapterId;
  index: string;
  label: string;
  field: string;
  caption: string;
  substrate: Substrate;
  organization: string;
  role: string;
  dates: string;
  /** Short span for the hero timeline. */
  years: string;
  summary: string;
  /** One line for the homepage work list; defaults to the first highlight. */
  blurb?: string;
  highlights: string[];
  links: ChapterLink[];
};

const PORTFOLIO_URL = "https://portfolio.colebjohnson.com";

export const CHAPTERS: Record<ChapterId, Chapter> = {
  robotics: {
    id: "robotics",
    index: "01",
    label: "Robotics",
    field: "Robotics & research",
    caption: "Prosthetics · Learning · Locomotion · MPC",
    substrate: {
      through: ["the human body."],
      text: [
        "Prosthetic legs and hands that learn their user, restoring ability and giving back agency. The intelligence lives between what a person intends and what their body can do.",
      ],
    },
    organization: "Georgia Tech EPIC Lab · Caltech AMBER Lab",
    role: "Graduate Research Assistant · Research Fellow",
    dates: "2021 – 2025",
    years: "2021 – 2025",
    blurb:
      "Learning-based control for lower- and upper-limb prostheses that adapt to their users, and Dynamic Tube MPC for robust, obstacle-avoiding planning. Best Paper Finalist at ICRA 2025.",
    summary:
      "Learning-based control for robots that move with and around people. At Georgia Tech I worked on prosthetic legs and hands that adapt to their users; at Caltech, on learned controllers and safety-aware planning for legged robots.",
    highlights: [
      "Dynamic Tube MPC: learning error dynamics with massively parallel simulation for robust, obstacle-avoiding planning. Best Paper Finalist at ICRA 2025.",
      "Continual and transfer learning for lower-limb prosthetic intent recognition and speed estimation, published in Transactions on Medical Robotics & Bionics and at ISMR (Best Paper Award, ISMR ’23).",
      "Founded an EPIC Lab subgroup on imitation learning from human grasping for upper-limb control. Task-agnostic prosthetic hand control is in review at Science Robotics.",
    ],
    links: [
      { label: "Research portfolio", href: `${PORTFOLIO_URL}/research` },
    ],
  },
  terranova: {
    id: "terranova",
    index: "02",
    label: "Terranova",
    field: "Field robotics & company building",
    caption: "Field robotics · Modeling · Company building",
    substrate: {
      through: ["simple physics."],
      text: [
        "Ground is just material that answers to pressure. Terranova’s robots inject wood slurry beneath flood-prone land and lift it, homes and all, an acre by a foot in a day. When the sea rises, so does the ground.",
      ],
    },
    organization: "Terranova",
    role: "Co-Founder & CTO",
    dates: "Jan 2021 – Jul 2025",
    years: "2021 – 2025",
    summary:
      "Terranova permanently elevates flood-prone land by injecting wood slurry beneath the surface, with no surface disturbance. I co-founded the company and led its technology from the first prototype to a fleet in the field.",
    highlights: [
      "Designed and built a fleet of semi-autonomous injection robots (drilling, pumping, and closed-loop control) that lift one acre by one foot per day, at up to 10× lower cost than levees.",
      "Developed self-learning topographic and fluid-structure models for predicting site suitability and planning injection campaigns.",
      "Raised $9.6M during my tenure, and hired and led 10+ engineers across robotics, ML, and field deployment.",
    ],
    links: [{ label: "Experience", href: `${PORTFOLIO_URL}/experience` }],
  },
  echo: {
    id: "echo",
    index: "03",
    label: "Echo",
    field: "Conversational research & ML systems",
    caption: "Conversational ML · Marketplaces · Company building",
    substrate: {
      through: ["the social fabric."],
      text: [
        "People make sense of the world in conversation. Echo learns from hundreds of millions of them to predict how society will move, and turns that into foresight organizations can buy.",
      ],
    },
    organization: "Echo",
    role: "Founder & CPO",
    dates: "Aug 2025 – Aug 2026",
    years: "2025 – 2026",
    blurb:
      "Free premium AI chat for consumers, and research for brands grounded in those real conversations: surveys, asset tests, and voice interviews in minutes.",
    summary:
      "Echo is a two-sided marketplace: consumers get free premium AI chat, and enterprises get research grounded in real consumer conversations. Each side compounds the value of the other.",
    highlights: [
      "Grew from $0 to $4M ARR in 10 months, then the company was acquired. Raised a $3.1M pre-seed and grew the team to 19.",
      "Retained all 34 customers, including 8 Fortune 500 brands and a U.S. presidential primary campaign, with zero churn. 85K active consumer users.",
      "Architected the ML core: LLM pipelines that distill intent and sentiment from 100M+ labeled human-feedback data points into surveys, asset tests, and voice interviews delivered in minutes, not weeks.",
    ],
    links: [],
  },
  space: {
    id: "space",
    index: "04",
    label: "SpaceX",
    field: "Systems in orbit",
    caption: "Orbital systems · Software · Starshield",
    substrate: {
      through: [{ redact: 9 }, " in orbit."],
      text: [
        "Building ",
        { redact: 8 },
        " that lets ",
        { redact: 12 },
        " talk to ",
        { redact: 6 },
        " before ",
        { redact: 10 },
        " even ",
        { redact: 7 },
        ". ",
        { redact: 16 },
        ".",
      ],
      classified: true,
    },
    organization: "SpaceX",
    role: "Software Engineer, Starshield",
    dates: "Oct 2026 – Present",
    years: "2026 – Now",
    blurb: "Building software for Starshield, SpaceX’s satellite network for government missions.",
    summary:
      "I build software for Starshield, SpaceX’s satellite network for government missions. The constellation shown here is an illustration, not a depiction of any SpaceX system.",
    highlights: [],
    links: [],
  },
};

export const CHAPTER_LIST: Chapter[] = CHAPTER_IDS.map((id) => CHAPTERS[id]);

export function isChapterId(value: string | null | undefined): value is ChapterId {
  return value != null && (CHAPTER_IDS as readonly string[]).includes(value);
}
