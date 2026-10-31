"use client";

import { useEffect, useMemo, useState } from "react";
import { getQueueForRange, type QueueItem } from "@/services/queue-services";
import { getMockWeekQueue } from "@/lib/mock/appointments";
import { mondayOf, today0, iso } from "@/lib/utils";

/** The real visits whose visit_date falls within [start, end] (inclusive); falls back to the sample week when the range is genuinely empty. */
export function useMonthQueue(start: Date, end: Date) {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const startKey = iso(start);
  const endKey = iso(end);

  useEffect(() => {
    let active = true;
    getQueueForRange(startKey, endKey)
      .then((data) => {
        if (active) setItems(data);
      })
      .catch((error) => {
        console.error("Failed to fetch month schedule", error);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [startKey, endKey]);

  const usingMock = !loading && items.length === 0;
  const mockItems = useMemo(() => getMockWeekQueue(mondayOf(today0())), []);

  return { items: usingMock ? mockItems : items, loading, usingMock };
}
