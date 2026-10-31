import { apiFetch } from "./http";
import type {
  CreateInvoiceRequest,
  Invoice,
  InvoiceResponse,
  RecordPaymentRequest,
  Payment,
  UpdateInvoiceStatusRequest,
  WhatsAppLink,
} from "@/types/billing-types";

/** POST /billing/invoice */
export function createInvoice(body: CreateInvoiceRequest): Promise<Invoice> {
  return apiFetch<Invoice>("/billing/invoice", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/** GET /billing/invoice?limit&offset */
export function listInvoices(limit = 50, offset = 0): Promise<Invoice[]> {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  return apiFetch<Invoice[]>(`/billing/invoice?${params.toString()}`);
}

/** GET /billing/invoice/search?query&limit */
export function searchInvoices(query: string, limit = 50): Promise<Invoice[]> {
  const params = new URLSearchParams({ query, limit: String(limit) });
  return apiFetch<Invoice[]>(`/billing/invoice/search?${params.toString()}`);
}

/** GET /billing/invoice/:id */
export function getInvoice(id: string): Promise<Invoice> {
  return apiFetch<Invoice>(`/billing/invoice/${id}`);
}

/** PATCH /billing/invoice/:id/status */
export function updateInvoiceStatus(
  id: string,
  body: UpdateInvoiceStatusRequest
): Promise<void> {
  return apiFetch<void>(`/billing/invoice/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

/** POST /billing/invoice/:id/payments */
export function recordPayment(
  id: string,
  body: RecordPaymentRequest
): Promise<Payment> {
  return apiFetch<Payment>(`/billing/invoice/${id}/payments`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * GET /billing/invoice/:id/pdf — binary download with the auth header, so it
 * goes through fetch + object URL rather than a plain navigation.
 */
export async function downloadInvoicePdf(id: string): Promise<Blob> {
  const res = await fetch(`/api/billing/invoice/${id}/pdf`);
  if (!res.ok) throw new Error("Failed to download invoice PDF");
  return res.blob();
}

/** GET /billing/invoice/:id/qr — binary (PNG). */
export async function downloadInvoiceQr(id: string): Promise<Blob> {
  const res = await fetch(`/api/billing/invoice/${id}/qr`);
  if (!res.ok) throw new Error("Failed to fetch invoice QR code");
  return res.blob();
}

/** GET /billing/invoice/:id/whatsapp-link */
export function getInvoiceWhatsAppLink(id: string): Promise<WhatsAppLink> {
  return apiFetch<WhatsAppLink>(`/billing/invoice/${id}/whatsapp-link`);
}
