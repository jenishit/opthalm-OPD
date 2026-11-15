import * as z from "zod";

// Numeric inputs stay as strings in the form and are converted on save.
const num = (v: string) => v.trim() !== "" && Number.isFinite(Number(v));

const range = (label: string, min: number, max: number) =>
  z.string().trim().refine((v) => v === "" || (num(v) && Number(v) >= min && Number(v) <= max), `${label} must be between ${min} and ${max}`);

const eye = z
  .object({
    sph: range("Sphere", -30, 30),
    cyl: range("Cylinder", -12, 12),
    axis: z.string().trim().refine((v) => v === "" || (num(v) && Number.isInteger(Number(v)) && Number(v) >= 0 && Number(v) <= 180), "Axis must be a whole number from 0 to 180"),
    add: range("Add", 0, 4.5),
  })
  .superRefine((v, ctx) => {
    // A cylinder with no axis (or an axis with no cylinder) is an incomplete prescription.
    if (v.cyl !== "" && Number(v.cyl) !== 0 && v.axis === "") {
      ctx.addIssue({ code: "custom", path: ["axis"], message: "Axis is required with a cylinder" });
    }
    if (v.axis !== "" && v.cyl === "") {
      ctx.addIssue({ code: "custom", path: ["cyl"], message: "Enter the cylinder for this axis" });
    }
  });

export const rxFormSchema = z
  .object({
    patientId: z.string().min(1, "Select a patient"),
    patientName: z.string(),
    issuedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter the prescription date"),
    lensType: z.enum(["single_vision", "bifocal", "progressive", "contact_lens", "none"]),
    pd: range("PD", 20, 80),
    validMonths: z.enum(["6", "12", "24"]),
    notes: z.string(),
    od: eye,
    os: eye,
  })
  .superRefine((v, ctx) => {
    const anyValue = [v.od, v.os].some((e) => e.sph !== "" || e.cyl !== "" || e.add !== "");
    if (!anyValue) ctx.addIssue({ code: "custom", path: ["od", "sph"], message: "Enter at least one refraction value" });
    if (v.lensType === "progressive" || v.lensType === "bifocal") {
      if (v.od.add === "" && v.os.add === "") {
        ctx.addIssue({ code: "custom", path: ["od", "add"], message: "Add power is needed for this lens type" });
      }
    }
  });
export type RxFormValues = z.infer<typeof rxFormSchema>;
