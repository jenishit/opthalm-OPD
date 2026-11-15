"use client";

import { useCallback, useEffect, useState } from "react";
import { formatAge } from "@/lib/age";
import { getTodayQueue } from "@/services/queue-services";
import type { ExamPatient } from "./types";

function genderOf(sex: string | undefined): ExamPatient["g"] {
  if (sex === "Male") return "m";
  if (sex === "Female") return "f";
  return "o";
}

/** Today's real exam queue, converted to ExamPatient's nothing scheduled yet. */
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
              ageLabel: formatAge(item.patient.date_of_birth, item.patient.age),
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

  return { patients, loading, refresh };
}
