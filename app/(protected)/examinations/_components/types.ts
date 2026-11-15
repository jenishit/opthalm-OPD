export type Gender = "m" | "f" | "o";
export type Urg = "ok" | "warn" | "bad";

export interface Rx {
  s: number | null;
  c: number | null;
  a: number | null;
}

export interface Visit {
  ago: number;
  dx: string;
  od: [number | null, number | null, number | null];
  os: [number | null, number | null, number | null];
  iop: [number, number];
}

export interface ExamPatient {
  id: string;
  name: string;
  age: number;
  /** Display age — months/days for infants, e.g. "7 months". */
  ageLabel?: string;
  g: Gender;
  conds: string[];
  urg: Urg;
  photo?: string | null;
  visits: Visit[];
  /** Today's real visit id (from the queue) — set when this patient came from the real queue, not MOCK_QUEUE. Saving the exam attaches clinical data to this visit. */
  visitId?: string;
  /** The real visit's chief complaint, shown in the header in place of the generic condition-based guess. */
  chiefComplaint?: string;
}

export interface VaValue {
  d: string | null;
  n: string | null;
}

/** One selected finding per slit-lamp region (see SLIT in ./data) — null until tapped. */
export interface SlitFindings {
  lids: string | null;
  conj: string | null;
  k: string | null;
  ac: string | null;
  p: string | null;
  l: string | null;
}

export interface FundusMark {
  x: number;
  y: number;
  t: string;
}

export interface FundusFindings {
  marks: FundusMark[];
  /** Cup:disc ratio, 0.1-0.9. */
  cd: number;
  status: string[];
}

/** One investigation the examiner entered — any test name, any eye, free result and notes. */
export interface ExamInvestigation {
  id: string;
  /** Test name, e.g. "Schirmer test" (backend limit 50 characters). */
  type: string;
  eye: "OD" | "OS" | "OU" | "";
  /** Backend limit 50 characters. */
  result: string;
  /** Backend limit 255 characters. */
  notes: string;
}

export interface ExamState {
  /** Uncorrected / presenting visual acuity — the Snellen letters identified, before refraction. */
  va: { od: string[]; os: string[] };
  ret: { od: [number | null, number | null]; os: [number | null, number | null] };
  mr: { od: Rx; os: Rx };
  add: { od: number | null; os: number | null };
  cv: { od: VaValue; os: VaValue };
  iop: { od: number | null; os: number | null };
  slit: { od: SlitFindings; os: SlitFindings };
  fundus: { od: FundusFindings; os: FundusFindings };
  marks: { od: string[]; os: string[] };
  investigations: ExamInvestigation[];
  findings: string[];
  /** Which eye each finding applies to, keyed by finding id (checklist) or text (typed). Missing = both eyes. */
  /** Original diagnosis_id of findings loaded from the record, so re-saving keeps catalog ids. Keyed like findingEye. */
  findingId: Record<string, string>;
  findingEye: Record<string, "OD" | "OS" | "OU" | "none">;
  /** Free-text findings typed in beyond the fixed checklist. */
  customFindings: string[];
  fu: number | null;
  /** Free-text follow-up instructions beyond the fixed interval chips. */
  fuNote: string;
  notes: string;
  saved: boolean;
  issued: boolean;
}
