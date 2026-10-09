export const CHAPTER_IDS = ["robotics", "terranova", "echo", "space"] as const;

export type ChapterId = (typeof CHAPTER_IDS)[number];

export type ChapterLink = {
  label: string;
  href: string;
  external?: boolean;
};

export type Chapter = {
  id: ChapterId;
  index: string;
  label: string;
  field: string;
  caption: string;
  tooltip: string;
  organization: string;
  role: string;
  dates: string;
  summary: string;
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
    tooltip: "Learning to move and manipulate.",
    organization: "Georgia Tech EPIC Lab · Caltech AMBER Lab",
    role: "Graduate Research Assistant · Research Fellow",
    dates: "2021 – 2025",
    summary:
      "Learning-based control for robots that move with and around people. At Georgia Tech I worked on prosthetic legs and hands that adapt to their users; at Caltech, on learned controllers and safety-aware planning for legged robots.",
    highlights: [
      "Dynamic Tube MPC: learning error dynamics with massively parallel simulation for robust, obstacle-avoiding planning. Best Paper Finalist at ICRA 2025.",
      "Continual and transfer learning for lower-limb prosthetic intent recognition and speed estimation, published in Transactions on Medical Robotics & Bionics and at ISMR (Best Paper Award, ISMR ’23).",
      "Founded an EPIC Lab subgroup on imitation learning from human grasping for upper-limb control. Task-agnostic prosthetic hand control is in review at Science Robotics.",
    ],
    links: [
      { label: "Research", href: "/research" },
      { label: "Research portfolio", href: `${PORTFOLIO_URL}/research`, external: true },
    ],
  },
  terranova: {
    id: "terranova",
    index: "02",
    label: "Terranova",
    field: "Field robotics & company building",
    caption: "Field robotics · Modeling · Company building",
    tooltip: "Robotic systems for raising land.",
    organization: "Terranova",
    role: "Co-Founder & CTO",
    dates: "Jan 2021 – Jul 2025",
    summary:
      "Terranova permanently elevates flood-prone land by injecting wood slurry beneath the surface, with no surface disturbance. I co-founded the company and led its technology from the first prototype to a fleet in the field.",
    highlights: [
      "Designed and built a fleet of semi-autonomous injection robots (drilling, pumping, and closed-loop control) that lift one acre by one foot per day, at up to 10× lower cost than levees.",
      "Developed self-learning topographic and fluid-structure models for predicting site suitability and planning injection campaigns.",
      "Raised $9.6M during my tenure, and hired and led 10+ engineers across robotics, ML, and field deployment.",
    ],
    links: [{ label: "Experience", href: `${PORTFOLIO_URL}/experience`, external: true }],
  },
  echo: {
    id: "echo",
    index: "03",
    label: "Echo",
    field: "Conversational research & ML systems",
    caption: "Conversational ML · Marketplaces · Company building",
    tooltip: "Understanding people through conversation.",
    organization: "Echo",
    role: "Founder & CPO",
    dates: "Aug 2025 – Aug 2026",
    summary:
      "Echo is a two-sided marketplace: consumers get free premium AI chat, and enterprises get research grounded in real consumer conversations. Each side compounds the value of the other.",
    highlights: [
      "Grew from $0 to $4M ARR in 10 months, then the company was acquired. Raised a $3.1M pre-seed and grew the team to 19.",
      "Retained all 34 customers, including 8 Fortune 500 brands and a U.S. presidential primary campaign, with zero churn. 85K active consumer users.",
      "Architected the ML core: LLM pipelines that distill intent and sentiment from 100M+ labeled human-feedback data points into surveys, asset tests, and voice interviews delivered in minutes, not weeks.",
    ],
    links: [{ label: "About", href: "/about" }],
  },
  space: {
    id: "space",
    index: "04",
    label: "Space",
    field: "Systems in orbit",
    caption: "Orbital systems · Software · Next chapter",
    tooltip: "Planning and connecting systems in orbit.",
    organization: "SpaceX",
    // TODO(confirm): exact public title, whether to name Starshield, and start date.
    role: "Incoming Software Engineer",
    dates: "Upcoming",
    summary:
      "My next chapter is at SpaceX, building software for systems in orbit. The constellation shown here is an illustration, not a depiction of any SpaceX system.",
    highlights: [],
    links: [{ label: "About", href: "/about" }],
  },
};

export const CHAPTER_LIST: Chapter[] = CHAPTER_IDS.map((id) => CHAPTERS[id]);

export function isChapterId(value: string | null | undefined): value is ChapterId {
  return value != null && (CHAPTER_IDS as readonly string[]).includes(value);
}
