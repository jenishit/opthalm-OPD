import * as z from "zod";
import { optionalDate, optionalMoney, positiveInt, requiredMoney } from "./field-helpers";

export const purchaseSchema = z
  .object({
    vendorId: z.string().min(1, "Select a vendor"),
    billNo: z.string().trim(),
    paid: optionalMoney("Paid amount"),
    lines: z
      .array(
        z.object({
          itemId: z.string().min(1, "Select a product"),
          qty: positiveInt("Quantity"),
          cost: requiredMoney("Unit cost").refine((v) => Number(v) > 0, "Unit cost must be more than zero"),
          /** Batch number and expiry — needed for batch-tracked products (checked in the dialog, which knows which are). */
          lot: z.string().trim().max(60, "Batch number is too long"),
          expiry: optionalDate,
        }),
      )
      .min(1, "Add at least one line"),
  })
  .superRefine((v, ctx) => {
    const total = v.lines.reduce((s, l) => s + Number(l.qty) * Number(l.cost), 0);
    if (v.paid !== "" && Number(v.paid) > total) {
      ctx.addIssue({ code: "custom", path: ["paid"], message: "Paid amount can't exceed the total" });
    }
  });
export type PurchaseForm = z.infer<typeof purchaseSchema>;
