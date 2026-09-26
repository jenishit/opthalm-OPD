"use client";

import React from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import type { IntakeExamFormData } from "@/lib/schemas/shared.schema";
import { FileSearch, Plus, Trash2 } from "lucide-react";

const fieldCls =
  "w-full rounded-xl border border-input bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus-visible:ring-2 focus-visible:ring-ring/40";

export function InvestigationsSection() {
  const { register, control } = useFormContext<IntakeExamFormData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "investigations",
  });

  return (
    <div className="space-y-6">
      <div className="bg-card p-6 rounded-2xl border border-border/60 ">
        <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-5">
          <div className="flex items-center gap-2">
            <FileSearch className="h-5 w-5 text-status-examining" />
            <h3 className="font-display text-lg font-medium text-foreground">Investigations</h3>
          </div>
          <button
            type="button"
            onClick={() => append({ investigation_name: "", status: "ordered" })}
            className="inline-flex items-center gap-1.5 rounded-full bg-status-examining-bg px-3.5 py-1.5 text-sm font-medium text-status-examining transition-colors hover:brightness-95"
          >
            <Plus className="h-4 w-4" /> Add Test
          </button>
        </div>

        {fields.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground bg-muted/40 rounded-2xl border border-dashed border-border">
            No investigations ordered for this visit.
          </div>
        ) : (
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="relative bg-muted/40 p-5 rounded-2xl border border-border/40 pr-12">
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="absolute top-3 right-3 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Test Name <span className="text-destructive">*</span>
                    </label>
                    <input
                      {...register(`investigations.${index}.investigation_name`)}
                      type="text"
                      placeholder="e.g. OCT Macula, VFA, Blood Sugar"
                      className={fieldCls}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Status</label>
                    <select {...register(`investigations.${index}.status`)} className={fieldCls}>
                      <option value="ordered">Ordered</option>
                      <option value="completed">Completed</option>
                      <option value="reviewed">Reviewed</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-1.5">Results / Notes</label>
                    <textarea
                      {...register(`investigations.${index}.results`)}
                      rows={2}
                      placeholder="Findings..."
                      className={fieldCls}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
