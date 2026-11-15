import type { Control } from "react-hook-form";
import { FormField } from "@/components/forms";
import type { RxFormValues } from "@/schemas/rx-form-schema";
import { fieldClass } from "./rx-utils";

const COLUMNS = [
  { key: "sph", label: "SPH", step: 0.25 },
  { key: "cyl", label: "CYL", step: 0.25 },
  { key: "axis", label: "Axis", step: 1 },
  { key: "add", label: "ADD", step: 0.25 },
] as const;

const EYES = [
  { key: "od", label: "Right (OD)", sr: "right" },
  { key: "os", label: "Left (OS)", sr: "left" },
] as const;

export function RxEyeTable({ control }: { control: Control<RxFormValues> }) {
  return (
    <div className="overflow-hidden rounded-md border border-line">
      <div className="grid grid-cols-[1.2fr_repeat(4,1fr)] bg-app text-[11px] font-semibold uppercase tracking-[0.14em] text-mute">
        <span className="px-3 py-2">Eye</span>
        {COLUMNS.map((c) => (
          <span key={c.key} className="px-3 py-2 text-center">{c.label}</span>
        ))}
      </div>
      {EYES.map((eye) => (
        <div key={eye.key} className="grid grid-cols-[1.2fr_repeat(4,1fr)] items-start gap-1.5 border-t border-line p-1.5">
          <b className="px-1.5 pt-2 text-sm">{eye.label}</b>
          {COLUMNS.map((c) => (
            <FormField key={c.key} control={control} name={`${eye.key}.${c.key}`} label={<span className="sr-only">{`${c.label} ${eye.sr} eye`}</span>} className="gap-1">
              {({ field, id, invalid }) => (
                <input {...field} id={id} type="number" step={c.step} aria-invalid={invalid} className={`${fieldClass} text-center aria-invalid:border-destructive`} />
              )}
            </FormField>
          ))}
        </div>
      ))}
    </div>
  );
}
