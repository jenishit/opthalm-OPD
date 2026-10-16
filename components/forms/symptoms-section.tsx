"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import type { IntakeExamFormData } from "@/lib/schemas/shared.schema";
import { AlertCircle } from "lucide-react";

const booleanSymptoms = [
  { id: "foreign_body_sensation", label: "Foreign Body Sensation" },
  { id: "redness", label: "Redness" },
  { id: "swelling", label: "Swelling" },
  { id: "headache", label: "Headache" },
  { id: "eye_pain", label: "Eye Pain" },
  { id: "watery_eyes", label: "Watery Eyes" },
  { id: "discharge", label: "Discharge" },
  { id: "itching", label: "Itching" },
  { id: "photophobia", label: "Photophobia (Light Sensitivity)" },
  { id: "floaters", label: "Floaters" },
  { id: "flashes", label: "Flashes" },
  { id: "double_vision", label: "Double Vision (Diplopia)" },
  { id: "recent_fever", label: "Recent Fever" },
];

const stringOptions = [
  { id: "diminished_distance_vision", label: "Diminished Distance Vision" },
  { id: "diminished_near_vision", label: "Diminished Near Vision" },
  { id: "blurring", label: "Blurring" },
];

const severityOptions = ["none", "mild", "moderate", "severe"];

export function SymptomsSection() {
  const { register } = useFormContext<IntakeExamFormData>();

  return (
    <div className="space-y-6">
      <div className="bg-card p-6 rounded-2xl border border-border/60 ">
        <div className="flex items-center gap-2 border-b border-border/60 pb-3 mb-5">
          <AlertCircle className="h-5 w-5 text-clay" />
          <h3 className="font-display text-lg font-medium text-foreground">Review of Symptoms</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Vision Symptoms with Severity */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Vision Related</h4>
            <div className="space-y-4">
              {stringOptions.map((symptom) => (
                <div key={symptom.id} className="bg-muted/40 p-4 rounded-2xl border border-border/40">
                  <label className="block text-sm font-medium text-foreground mb-2">{symptom.label}</label>
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    {severityOptions.map((opt) => (
                      <label
                        key={opt}
                        className="flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-3 py-1 text-sm capitalize text-foreground cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/10 has-[:checked]:text-primary transition-colors"
                      >
                        <input
                          type="radio"
                          value={opt}
                          {...register(`symptoms.${symptom.id}` as any)}
                          className="h-3.5 w-3.5 accent-primary"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Boolean Symptoms */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Other Symptoms</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {booleanSymptoms.map((symptom) => (
                <label
                  key={symptom.id}
                  className="flex items-center gap-3 rounded-xl px-3 py-2 cursor-pointer text-sm text-foreground hover:bg-muted transition-colors"
                >
                  <input
                    type="checkbox"
                    {...register(`symptoms.${symptom.id}` as any)}
                    className="h-4 w-4 rounded accent-primary"
                  />
                  <span className="select-none">{symptom.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
