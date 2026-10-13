import { apiFetch } from "./http";
import type {
  InventoryItemDTO,
  InventoryValuationDTO,
  PatientDueDTO,
  SalesSummaryDTO,
  VendorDueDTO,
  VisitsSummaryDTO,
} from "@/types/api";

/** GET /reports/sales/daily?date=YYYY-MM-DD&format=csv|pdf */
export function getDailySales(date: string, format?: "csv" | "pdf"): Promise<SalesSummaryDTO> {
  const params = new URLSearchParams({ date });
  if (format) params.set("format", format);
  return apiFetch<SalesSummaryDTO>(`/reports/sales/daily?${params.toString()}`);
}

/** GET /reports/sales/monthly?year&month&format=csv|pdf */
export function getMonthlySales(
  year: number,
  month: number,
  format?: "csv" | "pdf"
): Promise<SalesSummaryDTO> {
  const params = new URLSearchParams({
    year: String(year),
    month: String(month),
  });
  if (format) params.set("format", format);
  return apiFetch<SalesSummaryDTO>(`/reports/sales/monthly?${params.toString()}`);
}

/** GET /reports/sales/range?from=YYYY-MM-DD&to=YYYY-MM-DD&format=csv|pdf */
export function getSalesRange(
  from: string,
  to: string,
  format?: "csv" | "pdf"
): Promise<SalesSummaryDTO[]> {
  const params = new URLSearchParams({ from, to });
  if (format) params.set("format", format);
  return apiFetch<SalesSummaryDTO[]>(`/reports/sales/range?${params.toString()}`);
}

/** GET /reports/dues&format=csv|pdf */
export function getDuesReport(format?: "csv" | "pdf"): Promise<PatientDueDTO[]> {
  const params = format ? "?format=" + format : "";
  return apiFetch<PatientDueDTO[]>(`/reports/dues${params}`);
}

/** GET /reports/vendor-dues&format=csv|pdf */
export function getVendorDuesReport(format?: "csv" | "pdf"): Promise<VendorDueDTO[]> {
  const params = format ? "?format=" + format : "";
  return apiFetch<VendorDueDTO[]>(`/reports/vendor-dues${params}`);
}

/** GET /reports/inventory/low-stock&format=csv|pdf */
export function getLowStockReport(format?: "csv" | "pdf"): Promise<InventoryItemDTO[]> {
  const params = format ? "?format=" + format : "";
  return apiFetch<InventoryItemDTO[]>(`/reports/inventory/low-stock${params}`);
}

/** GET /reports/inventory/valuation&format=csv|pdf */
export function getInventoryValuation(
  format?: "csv" | "pdf"
): Promise<InventoryValuationDTO> {
  const params = format ? "?format=" + format : "";
  return apiFetch<InventoryValuationDTO>(`/reports/inventory/valuation${params}`);
}

/** GET /reports/visits/summary?from=YYYY-MM-DD&to=YYYY-MM-DD&group_by&format=csv|pdf */
export function getVisitsSummary(
  from: string,
  to: string,
  groupBy?: "day" | "week" | "month" | string,
  format?: "csv" | "pdf"
): Promise<VisitsSummaryDTO[]> {
  const params = new URLSearchParams({ from, to });
  if (groupBy) params.set("group_by", groupBy);
  if (format) params.set("format", format);
  return apiFetch<VisitsSummaryDTO[]>(`/reports/visits/summary?${params.toString()}`);
}
