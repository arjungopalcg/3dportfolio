export type Vec2 = [number, number];

export interface Role {
  company: string;
  title: string;
  period: string;
  bullets: string[];
}

export interface WallItem {
  caption: string;
}

export interface Place {
  id: string;
  name: string;
  tagline: string; // "Hometown", "Bachelor's", "Master's", "Startup", "Current home", ...
  position: Vec2; // road waypoint, world units
  personalNote: string;
  roles: Role[]; // empty for education/personal-only stops
  wallItems: WallItem[]; // photo/memory placeholders shown on the in-world wall
  color: string;
  accent: string;
}

export const PLACES: Place[] = [
  {
    id: "thrissur",
    name: "Thrissur",
    tagline: "Hometown",
    position: [0, 0],
    personalNote:
      "Where the story starts — born and raised in Thrissur, Kerala. Home base for every visit back, and the place that still means \"home\" more than anywhere else on this road.",
    roles: [],
    wallItems: [{ caption: "Growing up in Thrissur" }, { caption: "Family & home" }],
    color: "#c9a37a",
    accent: "#f2d9a8",
  },
  {
    id: "coimbatore",
    name: "Coimbatore",
    tagline: "Bachelor's degree",
    position: [15, -17],
    personalNote:
      "Moved to Coimbatore for a bachelor's degree — the first real stretch of independence, and the start of an engineering foundation that still shows up in how problems get approached today.",
    roles: [],
    wallItems: [{ caption: "Campus days" }, { caption: "First time away from home" }],
    color: "#8f8f78",
    accent: "#d8d3b0",
  },
  {
    id: "doha",
    name: "Doha",
    tagline: "First job abroad",
    position: [37, -19],
    personalNote:
      "A brief seven-month stint in Doha right after graduating — process improvement and procurement work, and a fast introduction to working life outside India.",
    roles: [
      {
        company: "Sun Group International",
        title: "Accountant / Procurement",
        period: "May – Nov 2017",
        bullets: ["Worked on process improvement and managing the staff."],
      },
    ],
    wallItems: [{ caption: "First job, first city abroad" }],
    color: "#b5533f",
    accent: "#f4b79f",
  },
  {
    id: "bangalore",
    name: "Bangalore",
    tagline: "Manufacturing & aero-engine documentation",
    position: [50, 0],
    personalNote:
      "Two very different roles back to back in Bangalore — manufacturing analysis at Akme, then deep into aero-engine technical documentation at QuEST's Rolls-Royce ODC. The aviation-standards discipline from this stretch still shapes how documentation and process get treated today.",
    roles: [
      {
        company: "Akme Technologies",
        title: "Business Analyst",
        period: "Jan 2018 – May 2019",
        bullets: [
          "Monitored, tested, and inspected products across manufacturing processes against spec.",
          "Worked on converting manual steps into automation.",
          "Analyzed company operations and implemented changes that helped reach profitability.",
          "Managed inventory and tracked stock against raw-material needs using ERP and Excel.",
        ],
      },
      {
        company: "QuEST Global — Rolls-Royce ODC",
        title: "Methods Engineer",
        period: "May 2019 – Jun 2020",
        bullets: [
          "Created, revised, and reviewed technical manuals to iSpec2200 and S1000D standards for Rolls-Royce Trent engines.",
          "Worked hands-on with part drawings and GD&T, and processed manual revisions, tool bulletins, and service bulletins.",
          "Built a working understanding of aero-engine maintenance and after-market engineering services.",
        ],
      },
    ],
    wallItems: [{ caption: "Akme Technologies" }, { caption: "QuEST / Rolls-Royce ODC" }],
    color: "#6f8598",
    accent: "#bcd4e6",
  },
  {
    id: "colchester",
    name: "Colchester",
    tagline: "Master's degree",
    position: [46, 22],
    personalNote:
      "Colchester is where a master's degree happened — and, years later, where Ascent AI Labs (the current role) is nominally based, even while living and working from Basildon.",
    roles: [],
    wallItems: [{ caption: "Masters, and a move to the UK" }],
    color: "#7d6fa8",
    accent: "#d7cdf2",
  },
  {
    id: "kochi",
    name: "Kochi",
    tagline: "Startup — OnCloud Infotech",
    position: [24, 34],
    personalNote:
      "OnCloud is based in Kochi — five years of building a company from nothing, wearing every hat from BA to closer, before winding it down in 2025.",
    roles: [
      {
        company: "OnCloud Infotech",
        title: "Co-Founder & Technical Business Analyst",
        period: "2020 – 2025",
        bullets: [
          "Co-founded and scaled a tech services company from zero to a sustained client base.",
          "Led requirements gathering, stakeholder workshops, and solution design across 10+ custom application builds.",
          "Evaluated and closed new business, preparing proposals and scoping delivery.",
          "Operated at the intersection of business strategy and technical execution in a lean startup environment.",
        ],
      },
    ],
    wallItems: [{ caption: "Building OnCloud from zero" }, { caption: "The team" }],
    color: "#4f9d6e",
    accent: "#bdeecb",
  },
  {
    id: "basildon",
    name: "Basildon",
    tagline: "Current home",
    position: [0, 24],
    personalNote:
      "Home right now. Remote product work for Ascent AI Labs, a couple of years leading stock-audit teams at RGIS before that, and — outside of work — shooting part-time as a photographer with Tempest Photography since 2023.",
    roles: [
      {
        company: "Ascent AI Labs",
        title: "Product Manager",
        period: "Mar 2025 – Present",
        bullets: [
          "Owns end-to-end product strategy and delivery for two AI SaaS tools, Ascent Flow and Infinitqos.",
          "Built internal tooling that cut prototype iteration time significantly.",
          "Designed QA frameworks that measurably reduced post-release defects.",
          "Bridges engineering, data science, and business, turning LLM capability into user-facing features.",
          "Drives roadmap prioritisation from user research, analytics, and business impact.",
        ],
      },
      {
        company: "RGIS — UK",
        title: "Team Leader / Auditor",
        period: "2021 – 2024",
        bullets: [
          "Led and trained stock-auditing teams across retail, warehouse, pharmacy, and beauty locations.",
          "Analyzed audit data to flag discrepancies and produce actionable accuracy reports.",
        ],
      },
    ],
    wallItems: [{ caption: "Ascent AI Labs" }, { caption: "Tempest Photography" }],
    color: "#a3714f",
    accent: "#e7b98a",
  },
];

export const CONTACT_LINKS = {
  cv: { label: "Download CV", href: "#" },
  email: { label: "Email", href: "mailto:arjunkerala@gmail.com" },
  linkedin: { label: "LinkedIn", href: "https://www.linkedin.com" },
};

export function placeById(id: string): Place | undefined {
  return PLACES.find((p) => p.id === id);
}

const APPROACH_OFFSET = 5.5;

/** A landing spot just off the road at this place, safely inside the interact radius. */
export function approachPoint(place: Place, index: number): Vec2 {
  const [x, z] = place.position;
  const prev = PLACES[index - 1];
  const next = PLACES[index + 1];
  const reference = prev ?? next;
  const dir = reference
    ? normalize([x - reference.position[0], z - reference.position[1]])
    : ([0, 1] as Vec2);
  // step back along the road (toward the previous stop, or away from the next
  // one if this is the first place) so the landing spot sits on the road side,
  // not behind the signpost.
  return [x - dir[0] * APPROACH_OFFSET, z - dir[1] * APPROACH_OFFSET];
}

function normalize([x, z]: Vec2): Vec2 {
  const len = Math.hypot(x, z) || 1;
  return [x / len, z / len];
}

export const SPAWN_POINT: Vec2 = [-6, -4];
