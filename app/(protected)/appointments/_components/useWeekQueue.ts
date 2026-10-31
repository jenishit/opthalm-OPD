"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getQueueForRange, type QueueItem } from "@/services/queue-services";
import { getPatients } from "@/services/patients-services";
import type { Patient } from "@/schemas/patient-schema";
import { getMockWeekQueue } from "@/lib/mock/appointments";
import { mockPatients } from "@/lib/mock/data";
import { addDays, iso } from "@/lib/utils";

/**
 * The week's real visits plus the full patient list, for the drag-and-drop
 * week board. Falls back to sample data (placed inside the same week) only
 * when the real range comes back genuinely empty.
 */
export function useWeekQueue(monday: Date) {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const mondayKey = iso(monday);

  useEffect(() => {
    let active = true;
    const start = new Date(`${mondayKey}T00:00:00`);
    const sunday = iso(addDays(start, 6));
    Promise.all([getQueueForRange(mondayKey, sunday), getPatients()])
      .then(([weekItems, allPatients]) => {
        if (!active) return;
        setItems(weekItems);
        setPatients(allPatients);
      })
      .catch((error) => {
        console.error("Failed to fetch week schedule", error);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [mondayKey, reloadKey]);

  const refresh = useCallback(() => {
    setLoading(true);
    setReloadKey((k) => k + 1);
  }, []);

  const usingMock = !loading && items.length === 0;
  // Memoized so the fallback array stays referentially stable across
  // re-renders of the same week — callers reseed local board state off of
  // this reference, and a fresh array every render would wipe local edits.
  const mockItems = useMemo(
    () => getMockWeekQueue(new Date(`${mondayKey}T00:00:00`)),
    [mondayKey]
  );

  return {
    items: usingMock ? mockItems : items,
    patients: usingMock ? mockPatients : patients,
    loading,
    usingMock,
    refresh,
  };
}
