"use client";

import { useCallback, useEffect, useState } from "react";
import { getTodayQueue } from "@/services/queue-services";
import { MOCK_QUEUE } from "./mock-data";
import type { ExamPatient } from "./types";

function genderOf(sex: string | undefined): ExamPatient["g"] {
  if (sex === "Male") return "m";
  if (sex === "Female") return "f";
  return "o";
}

/** Today's real exam queue, converted to ExamPatient; falls back to MOCK_QUEUE when there's nothing scheduled yet. */
export function useExamQueue() {
  const [patients, setPatients] = useState<ExamPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    getTodayQueue()
      .then((items) => {
        if (!active) return;
        setPatients(
          items.map(
            (item): ExamPatient => ({
              id: item.patient.id,
              name: `${item.patient.first_name} ${item.patient.last_name}`,
              age: item.patient.age ?? 0,
              g: genderOf(item.patient.sex),
              conds: [],
              urg: "ok",
              photo: null,
              visits: [],
              visitId: item.visit.id,
              chiefComplaint: item.visit.chief_complaint,
            })
          )
        );
      })
      .catch((error) => {
        console.error("Failed to fetch today's exam queue", error);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const refresh = useCallback(() => {
    setLoading(true);
    setReloadKey((k) => k + 1);
  }, []);

  const usingMock = !loading && patients.length === 0;
  return { patients: usingMock ? MOCK_QUEUE : patients, loading, usingMock, refresh };
}
