import { Droplet, Flame, CircleDot, Activity, Waves, Hexagon, type LucideIcon } from "lucide-react";
import type { ExamState, FundusFindings, SlitFindings } from "./types";

const blankSlit: SlitFindings = { lids: null, conj: null, k: null, ac: null, p: null, l: null };
const blankFundus: FundusFindings = { marks: [], cd: 0.3, status: [] };

/** Empty exam chart — the starting state for any patient without a saved exam yet. */
export const BLANK: ExamState = {
  va: { od: [], os: [] },
  ret: { od: [null, null], os: [null, null] },
  mr: { od: { s: null, c: null, a: null }, os: { s: null, c: null, a: null } },
  add: { od: null, os: null },
  cv: { od: { d: null, n: null }, os: { d: null, n: null } },
  iop: { od: null, os: null },
  slit: { od: { ...blankSlit }, os: { ...blankSlit } },
  fundus: { od: { ...blankFundus }, os: { ...blankFundus } },
  marks: { od: [], os: [] },
  investigations: [],
  findings: [],
  findingId: {},
  findingEye: {},
  customFindings: [],
  fu: null,
  fuNote: "",
  notes: "",
  saved: false,
  issued: false,
};

/** One-tap starters for the Investigations tab — the examiner can still type any other test. */
export const INVESTIGATION_PRESETS = [
  "Schirmer test",
  "Tear break-up time (TBUT)",
  "OCT",
  "Visual field",
  "Fundus photo",
  "Corneal topography",
  "Pachymetry",
  "Keratometry",
  "Gonioscopy",
  "Colour vision",
  "Contrast sensitivity",
  "A-scan / B-scan",
  "Fluorescein angiography",
  "Pupil reaction",
  "Contact lens trial",
  "Foreign body removal",
] as const;

/** Clinical findings checklist — no backend endpoint for this yet, kept as a fixed local list. */
export const FINDINGS: Array<{ id: string; n: string; i: LucideIcon }> = [
  { id: "dry_eye", n: "Dry eye signs", i: Droplet },
  { id: "injection", n: "Conjunctival injection", i: Flame },
  { id: "opacity", n: "Corneal opacity", i: CircleDot },
  { id: "elevated_iop", n: "Elevated IOP", i: Activity },
  { id: "retinopathy", n: "Diabetic retinopathy signs", i: Waves },
  { id: "disc_change", n: "Disc / macular change", i: Hexagon },
];
