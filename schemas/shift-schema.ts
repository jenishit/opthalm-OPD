import * as z from "zod";
import { optionalMoney, requiredMoney } from "./field-helpers";

export const openShiftSchema = z.object({
  openingFloat: optionalMoney("Opening float"),
});
export type OpenShiftForm = z.infer<typeof openShiftSchema>;

/** Closing needs an explanation whenever the drawer doesn't balance. */
export const closeShiftSchema = (expectedCash: number) =>
  z
    .object({ countedCash: requiredMoney("Counted cash"), notes: z.string().trim() })
    .superRefine((v, ctx) => {
      const counted = Number(v.countedCash);
      if (Number.isFinite(counted) && Math.round((counted - expectedCash) * 100) !== 0 && v.notes === "") {
        ctx.addIssue({ code: "custom", path: ["notes"], message: "Explain the difference before closing" });
      }
    });
export type CloseShiftForm = z.infer<ReturnType<typeof closeShiftSchema>>;
