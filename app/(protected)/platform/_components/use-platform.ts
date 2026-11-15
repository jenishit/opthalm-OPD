"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, SessionExpiredError } from "@/services/http";
import { getPlatformClinic, getPlatformOverview, getPlatformUsers } from "@/services/platform-services";
import type { PlatformClinicDetail, PlatformOverview, PlatformUsers } from "@/types/platform-types";

/**
 * Loads a platform-operator resource and refetches when `key` changes (the
 * selected date range / clinic id). A failed fetch keeps the last successful
 * payload visible while surfacing the error, so a period change never blanks
 * the page.
 */
function usePlatformResource<T>(key: string, loader: () => Promise<T>) {
  const loaderRef = useRef(loader);
  useEffect(() => {
    loaderRef.current = loader;
  });

  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const [settledKey, setSettledKey] = useState<string | null>(null);
  const [reloading, setReloading] = useState(false);

  useEffect(() => {
    let active = true;
    loaderRef
      .current()
      .then((result) => {
        if (!active) return;
        setData(result);
        setError(null);
      })
      .catch((e) => {
        if (!active || e instanceof SessionExpiredError) return;
        setError(e instanceof ApiError ? e.message : "Something went wrong. Please try again.");
      })
      .finally(() => {
        if (!active) return;
        setSettledKey(key);
        setReloading(false);
      });
    return () => {
      active = false;
    };
  }, [key, tick]);

  const reload = useCallback(() => {
    setReloading(true);
    setTick((t) => t + 1);
  }, []);

  // A new key (date range / clinic) is loading until its first response
  // settles; a manual reload is loading until the refresh settles too.
  const loading = settledKey !== key || reloading;

  return { data, loading, error, reload };
}

export function usePlatformOverview(from: string, to: string) {
  return usePlatformResource<PlatformOverview>(`overview|${from}|${to}`, () =>
    getPlatformOverview(from, to),
  );
}

export function usePlatformClinic(clinicId: string, from: string, to: string) {
  return usePlatformResource<PlatformClinicDetail>(`clinic|${clinicId}|${from}|${to}`, () =>
    getPlatformClinic(clinicId, from, to),
  );
}

export function usePlatformUsers() {
  return usePlatformResource<PlatformUsers>("users", getPlatformUsers);
}
