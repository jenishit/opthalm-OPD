export type Urg = "ok" | "warn" | "bad";
export type Gender = "m" | "f" | "o";
export type ArtCat = "contact" | "frames" | "meds" | "surgical" | "equipment";

export interface Visit {
  ago: number;
  dx: string;
  od: [number | null, number | null, number | null];
  os: [number | null, number | null, number | null];
  iop: [number, number];
}

/**
 * Local, mock-only patient shape for this registration wizard. Deliberately
 * separate from the real `schemas/patient-schema` Patient type — this page
 * has no backend wiring yet (no clinical-exam endpoints exist), so it works
 * against in-memory sample data rather than the real patient record shape.
 */
export interface Patient {
  id: string;
  name: string;
  age: number;
  g: Gender;
  conds: string[];
  urg: Urg;
  photo?: string | null;
  visits: Visit[];
}

export interface InventoryItem {
  id: string;
  name: string;
  cat: ArtCat;
  qty: number;
  hue: number;
}
