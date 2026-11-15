import { useState } from "react";
import { Check, Plus, X } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { NativeSelect } from "@/components/forms/NativeSelect";
import { Chip } from "@/components/ui/ChartUi";
import { addDays, cn, fmtDate, today0 } from "@/lib/utils";
import { FU_OPTIONS, type SetExam } from "./constants";
import { FINDINGS } from "./exam-defaults";
import type { ExamState } from "./types";

const LABEL = "mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground";

/** Which eye a finding applies to — defaults to both. */
function EyeSelect({ value, label, onChange }: { value: string | undefined; label: string; onChange: (v: string) => void }) {
  return (
    <NativeSelect value={value ?? "OU"} onChange={(e) => onChange(e.target.value)} aria-label={`Eye for ${label}`} className="h-9 w-[84px] shrink-0 bg-card text-xs">
      <option value="OU">Both</option>
      <option value="OD">Right</option>
      <option value="OS">Left</option>
    </NativeSelect>
  );
}

export function FindingsTab({ ex, set }: { ex: ExamState; set: SetExam }) {
  const [draft, setDraft] = useState("");

  const toggle = (id: string) =>
    set(["findings"], ex.findings.includes(id) ? ex.findings.filter((x) => x !== id) : [...ex.findings, id]);

  const addCustom = () => {
    const text = draft.trim();
    if (!text) return;
    set(["customFindings"], [...ex.customFindings, text]);
    setDraft("");
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="flex flex-col gap-1.5">
        <span className={LABEL}>Findings</span>
        {FINDINGS.map((f) => {
          const on = ex.findings.includes(f.id);
          const Icon = f.i;
          return (
            <div key={f.id} className="flex items-center gap-1.5">
            <button
              type="button"
              role="checkbox"
              aria-checked={on}
              onClick={() => toggle(f.id)}
              className={cn(
                "flex min-w-0 flex-1 items-center gap-2.5 rounded-md border p-2 text-left text-sm",
                on ? "border-clay bg-clay-soft" : "border-line bg-card hover:border-sage",
              )}
            >
              <span className={cn("grid h-5 w-5 shrink-0 place-items-center rounded border", on ? "border-clay bg-clay text-onacc" : "border-strong")}>
                {on && <Check className="size-3.5" />}
              </span>
              <Icon className="size-4 shrink-0 text-mute" />
              <span className="flex-1">{f.n}</span>
            </button>
            {on && <EyeSelect value={ex.findingEye[f.id]} label={f.n} onChange={(v) => set(["findingEye", f.id], v)} />}
            </div>
          );
        })}
        {ex.customFindings.map((text) => (
          <div key={text} className="flex items-center gap-2.5 rounded-md border border-clay bg-clay-soft p-2 text-sm">
            <span className="grid h-5 w-5 shrink-0 place-items-center rounded border border-clay bg-clay text-onacc">
              <Check className="size-3.5" />
            </span>
            <span className="flex-1">{text}</span>
            <EyeSelect value={ex.findingEye[text]} label={text} onChange={(v) => set(["findingEye", text], v)} />
            <button
              type="button"
              onClick={() => set(["customFindings"], ex.customFindings.filter((x) => x !== text))}
              aria-label={`Remove ${text}`}
              className="shrink-0 text-mute hover:text-clay"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}
        <div className="flex gap-1.5">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustom())}
            type="text"
            placeholder="Others…"
            className="text-sm"
          />
          <Button type="button" variant="ghost" size="icon" onClick={addCustom} aria-label="Add finding">
            <Plus className="size-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <span className={LABEL}>Follow-up in</span>
          <div className="flex flex-wrap gap-1.5">
            {FU_OPTIONS.map(([d, l]) => (
              <Chip key={d} on={ex.fu === d} onClick={() => set(["fu"], ex.fu === d ? null : d)}>
                {l}
              </Chip>
            ))}
          </div>
          {ex.fu != null && (
            <div className="mt-1.5 text-sm text-mute">
              Around {fmtDate(addDays(today0(), ex.fu), { weekday: "short", day: "numeric", month: "short" })}
            </div>
          )}
          <Input
            value={ex.fuNote}
            onChange={(e) => set(["fuNote"], e.target.value)}
            type="text"
            placeholder="Others… (e.g. call if vision drops)"
            className="mt-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="notes" className={LABEL}>Notes (optional)</label>
          <textarea
            id="notes"
            value={ex.notes}
            onChange={(e) => set(["notes"], e.target.value)}
            rows={4}
            placeholder="Only if needed"
            className="w-full rounded-md border border-line bg-card px-2.5 py-2 text-sm text-ink"
          />
        </div>
      </div>
    </div>
  );
}
