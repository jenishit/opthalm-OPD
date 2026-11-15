import { apiFetch } from "./http";
import type { InventoryItem } from "@/types/inventory-types";
import type {
  ClinicalActivity,
  InventoryValuation,
  PatientDue,
  SalesByCategory,
  SalesSummary,
  VendorDue,
  VisitsSummary,
} from "@/types/reports-types";

/** GET /reports/sales/daily?date=YYYY-MM-DD&format=csv|pdf */
export function getDailySales(date: string, format?: "csv" | "pdf"): Promise<SalesSummary> {
  const params = new URLSearchParams({ date });
  if (format) params.set("format", format);
  return apiFetch<SalesSummary>(`/reports/sales/daily?${params.toString()}`);
}

/** GET /reports/sales/monthly?year&month&format=csv|pdf */
export function getMonthlySales(
  year: number,
  month: number,
  format?: "csv" | "pdf"
): Promise<SalesSummary> {
  const params = new URLSearchParams({
    year: String(year),
    month: String(month),
  });
  if (format) params.set("format", format);
  return apiFetch<SalesSummary>(`/reports/sales/monthly?${params.toString()}`);
}

/** GET /reports/sales/range?from=YYYY-MM-DD&to=YYYY-MM-DD&format=csv|pdf */
export function getSalesRange(
  from: string,
  to: string,
  format?: "csv" | "pdf"
): Promise<SalesSummary[]> {
  const params = new URLSearchParams({ from, to });
  if (format) params.set("format", format);
  return apiFetch<SalesSummary[]>(`/reports/sales/range?${params.toString()}`);
}

/** GET /reports/dues&format=csv|pdf */
export function getDuesReport(format?: "csv" | "pdf"): Promise<PatientDue[]> {
  const params = format ? "?format=" + format : "";
  return apiFetch<PatientDue[]>(`/reports/dues${params}`);
}

/** GET /reports/vendor-dues&format=csv|pdf */
export function getVendorDuesReport(format?: "csv" | "pdf"): Promise<VendorDue[]> {
  const params = format ? "?format=" + format : "";
  return apiFetch<VendorDue[]>(`/reports/vendor-dues${params}`);
}

/** GET /reports/inventory/low-stock&format=csv|pdf */
export function getLowStockReport(format?: "csv" | "pdf"): Promise<InventoryItem[]> {
  const params = format ? "?format=" + format : "";
  return apiFetch<InventoryItem[]>(`/reports/inventory/low-stock${params}`);
}

/** GET /reports/inventory/valuation&format=csv|pdf */
export function getInventoryValuation(
  format?: "csv" | "pdf"
): Promise<InventoryValuation> {
  const params = format ? "?format=" + format : "";
  return apiFetch<InventoryValuation>(`/reports/inventory/valuation${params}`);
}

/** GET /reports/visits/summary?from=YYYY-MM-DD&to=YYYY-MM-DD&group_by&format=csv|pdf */
export function getVisitsSummary(
  from: string,
  to: string,
  groupBy?: "day" | "week" | "month" | string,
  format?: "csv" | "pdf"
): Promise<VisitsSummary[]> {
  const params = new URLSearchParams({ from, to });
  if (groupBy) params.set("group_by", groupBy);
  if (format) params.set("format", format);
  return apiFetch<VisitsSummary[]>(`/reports/visits/summary?${params.toString()}`);
}

/** GET /reports/sales/by-category?from=YYYY-MM-DD&to=YYYY-MM-DD&format=csv */
export async function getSalesByCategory(from: string, to: string): Promise<SalesByCategory[]> {
  const params = new URLSearchParams({ from, to });
  // The backend answers { period, categories: [{ category, amount }] } — not a bare array.
  const res = await apiFetch<{ period?: string; categories?: Array<{ category: string; amount: number }> } | null>(
    `/reports/sales/by-category?${params.toString()}`,
  );
  return (res?.categories ?? []).map((c) => ({ category: c.category as SalesByCategory["category"], item_count: 0, total_sales: Number(c.amount) || 0 }));
}

/** GET /reports/clinical-activity?from=YYYY-MM-DD&to=YYYY-MM-DD&format=csv */
export function getClinicalActivity(from: string, to: string, format?: "csv"): Promise<ClinicalActivity> {
  const params = new URLSearchParams({ from, to });
  if (format) params.set("format", format);
  return apiFetch<ClinicalActivity>(`/reports/clinical-activity?${params.toString()}`);
}
