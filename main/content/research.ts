export type PublicationGroup = "published" | "review" | "presentation";

export type Publication = {
  id: string;
  title: string;
  authors: string;
  venue: string;
  year: number;
  group: PublicationGroup;
  note?: string;
  links: { label: string; href: string }[];
};

const PORTFOLIO_RESEARCH = "https://portfolio.colebjohnson.com/research";

export const PUBLICATIONS: Publication[] = [
  {
    id: "J1",
    title: "Task-Agnostic End-to-End Biomimetic Prosthetic Hand Control",
    authors: "Cole Johnson, Kinsey Herrin, Aaron J. Young",
    venue: "Science Robotics",
    year: 2026,
    group: "review",
    note: "In review",
    links: [],
  },
  {
    id: "J2",
    title:
      "Real-Time Balancing of Stability and Plasticity in Continual Learning: Application to Speed Estimation for Lower-Limb Prostheses",
    authors: "Cole Johnson, Jairo Maldonado-Contreras, Aaron J. Young",
    venue: "Transactions on Medical Robotics & Bionics",
    year: 2025,
    group: "published",
    links: [{ label: "IEEE", href: "https://ieeexplore.ieee.org/document/11121360" }],
  },
  {
    id: "C3",
    title:
      "Dynamic Tube MPC: Learning Error Dynamics with Massively Parallel Simulation for Robust Safety in Practice",
    authors: "William D. Compton, Noel Csomay-Shanklin, Cole Johnson, Aaron D. Ames",
    venue: "International Conference on Robotics and Automation (ICRA)",
    year: 2025,
    group: "published",
    note: "Best Paper Finalist",
    links: [
      { label: "arXiv", href: "https://arxiv.org/abs/2411.15350" },
      { label: "Code", href: "https://github.com/wdc3iii/legged_gym_dev" },
    ],
  },
  {
    id: "C4",
    title:
      "Transfer Learning for Efficient Walking Speed Estimation Across Novel Prosthetic Devices and Populations",
    authors:
      "Jairo Maldonado-Contreras, Cole Johnson, Ian Knight, Sixu Zhou, Hanjun Kim, Kinsey R. Herrin, Aaron J. Young",
    venue: "International Conference on Intelligent Robots and Systems (IROS)",
    year: 2025,
    group: "published",
    note: "Accepted",
    links: [{ label: "IEEE", href: "https://ieeexplore.ieee.org/document/11246290" }],
  },
  {
    id: "J3",
    title:
      "Real-time Adaptation of Deep Learning Walking Speed Estimators Enables Biomimetic Assistance Modulation in an Open-Source Bionic Leg",
    authors:
      "Jairo Maldonado-Contreras, Cole Johnson, Sixu Zhou, Hanjun Kim, Ian Knight, Kinsey R. Herrin, Aaron J. Young",
    venue: "Transactions on Medical Robotics & Bionics",
    year: 2024,
    group: "published",
    links: [{ label: "IEEE", href: "https://ieeexplore.ieee.org/document/10924209" }],
  },
  {
    id: "C5",
    title:
      "Accelerating Constrained Continual Learning with Dynamic Active Learning: A Study in Adaptive Speed Estimation for Lower-Limb Prostheses",
    authors: "Cole Johnson, Jairo Maldonado-Contreras, Aaron J. Young",
    venue: "International Symposium on Medical Robotics (ISMR)",
    year: 2024,
    group: "published",
    links: [{ label: "IEEE", href: "https://ieeexplore.ieee.org/document/10585934" }],
  },
  {
    id: "C6",
    title:
      "Adaptive Lower-Limb Prosthetic Control: Towards Personalized Intent Recognition & Context Estimation",
    authors:
      "Cole Johnson, Jeongwoo Cho, Saketh Chaluvadi, Jairo Maldonado-Contreras, Aaron J. Young",
    venue: "International Symposium on Medical Robotics (ISMR)",
    year: 2023,
    group: "published",
    note: "Best Paper Award",
    links: [{ label: "IEEE", href: "https://ieeexplore.ieee.org/document/10130251" }],
  },
  {
    id: "P1",
    title:
      "Real-Time Balancing of Stability and Plasticity in Continual Learning: Application to Speed Estimation for Lower-Limb Prostheses",
    authors: "Cole Johnson",
    venue: "International Symposium on Medical Robotics",
    year: 2024,
    group: "presentation",
    links: [],
  },
  {
    id: "P2",
    title:
      "Accelerating Constrained Continual Learning with Dynamic Active Learning: A Study in Adaptive Speed Estimation for Lower-Limb Prostheses",
    authors: "Cole Johnson",
    venue: "International Symposium on Medical Robotics",
    year: 2024,
    group: "presentation",
    links: [],
  },
  {
    id: "P3",
    title:
      "Adaptive Lower-Limb Prosthetic Control: Towards Personalized Intent Recognition & Context Estimation",
    authors: "Cole Johnson",
    venue: "International Symposium on Medical Robotics",
    year: 2023,
    group: "presentation",
    links: [],
  },
  {
    id: "P4",
    title:
      "Reinforcement Learning-Based Trajectory Tracking in Massively Parallelized Simulations & Deep Tube MPC for Safe Route Planning",
    authors: "Cole Johnson",
    venue: "Caltech Symposium of Faculty & Students",
    year: 2024,
    group: "presentation",
    links: [{ label: "Slides", href: `${PORTFOLIO_RESEARCH}/presentation.pdf` }],
  },
];
