"use client";

import { useAsync } from "@/lib/hooks/use-async";
import { canAccess, type StaffRole } from "@/lib/permissions";
import { addDays, iso, mondayOf, today0 } from "@/lib/utils";
import { todayIsoKathmandu } from "@/lib/nepali-calendar";
import { getPatientStats } from "@/services/patients-services";
import { getDailySales } from "@/services/reports-services";
import { listInvoices } from "@/services/billing-services";
import { loadSchedule } from "@/services/queue-services";
import type { SalesSummary } from "@/types/reports-types";

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export interface DayPoint {
  day: string;
  /** Sales (admin) or visits (everyone else). */
  primary: number;
  /** Money collected (admin) — absent for the visits series. */
  secondary?: number;
}

/**
 * Everything the dashboard shows, from the real endpoints. Each source loads
 * independently, and a source the signed-in role can't use is skipped (reports
 * are admin-only) rather than faked.
 */
export function useDashboardData(role: StaffRole | undefined) {
  const today = todayIsoKathmandu();
  const monday = mondayOf(today0());
  const weekFrom = iso(monday);
  const weekTo = iso(addDays(monday, 6));
  const isAdmin = role ? canAccess(role, "/reports") : false;
  const canSeeInvoices = role ? canAccess(role, "/pos") : false;

  // This week's visits: today's queue, the stat cards, and (for non-admins) the chart.
  const week = useAsync(() => loadSchedule(weekFrom, weekTo));
  const stats = useAsync(() => getPatientStats().catch(() => null));

  // Admin-only money figures: one daily-sales report per day of the week.
  const sales = useAsync<SalesSummary[] | null>(async () => {
    if (!isAdmin) return null;
    const days = Array.from({ length: 7 }, (_, i) => iso(addDays(monday, i)));
    return Promise.all(days.map((d) => getDailySales(d).catch(() => ({ period: d, invoice_count: 0, subtotal: 0, discount: 0, tax: 0, total_sales: 0, total_paid: 0, total_due: 0 }))));
  });
  const invoices = useAsync(async () => (canSeeInvoices ? await listInvoices(5, 0).catch(() => []) : []));

  const weekItems = week.data ?? [];
  const todayItems = weekItems.filter((i) => i.visit.visit_date === today);

  const points: DayPoint[] = WEEK_DAYS.map((day, idx) => {
    const d = iso(addDays(monday, idx));
    if (isAdmin && sales.data) {
      const s = sales.data[idx];
      return { day, primary: s?.total_sales ?? 0, secondary: s?.total_paid ?? 0 };
    }
    return { day, primary: weekItems.filter((i) => i.visit.visit_date === d && i.visit.status !== "cancelled").length };
  });

  const todaySales = isAdmin ? (sales.data?.[(new Date().getDay() + 6) % 7] ?? null) : null;

  return { today, isAdmin, week, todayItems, stats, sales, invoices, points, todaySales };
}
