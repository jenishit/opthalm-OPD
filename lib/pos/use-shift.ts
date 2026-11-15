"use client";

import { useEffect, useState } from "react";
import { idbAvailable } from "@/lib/offline/idb";
import { getOpenShift, onShiftChange, type Shift } from "./shift";

/** The currently open shift on this terminal (null when none), kept live. */
export function useOpenShift() {
  const [shift, setShift] = useState<Shift | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = () => {
      (idbAvailable() ? getOpenShift() : Promise.resolve(null))
        .then((s) => {
          if (active) setShift(s);
        })
        .catch(() => {})
        .finally(() => {
          if (active) setLoading(false);
        });
    };
    load();
    const off = onShiftChange(load);
    return () => {
      active = false;
      off();
    };
  }, []);

  return { shift, loading };
}
