import { Droplet, Flame, CircleDot, Activity, Waves, Hexagon, type LucideIcon } from "lucide-react";
import type { ExamPatient, ExamState, FundusFindings, SlitFindings } from "./types";

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
  findings: [],
  customFindings: [],
  fu: null,
  fuNote: "",
  notes: "",
  saved: false,
  issued: false,
};

/** Clinical findings checklist — no backend endpoint for this yet, kept as a fixed local list. */
export const FINDINGS: Array<{ id: string; n: string; i: LucideIcon }> = [
  { id: "dry_eye", n: "Dry eye signs", i: Droplet },
  { id: "injection", n: "Conjunctival injection", i: Flame },
  { id: "opacity", n: "Corneal opacity", i: CircleDot },
  { id: "elevated_iop", n: "Elevated IOP", i: Activity },
  { id: "retinopathy", n: "Diabetic retinopathy signs", i: Waves },
  { id: "disc_change", n: "Disc / macular change", i: Hexagon },
];

/** Sample today's examination queue — no dedicated appointments backend exists yet for this workspace. */
export const MOCK_QUEUE: ExamPatient[] = [
  {
    id: "OPH-2026-0001",
    name: "Anita Sharma",
    age: 58,
    g: "f",
    conds: ["cataract"],
    urg: "warn",
    photo: null,
    visits: [{ ago: 30, dx: "cataract", od: [-1.0, -0.5, 80], os: [-0.75, -0.25, 95], iop: [19, 18] }],
  },
  {
    id: "OPH-2026-0002",
    name: "Bikash Thapa",
    age: 41,
    g: "m",
    conds: ["refractive"],
    urg: "ok",
    photo: null,
    visits: [{ ago: 90, dx: "refractive", od: [-2.25, -0.5, 10], os: [-2.0, -0.25, 175], iop: [15, 16] }],
  },
  {
    id: "OPH-2026-0003",
    name: "Kiran Gurung",
    age: 63,
    g: "m",
    conds: ["glaucoma"],
    urg: "bad",
    photo: null,
    visits: [{ ago: 10, dx: "glaucoma", od: [0, 0, null], os: [0, 0, null], iop: [26, 23] }],
  },
  {
    id: "OPH-2026-0004",
    name: "Nisha Rai",
    age: 27,
    g: "f",
    conds: ["dryeye"],
    urg: "ok",
    photo: null,
    visits: [{ ago: 180, dx: "dryeye", od: [0, 0, null], os: [0, 0, null], iop: [14, 15] }],
  },
];
