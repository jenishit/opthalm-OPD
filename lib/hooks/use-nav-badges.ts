"use client";

import { useEffect, useState } from "react";
import { canAccess, type StaffRole } from "@/lib/permissions";
import { listLabJobs } from "@/services/lab-services";
import { listLowStock } from "@/services/inventory-services";

export interface NavBadge {
  count: number;
  /** "alert" = needs attention (gold); "info" = informational (muted). */
  tone: "alert" | "info";
  /** Screen-reader description, e.g. "5 products low on stock". */
  label: string;
}

const REFRESH_MS = 2 * 60_000;
const LAB_PAGE = 200;

/**
 * Live sidebar counts. Each badge is fetched only if the signed-in role can open
 * that section, and only counts things that are really actionable:
 *  - /inventory       → products at or below their reorder point
 *  - /customer-orders → lab jobs not yet delivered or cancelled
 * Sections without a cheap backend count (appointments, exams, prescriptions)
 * deliberately show no badge rather than a wrong one.
 */
export function useNavBadges(role: StaffRole | undefined, enabled: boolean): Record<string, NavBadge> {
  const [badges, setBadges] = useState<Record<string, NavBadge>>({});

  useEffect(() => {
    if (!role || !enabled) return;
    let active = true;

    const load = async () => {
      if (typeof navigator !== "undefined" && !navigator.onLine) return;
      const next: Record<string, NavBadge> = {};
      const jobs: Array<Promise<void>> = [];

      if (canAccess(role, "/inventory")) {
        jobs.push(
          listLowStock()
            .then((items) => {
              if (items.length > 0) next["/inventory"] = { count: items.length, tone: "alert", label: `${items.length} product${items.length === 1 ? "" : "s"} low on stock` };
            })
            .catch(() => {}),
        );
      }
      if (canAccess(role, "/customer-orders")) {
        jobs.push(
          listLabJobs(LAB_PAGE, 0)
            .then((list) => {
              const open = list.filter((j) => j.status !== "delivered" && j.status !== "cancelled").length;
              if (open > 0) next["/customer-orders"] = { count: open, tone: "info", label: `${open} open customer order${open === 1 ? "" : "s"}` };
            })
            .catch(() => {}),
        );
      }

      await Promise.all(jobs);
      if (active) setBadges(next);
    };

    void load();
    const timer = setInterval(load, REFRESH_MS);
    const onFocus = () => void load();
    window.addEventListener("focus", onFocus);
    window.addEventListener("online", onFocus);
    return () => {
      active = false;
      clearInterval(timer);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("online", onFocus);
    };
  }, [role, enabled]);

  return badges;
}
