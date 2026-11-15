"use client";

import { useMemo } from "react";
import { useAsync } from "@/lib/hooks/use-async";
import { invalidatePrescriptionCache, listVisitPrescriptions } from "@/services/prescriptions-services";
import type { PrescriptionRecord } from "@/types/prescription-types";
import { usePrescriptionStore } from "./store";

/** Real prescriptions (from examinations) + anything created by hand in this browser. */
export function usePrescriptions() {
  const real = useAsync(listVisitPrescriptions);
  const local = usePrescriptionStore((s) => s.prescriptions);
  const list: PrescriptionRecord[] = useMemo(() => {
    const merged = [...local.map((r) => ({ ...r, source: "local" as const })), ...(real.data ?? [])];
    return merged.sort((a, b) => b.issuedAt.localeCompare(a.issuedAt));
  }, [local, real.data]);
  return {
    list,
    loading: real.loading,
    error: real.error,
    reload: () => {
      invalidatePrescriptionCache();
      real.reload();
    },
  };
}
