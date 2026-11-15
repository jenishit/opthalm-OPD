import type { Urg } from "./types";

export type TabId = "va" | "chart" | "map" | "investigations" | "findings";

export const TABS: Array<{ id: TabId; label: string }> = [
  { id: "va", label: "Visual acuity" },
  { id: "chart", label: "Exam chart" },
  { id: "map", label: "Eye map" },
  { id: "investigations", label: "Investigations" },
  { id: "findings", label: "Findings" },
];

export const URG_TONE: Record<Urg, "ok" | "warn" | "bad"> = { ok: "ok", warn: "warn", bad: "bad" };
export const URG_NAME: Record<Urg, string> = { ok: "Stable", warn: "Monitor", bad: "Urgent" };

export const QUEUE_TIMES = ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM"];

export const FU_OPTIONS = [
  [7, "1 wk"],
  [14, "2 wk"],
  [30, "1 mo"],
  [90, "3 mo"],
  [180, "6 mo"],
] as const;

/** Setter for a nested path inside the current patient's exam state. */
export type SetExam = (path: Array<string | number>, value: unknown) => void;
