import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { NativeSelect } from "@/components/forms/NativeSelect";
import { Chip } from "@/components/ui/ChartUi";
import { uid } from "@/lib/utils";
import type { SetExam } from "./constants";
import { INVESTIGATION_PRESETS } from "./exam-defaults";
import type { ExamInvestigation, ExamState } from "./types";

const LABEL = "mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground";
const MAX_TYPE = 50;
const MAX_RESULT = 50;
const MAX_NOTES = 255;

/**
 * Free-form investigations: pick a common test or type any name, choose the
 * eye, and record a result and notes. Each row is saved to the visit.
 */
export function InvestigationsTab({ ex, set }: { ex: ExamState; set: SetExam }) {
  const [draft, setDraft] = useState("");
  const rows = ex.investigations;

  const add = (type: string) => {
    const t = type.trim().slice(0, MAX_TYPE);
    if (!t) return;
    set(["investigations"], [...rows, { id: uid(), type: t, eye: "OU", result: "", notes: "" } satisfies ExamInvestigation]);
    setDraft("");
  };
  const patch = (id: string, change: Partial<ExamInvestigation>) =>
    set(["investigations"], rows.map((r) => (r.id === id ? { ...r, ...change } : r)));
  const remove = (id: string) => set(["investigations"], rows.filter((r) => r.id !== id));

  return (
    <div className="flex flex-col gap-5">
      <div>
        <span className={LABEL}>Add a test</span>
        <div className="flex flex-wrap gap-1.5">
          {INVESTIGATION_PRESETS.map((name) => (
            <Chip key={name} on={false} onClick={() => add(name)}>
              + {name}
            </Chip>
          ))}
        </div>
        <div className="mt-2 flex max-w-md gap-1.5">
          <Input
            value={draft}
            maxLength={MAX_TYPE}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add(draft))}
            placeholder="Any other test…"
            aria-label="Other investigation name"
            className="text-sm"
          />
          <Button type="button" variant="secondary" onClick={() => add(draft)} disabled={!draft.trim()}>
            <Plus className="size-4" />
            Add
          </Button>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-md border border-dashed border-line p-6 text-center text-sm text-muted-foreground">
          No investigations added. Pick a test above, or type your own.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map((r) => (
            <li key={r.id} className="rounded-md border border-line bg-card p-3">
              <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_120px_minmax(0,1fr)_auto]">
                <div>
                  <label className={LABEL} htmlFor={`inv-type-${r.id}`}>Test</label>
                  <Input id={`inv-type-${r.id}`} value={r.type} maxLength={MAX_TYPE} onChange={(e) => patch(r.id, { type: e.target.value })} className="text-sm" />
                </div>
                <div>
                  <label className={LABEL} htmlFor={`inv-eye-${r.id}`}>Eye</label>
                  <NativeSelect id={`inv-eye-${r.id}`} value={r.eye} onChange={(e) => patch(r.id, { eye: e.target.value as ExamInvestigation["eye"] })}>
                    <option value="OU">Both (OU)</option>
                    <option value="OD">Right (OD)</option>
                    <option value="OS">Left (OS)</option>
                    <option value="">Not eye-specific</option>
                  </NativeSelect>
                </div>
                <div>
                  <label className={LABEL} htmlFor={`inv-res-${r.id}`}>Result</label>
                  <Input id={`inv-res-${r.id}`} value={r.result} maxLength={MAX_RESULT} onChange={(e) => patch(r.id, { result: e.target.value })} placeholder="e.g. 8 mm" className="text-sm" />
                </div>
                <div className="flex items-end">
                  <Button type="button" variant="ghost" size="icon" onClick={() => remove(r.id)} aria-label={`Remove ${r.type || "investigation"}`}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
              <div className="mt-2">
                <label className={LABEL} htmlFor={`inv-notes-${r.id}`}>Notes</label>
                <Input id={`inv-notes-${r.id}`} value={r.notes} maxLength={MAX_NOTES} onChange={(e) => patch(r.id, { notes: e.target.value })} placeholder="Optional" className="text-sm" />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
