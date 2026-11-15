import { create } from "zustand";
import type { PrescriptionRecord } from "@/types/prescription-types";

interface PrescriptionStore {
  prescriptions: PrescriptionRecord[];
  upsert: (record: PrescriptionRecord) => void;
}

/**
 * Prescriptions created by hand in this browser only (there is no backend document for them).
 * Real prescriptions come from examinations — see services/prescriptions-services.ts.
 */
export const usePrescriptionStore = create<PrescriptionStore>((set) => ({
  prescriptions: [],
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
