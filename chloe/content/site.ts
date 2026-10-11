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
  description:
    "Chloe Isabella Tsang is a Materials Science PhD student at the University of Southern California, working on thin films, crystallization, and nanoscale devices.",
  linkedin: "https://www.linkedin.com/in/chloeisabellatsang",
};

export const PUBLICATIONS: Publication[] = [
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
    summary: "Graduate research in materials science at the Viterbi School of Engineering, supported by the Mork Family Graduate Fellowship.",
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
    summary: "Summer research fellowship.",
  },
  {
    org: "IBM Research, Almaden",
    title: "Undergraduate Research Intern",
    dates: "Summer 2023",
    place: "San Jose",
    summary: "Thin-film characterization with atomic force microscopy and ellipsometry.",
  },
  {
    org: "Argonne National Laboratory",
    title: "Undergraduate Researcher",
    dates: "2021 – 2025",
    place: "Chicago",
    summary:
      "Wrote a review of two-dimensional-material tunnel FETs and how multiscale simulation and machine learning can optimize them, published as the cover article of APL Machine Learning.",
  },
  {
    org: "Pritzker School of Molecular Engineering, UChicago",
    title: "Undergraduate Researcher · Engineering Fellows Mentor",
    dates: "2022 – 2025",
    place: "Chicago",
    summary:
      "Fabrication work including wafer cleaning and machining. Co-author on silicon thin-film crystallization research published in Applied Physics Letters. Mentor for the Engineering Fellows program.",
  },
];

export const EDUCATION: Entry[] = [
  { title: "University of Southern California", detail: "PhD, Materials Science", dates: "2025 – Present" },
  {
    title: "University of Chicago",
    detail: "BS, Molecular Engineering (Quantum Engineering). Varsity Tennis, UChicago Quantum Society, Society of Women in Physics.",
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
  { title: "Languages", detail: "English and French (DELF B2)", dates: "" },
];
