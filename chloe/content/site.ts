export type Link = { label: string; href: string };

export type Publication = {
  title: string;
  authors: string;
  venue: string;
  year: number;
  note?: string;
  links: Link[];
};

export type Role = {
  org: string;
  title: string;
  dates: string;
  place: string;
  summary: string;
};

export type Entry = { title: string; detail: string; dates: string };

export const SITE = {
  name: "Chloe Isabella Tsang",
  url: "https://chloeisabellatsang.com",
  role: "Materials Science PhD student at USC",
  intro:
    "I work on thin films and crystals at the nanoscale: how they form, how to control their structure, and the devices built from them.",
  // One entry per paragraph.
  story: [
    "My journey began on the tennis court, competing internationally from age 8 and professionally on the WTA tour at 15.",
    "While tennis shaped my discipline and resilience, I was increasingly drawn to understanding the world at a fundamental level.",
    "At the University of Chicago, I discovered a passion for experimental quantum materials research that ultimately led me to step away from competitive tennis and pursue a PhD in Materials Science at USC.",
    "Today, I am driven by the belief that deep scientific curiosity can lay the foundation for innovations that address some of our most pressing challenges.",
  ],
  // Phrases from `story` shown in the accent color; each must match the text exactly.
  storyHighlights: ["WTA tour at 15", "experimental quantum materials", "PhD in Materials Science at USC"],
  description:
    "Chloe Isabella Tsang is a Materials Science PhD student at the University of Southern California, working on thin films, crystallization, and nanoscale devices.",
  linkedin: "https://www.linkedin.com/in/chloeisabellatsang",
};

export const PUBLICATIONS: Publication[] = [
  {
    title: "Modeling Far Ultraviolet Reflective Spectropolarimetric Response of Oxide and Fluoride Thin Films",
    authors:
      "Andrew Boyi Lee*, Chloe Isabella Tsang*, Kevin Ye, Claire Wu, John Hennessy, Jayakanth Ravichandran (*Co-first authors)",
    venue: "In Preparation",
    year: 2026,
    links: [],
  },
  {
    title: "Orientation-tunable local crystallization of Si films enabled by atomic imprint crystallization",
    authors: "K. Tanaka, X. Doi, C. P. Horn, C. I. Tsang, S. Guha",
    venue: "Applied Physics Letters",
    year: 2026,
    links: [{ label: "DOI", href: "https://doi.org/10.1063/5.0323109" }],
  },
  {
    title:
      "Multiscale simulation and machine learning facilitated design of two-dimensional nanomaterials-based tunnel field-effect transistors: A review",
    authors: "C. I. Tsang, H. Pu, J. Chen",
    venue: "APL Machine Learning",
    year: 2025,
    note: "Cover article",
    links: [
      { label: "AIP", href: "https://pubs.aip.org/aip/aml/article/3/1/016115/3339710" },
      { label: "arXiv", href: "https://arxiv.org/abs/2409.18965" },
    ],
  },
];

export const EXPERIENCE: Role[] = [
  {
    org: "University of Southern California",
    title: "PhD Student, Materials Science",
    dates: "2025 – Present",
    place: "Los Angeles",
    summary:
      "Graduate research in the Ravichandran Lab focusing on pulsed laser deposition (PLD) growth, in-situ diagnostics, and structural engineering of oxide and fluoride thin films for high-performance optics, quantum, and photonic applications. Presented a poster at JPL's annual poster event.",
  },
  {
    org: "USC Center of Nano-Imaging",
    title: "Student Staff",
    dates: "2026 – Present",
    place: "Los Angeles",
    summary: "Super user for X-ray diffraction, X-ray fluorescence, and atomic force microscopy.",
  },
  {
    org: "Caltech",
    title: "Visiting Undergraduate Research Fellow",
    dates: "Summer 2024",
    place: "Pasadena",
    summary:
      "Designed and custom-assembled an Inductively Coupled Plasma (ICP) source and vacuum chamber hardware from the ground up for Thermal Laser Epitaxy (TLE) research in Prof. Austin Minnich's Lab. Presented work at the Midstates Consortium and UChicago MRC Symposium.",
  },
  {
    org: "IBM Research, Almaden",
    title: "Undergraduate Research Intern",
    dates: "Summer 2023",
    place: "San Jose",
    summary:
      "Investigated polymeric matrix characterization for Area Selective Deposition (ASD) and Vapor Phase Infiltration (VPI) using Matrix Assisted Laser Desorption/Ionization (MALDI), AFM, and ellipsometry.",
  },
  {
    org: "Argonne National Laboratory",
    title: "Undergraduate Researcher",
    dates: "2021 – 2025",
    place: "Chicago",
    summary:
      "First author in Prof. Junhong Chen's Lab on a comprehensive review examining two-dimensional nanomaterial tunnel FETs (TFETs), multiscale simulations, and machine learning optimizations, featured as the cover article of APL Machine Learning (March 2025).",
  },
  {
    org: "Pritzker School of Molecular Engineering, UChicago",
    title: "Undergraduate Researcher · Engineering Fellows Mentor",
    dates: "2022 – 2025",
    place: "Chicago",
    summary:
      "Researched atomic imprint crystallization (AIC) of Si/Ge films and performed senior thesis research on near-field direct-write micro-evaporator nozzle deposition for aluminum CVD in Prof. Supratik Guha's Lab. Served as PME Student Ambassador and Engineering Fellows Mentor.",
  },
];

export const EDUCATION: Entry[] = [
  { title: "University of Southern California", detail: "PhD, Materials Science", dates: "2025 – Present" },
  {
    title: "University of Chicago",
    detail: "BS with Honors, Molecular Engineering (Quantum Engineering). Varsity Tennis, UChicago Quantum Society, Society of Women in Physics.",
    dates: "2021 – 2025",
  },
  { title: "Stanford Online High School", detail: "Mathematics and Physics", dates: "2014 – 2021" },
];

export const HONORS: Entry[] = [
  { title: "Mork Family Graduate Fellowship", detail: "University of Southern California", dates: "2025" },
  { title: "NSF Graduate Research Fellowship, Honorable Mention", detail: "National Science Foundation", dates: "2025" },
];

export const BEYOND: Entry[] = [
  {
    title: "International Rescue Committee",
    detail: "Fundraiser Ambassador. Raised $10,100 for refugee relief through tennis training.",
    dates: "2018 – 2022",
  },
  {
    title: "UNHCR, the UN Refugee Agency",
    detail: "Community volunteer.",
    dates: "2018 – 2022",
  },
  { title: "Languages", detail: "English, Chinese, and French (DELF B2)", dates: "" },
];
