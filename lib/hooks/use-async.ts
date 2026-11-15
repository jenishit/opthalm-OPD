"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, SessionExpiredError } from "@/services/http";

/**
 * Minimal data-loading hook: loading / error / retry in one place so a failed
 * fetch is never mistaken for "no data". `fn` is read through a ref, so it may
 * be an inline arrow; call `reload()` to refetch.
 */
export function useAsync<T>(fn: () => Promise<T>) {
  const fnRef = useRef(fn);
  useEffect(() => {
    fnRef.current = fn;
  });

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let active = true;
    fnRef
      .current()
      .then((d) => {
        if (!active) return;
        setData(d);
        setError(null);
      })
      .catch((e) => {
        if (!active || e instanceof SessionExpiredError) return;
        setError(e instanceof ApiError ? e.message : "Something went wrong. Please try again.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [tick]);

  const reload = useCallback(() => {
    setLoading(true);
    setTick((t) => t + 1);
  }, []);

  return { data, loading, error, reload };
}
