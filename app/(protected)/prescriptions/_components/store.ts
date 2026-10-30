import { create } from "zustand";
import type { PrescriptionRecord } from "./types";

const SEED: PrescriptionRecord[] = [
  {
    id: "rx1",
    prescriptionNumber: "RX-2026-0001",
    patientId: "seed-sarah",
    patientName: "Sarah Johnson",
    issuedAt: "2026-05-27",
    lensType: "single_vision",
    pd: 62,
    validMonths: 12,
    notes: "Mild astigmatism. Recommend anti-reflective coating.",
    od: { sph: 0.25, cyl: -0.75, axis: 180, add: 1.0 },
    os: { sph: 0.5, cyl: -0.5, axis: 175, add: 1.0 },
    signedBy: "Dr. Sarah Mitchell",
    status: "issued",
  },
  {
    id: "rx2",
    prescriptionNumber: "RX-2026-0002",
    patientId: "seed-michael",
    patientName: "Michael Chen",
    issuedAt: "2026-05-20",
    lensType: "progressive",
    pd: 64,
    validMonths: 12,
    notes: "",
    od: { sph: -1.0, cyl: -0.25, axis: 90, add: 1.5 },
    os: { sph: -1.25, cyl: -0.5, axis: 85, add: 1.5 },
    signedBy: "Dr. James Lee",
    status: "draft",
  },
  {
    id: "rx3",
    prescriptionNumber: "RX-2025-0010",
    patientId: "seed-emily",
    patientName: "Emily Davis",
    issuedAt: "2025-01-12",
    lensType: "bifocal",
    pd: 60,
    validMonths: 24,
    notes: "Follow-up in 6 months.",
    od: { sph: 0.75, cyl: null, axis: null, add: 2.0 },
    os: { sph: 0.5, cyl: null, axis: null, add: 2.0 },
    signedBy: "Dr. Sarah Mitchell",
    status: "issued",
  },
];

interface PrescriptionStore {
  prescriptions: PrescriptionRecord[];
  upsert: (record: PrescriptionRecord) => void;
}

/** Mock prescriptions list, kept in a store so it survives navigating between the list and detail pages. */
export const usePrescriptionStore = create<PrescriptionStore>((set) => ({
  prescriptions: SEED,
  upsert: (record) =>
    set((state) => {
      const exists = state.prescriptions.some((p) => p.id === record.id);
      return {
        prescriptions: exists
          ? state.prescriptions.map((p) => (p.id === record.id ? record : p))
          : [record, ...state.prescriptions],
      };
    }),
}));
