"use client";

import { useCallback, useEffect, useRef } from "react";
import { useAsync } from "@/lib/hooks/use-async";
import { invalidateScheduleCache, loadSchedule, type QueueItem } from "@/services/queue-services";

/**
 * Visits for a clinic-local date range (≤ 62 days) from GET /visit. `loading` is
 * only true for the first load of a range — refreshes keep the current data on
 * screen so the board doesn't flash after every action.
 */
export function useSchedule(from: string, to: string) {
  const range = useRef({ from, to });
  const { data, loading, error, reload } = useAsync(() => loadSchedule(range.current.from, range.current.to));

  // Refetch when the range changes (the async loader reads the ref).
  useEffect(() => {
    if (range.current.from === from && range.current.to === to) return;
    range.current = { from, to };
    reload();
  }, [from, to, reload]);

  const refresh = useCallback(() => {
    invalidateScheduleCache();
    reload();
  }, [reload]);

  const items: QueueItem[] = data ?? [];
  return { items, loading: loading && !data, refreshing: loading && Boolean(data), error: data ? null : error, refresh };
}
