export type Vec2 = [number, number];

export interface DistrictLink {
  label: string;
  href: string;
}

export interface District {
  id: string;
  name: string;
  subtitle: string;
  represents: string;
  content: string[];
  links?: DistrictLink[];
  position: Vec2;
  color: string;
  accent: string;
  shape:
    | "tower"
    | "barn"
    | "hangar"
    | "warehouse"
    | "ledger"
    | "grove"
    | "garden"
    | "signpost"
    | "hub";
  /** Overrides the default building collision radius (used by the hub's thin lantern post). */
  collisionRadius?: number;
  /** Overrides the default ground-plaza radius under the structure. */
  plazaRadius?: number;
  /** Overrides the computed approach point for fast-travel/deep-linking. */
  landingPoint?: Vec2;
}

export const HUB = {
  name: "The Village Square",
  bio: [
    "Arjun Gopal C G — Product manager who builds with AI-assisted tools (Claude Code, Cursor, Lovable, Google AI Studio) to move from idea to working software fast.",
    "This world is itself a demonstration of that approach: an explorable 3D portfolio instead of a static page. Walk into any building to read that chapter of the story, or use the Signpost for contact details.",
  ],
};

export const HUB_DISTRICT: District = {
  id: "hub",
  name: HUB.name,
  subtitle: "Start here",
  represents: "Welcome",
  content: HUB.bio,
  position: [0, 0],
  color: "#8a6a45",
  accent: "#f4b79f",
  shape: "hub",
  collisionRadius: 0.6,
  plazaRadius: 6,
  landingPoint: [0, 8],
};

export const DISTRICTS: District[] = [
  {
    id: "ascent-ai",
    name: "The Workshop Tower",
    subtitle: "Product Manager, Ascent AI Labs",
    represents: "Current role",
    content: [
      "Leading product for Ascent Flow and Infinitqos at Ascent AI Labs.",
      "Builds AI-assisted PM workflows — using LLM tooling to compress the distance between spec, prototype, and shipped feature.",
    ],
    position: [18, -10],
    color: "#c9a37a",
    accent: "#f2d9a8",
    shape: "tower",
  },
  {
    id: "oncloud",
    name: "The Co-op House",
    subtitle: "Co-founder, OnCloud Infotech",
    represents: "Co-founder role",
    content: [
      "Co-founded OnCloud Infotech, running business analysis and client delivery end to end.",
      "Owned market evaluations that shaped which products the studio took on.",
    ],
    position: [-18, -10],
    color: "#a3714f",
    accent: "#e7b98a",
    shape: "barn",
  },
  {
    id: "rgis",
    name: "The Warehouse District",
    subtitle: "RGIS — Stock Audit & Data Ops",
    represents: "Data operations",
    content: [
      "Ran multi-site stock audits, keeping inventory data accurate across many locations.",
      "Led on-site teams and built the discipline for data integrity under time pressure.",
    ],
    position: [24, 6],
    color: "#8f8f78",
    accent: "#d8d3b0",
    shape: "warehouse",
  },
  {
    id: "quest",
    name: "The Engineering Hangar",
    subtitle: "QuEST Global — Rolls-Royce ODC",
    represents: "Aeronautical background",
    content: [
      "Worked in QuEST Global's offshore delivery center for Rolls-Royce, on technical documentation.",
      "Authored and maintained manuals to iSpec2200 / S1000D standards — the aviation roots of a data-driven product mindset.",
    ],
    position: [-24, 6],
    color: "#6f8598",
    accent: "#bcd4e6",
    shape: "hangar",
  },
  {
    id: "ledger",
    name: "The Ledger House",
    subtitle: "Akme Technologies & Sun Group",
    represents: "Early BA / finance work",
    content: [
      "Built ERP workflows and inventory systems at Akme Technologies and Sun Group.",
      "Early business-analyst and finance groundwork that still shapes how projects get scoped today.",
    ],
    position: [0, 24],
    color: "#7a6a52",
    accent: "#d6bd8f",
    shape: "ledger",
  },
  {
    id: "bilimbee",
    name: "The Toon Grove",
    subtitle: "Bilimbee Toons",
    represents: "Side venture",
    content: [
      "A kids' animated YouTube channel, produced with an AI-assisted animation pipeline.",
      "A playground for the same fast-prototyping instincts used at work, aimed at a completely different audience.",
    ],
    links: [{ label: "Visit Bilimbee Toons", href: "https://www.youtube.com" }],
    position: [16, 20],
    color: "#4f9d6e",
    accent: "#bdeecb",
    shape: "grove",
  },
  {
    id: "skills",
    name: "The Lantern Garden",
    subtitle: "Skills & Tools",
    represents: "Skills & tools",
    content: [
      "AI/LLM tooling: Claude Code, Cursor, Lovable, Google AI Studio.",
      "Data & product: Power BI, SQL, Python.",
      "Product & delivery skills built across PM, BA, and data-ops roles, plus working fluency across multiple languages.",
    ],
    position: [-16, 20],
    color: "#7d6fa8",
    accent: "#d7cdf2",
    shape: "garden",
  },
  {
    id: "contact",
    name: "The Signpost",
    subtitle: "Contact / CV",
    represents: "Contact",
    content: [
      "Download the CV, send an email, or connect on LinkedIn.",
      "Open to product, AI-tooling, and Bilimbee-style creative collaborations.",
    ],
    links: [
      { label: "Download CV", href: "#" },
      { label: "Email", href: "mailto:arjunkerala@gmail.com" },
      { label: "LinkedIn", href: "https://www.linkedin.com" },
    ],
    position: [0, -26],
    color: "#b5533f",
    accent: "#f4b79f",
    shape: "signpost",
  },
];

/** All walkable points of interest: the hub plus every career/project district. */
export const WORLD_POINTS: District[] = [HUB_DISTRICT, ...DISTRICTS];

export function districtById(id: string): District | undefined {
  return WORLD_POINTS.find((d) => d.id === id);
}

/** A landing spot just outside a district's building, safely inside the interact radius. */
export function approachPoint(district: District): Vec2 {
  if (district.landingPoint) return district.landingPoint;
  const [x, z] = district.position;
  const len = Math.hypot(x, z) || 1;
  const offset = 4.3;
  return [x + (x / len) * offset, z + (z / len) * offset];
}
