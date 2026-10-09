export const PROFILE = {
  name: "Cole Johnson",
  email: "coleonguard@gmail.com",
  linkedin: "https://www.linkedin.com/in/colebjohnson",
  resume: "/resume.pdf",
  portfolio: "https://portfolio.colebjohnson.com",
};

export type TimelineEntry = {
  dates: string;
  organization: string;
  role: string;
  detail: string;
};

export const TIMELINE: TimelineEntry[] = [
  {
    // TODO(confirm): exact public title, whether to name Starshield, and start date.
    dates: "Upcoming",
    organization: "SpaceX",
    role: "Incoming Software Engineer",
    detail: "Software for systems in orbit.",
  },
  {
    dates: "Aug 2025 – Aug 2026",
    organization: "Echo",
    role: "Founder & CPO",
    detail: "Conversational research marketplace. $0 to $4M ARR and acquired in 10 months.",
  },
  {
    dates: "Jun – Sep 2024",
    organization: "Caltech AMBER Lab",
    role: "Research Fellow",
    detail: "RL trajectory tracking and Dynamic Tube MPC for legged robots.",
  },
  {
    dates: "Jan – Aug 2023",
    organization: "Optimal Dynamics",
    role: "AI Research Intern",
    detail: "Hierarchical RL for freight route planning; online fine-tuning and drift monitoring.",
  },
  {
    dates: "Jan 2021 – Jul 2025",
    organization: "Terranova",
    role: "Co-Founder & CTO",
    detail: "Semi-autonomous injection robots that permanently elevate flood-prone land.",
  },
  {
    dates: "Jan 2021 – Jan 2025",
    organization: "Georgia Tech EPIC Lab",
    role: "Graduate Research Assistant",
    detail: "Imitation learning for upper-limb control; continual and transfer learning for prostheses.",
  },
];

export const EDUCATION = [
  {
    degree: "MS in Computer Science",
    school: "Georgia Tech",
    detail: "Computational Perception & Robotics · Thesis · 3.93 GPA",
    dates: "May 2025",
  },
  {
    degree: "BS in Computer Science",
    school: "Georgia Tech",
    detail: "Theory & Intelligence · Highest Honors",
    dates: "May 2024",
  },
];

export const AWARDS = [
  "Best Paper Finalist, ICRA ’25",
  "Best Paper Award, ISMR ’23",
  "Research Fellowship, Caltech ’24",
  "SkyDeck Pad-13, UC Berkeley ’23",
  "Presidential Undergraduate Research Award, Georgia Tech ’24 & ’22",
  "USA National Team, Fencing ’16–’19",
];

export const PATENTS = [
  "Real-Time Adaptive Content Generation with Dynamic Sentiment Prediction (0336823)",
  "Self-Learning Framework for Predictive Topographic Modeling (0027289)",
  "Coupled Fluid-Structure Interaction for Hydraulic Structural Optimization (submitted)",
  "Token-based Economic Network for Incentive-aligned Knowledge Systems (submitted)",
];
