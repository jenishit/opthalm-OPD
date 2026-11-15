import * as z from "zod";
import { positiveMoney } from "./field-helpers";

const methods = ["cash", "card", "bank_transfer", "online"] as const;

/** `refundable` is what is currently paid on the invoice (net of earlier refunds). */
export const refundSchema = (refundable: number) =>
  z.object({
    amount: positiveMoney("Refund amount").refine((v) => Number(v) <= refundable, `Can't exceed what was paid (${refundable})`),
    method: z.enum(methods),
    reason: z.string().trim().min(5, "Give a reason (at least 5 characters) — it stays on the record"),
  });
export type RefundForm = z.infer<ReturnType<typeof refundSchema>>;
