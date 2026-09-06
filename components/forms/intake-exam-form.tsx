"use client";

import React, { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { intakeExamFormSchema, type IntakeExamFormData } from "@/lib/schemas/shared.schema";
import { createFullVisit } from "@/lib/api/visits";
import { getLatestPatientHistory } from "@/lib/api/history";
import { useUiStore, type IntakeTab } from "@/lib/store/ui-store";
import { useAuthStore } from "@/lib/store/auth-store";

// We'll create these sections next
import { ChiefComplaintSection } from "./chief-complaint-section";
import { SymptomsSection } from "./symptoms-section";
import { RefractionSection } from "./refraction-section";
import { ExaminationSection } from "./examination-section";
import { InvestigationsSection } from "./investigations-section";
import { DiagnosisSection } from "./diagnosis-section";
import { TreatmentSection } from "./treatment-section";

const tabs: { id: IntakeTab; label: string }[] = [
  { id: "chief-complaint", label: "History & C/C" },
  { id: "symptoms", label: "Symptoms" },
  { id: "refraction", label: "Vision/Rx" },
  { id: "examination", label: "Examination" },
  { id: "investigations", label: "Investigations" },
  { id: "diagnosis", label: "Diagnosis" },
  { id: "treatment", label: "Treatment" },
];

export function IntakeExamForm({ patientId }: { patientId: string }) {
  const router = useRouter();
  const { activeIntakeTab, setActiveIntakeTab } = useUiStore();
  const { staffUser } = useAuthStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loadingInitial, setLoadingInitial] = useState(true);

  const methods = useForm<IntakeExamFormData>({
    resolver: zodResolver(intakeExamFormSchema),
    defaultValues: {
      chief_complaint: "",
      examined_by: staffUser?.name || "",
      history: {
        uses_spectacles: false,
        condition_ids: [],
      },
      symptoms: {
        recent_fever: false,
      },
      readings: [],
      examination: {},
      investigations: [],
      diagnoses: [],
      treatments: [],
    },
  });

  // Pre-fill history from latest record
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const latest = await getLatestPatientHistory(patientId);
        if (latest) {
          methods.reset({
            ...methods.getValues(),
            history: {
              uses_spectacles: latest.uses_spectacles,
              systemic_medications: latest.systemic_medications || "",
              topical_medications: latest.topical_medications || "",
              notes: latest.notes || "",
              condition_ids: latest.condition_ids || [],
            }
          });
        }
      } catch (error) {
        console.error("Failed to fetch history", error);
      } finally {
        setLoadingInitial(false);
      }
    };

    fetchHistory();
  }, [patientId, methods]);

  const onSubmit = async (data: IntakeExamFormData) => {
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const newVisit = await createFullVisit(patientId, data);
      router.push(`/staff/patients/${patientId}/visits/${newVisit.id}`);
    } catch (error: any) {
      setSubmitError(error.message || "Failed to save visit data");

      // Look for first error to switch tab if validation failed (though resolver handles most of it before onSubmit)
      const errors = methods.formState.errors;
      if (Object.keys(errors).length > 0) {
        if (errors.chief_complaint || errors.history) setActiveIntakeTab("chief-complaint");
        else if (errors.symptoms) setActiveIntakeTab("symptoms");
        else if (errors.readings) setActiveIntakeTab("refraction");
        else if (errors.examination) setActiveIntakeTab("examination");
        else if (errors.diagnoses) setActiveIntakeTab("diagnosis");
        else if (errors.treatments || errors.follow_up) setActiveIntakeTab("treatment");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle errors that prevent onSubmit from being called
  const onError = (errors: any) => {
    if (errors.chief_complaint || errors.history) setActiveIntakeTab("chief-complaint");
    else if (errors.symptoms) setActiveIntakeTab("symptoms");
    else if (errors.readings) setActiveIntakeTab("refraction");
    else if (errors.examination) setActiveIntakeTab("examination");
    else if (errors.diagnoses) setActiveIntakeTab("diagnosis");
    else if (errors.treatments || errors.follow_up) setActiveIntakeTab("treatment");
  };

  if (loadingInitial) {
    return <div className="p-8 text-center text-muted-foreground">Loading form context...</div>;
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit, onError)} className="flex flex-col h-full overflow-hidden">

        {/* Top Tab Navigation */}
        <div className="bg-muted/40 border-b border-border/60 px-4 overflow-x-auto shrink-0 flex">
          <nav className="-mb-px flex gap-1" aria-label="Tabs">
            {tabs.map((tab) => {
              const isActive = activeIntakeTab === tab.id;

              // Simple heuristic to check if a tab has errors to show red dot
              let hasError = false;
              const errors = methods.formState.errors;
              if (tab.id === "chief-complaint" && (errors.chief_complaint || errors.history)) hasError = true;
              if (tab.id === "symptoms" && errors.symptoms) hasError = true;
              if (tab.id === "refraction" && errors.readings) hasError = true;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveIntakeTab(tab.id)}
                  className={`
                    relative whitespace-nowrap my-2 px-4 py-2 rounded-full font-medium text-sm transition-colors
                    ${isActive
                      ? "bg-primary text-primary-foreground shadow-organic-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }
                  `}
                >
                  {tab.label}
                  {hasError && <span className="absolute top-1.5 right-1 h-2 w-2 rounded-full bg-destructive ring-2 ring-muted/40" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Form Error Banner */}
        {submitError && (
          <div className="bg-destructive/10 text-destructive border-b border-destructive/20 px-4 py-3 text-sm shrink-0 font-medium">
            Error: {submitError}
          </div>
        )}

        {Object.keys(methods.formState.errors).length > 0 && !submitError && (
          <div className="bg-accent/10 text-accent border-b border-accent/20 px-4 py-2 text-xs shrink-0 font-medium">
            Please correct the errors in the form before submitting.
          </div>
        )}

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-background">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className={activeIntakeTab === "chief-complaint" ? "block" : "hidden"}><ChiefComplaintSection /></div>
            <div className={activeIntakeTab === "symptoms" ? "block" : "hidden"}><SymptomsSection /></div>
            <div className={activeIntakeTab === "refraction" ? "block" : "hidden"}><RefractionSection /></div>
            <div className={activeIntakeTab === "examination" ? "block" : "hidden"}><ExaminationSection /></div>
            <div className={activeIntakeTab === "investigations" ? "block" : "hidden"}><InvestigationsSection /></div>
            <div className={activeIntakeTab === "diagnosis" ? "block" : "hidden"}><DiagnosisSection /></div>
            <div className={activeIntakeTab === "treatment" ? "block" : "hidden"}><TreatmentSection /></div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-card p-4 border-t border-border/60 shrink-0 flex flex-wrap justify-between items-center gap-3">
          <div className="text-sm text-muted-foreground">
            Saving visit for Dr. {methods.watch("examined_by") || "Unassigned"}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                const currentIndex = tabs.findIndex(t => t.id === activeIntakeTab);
                if (currentIndex > 0) setActiveIntakeTab(tabs[currentIndex - 1].id);
              }}
              disabled={activeIntakeTab === tabs[0].id}
              className="px-4 py-2 bg-card border border-border rounded-full text-sm font-medium text-foreground shadow-organic-sm hover:bg-muted transition-colors disabled:opacity-50"
            >
              Previous
            </button>

            {activeIntakeTab === tabs[tabs.length - 1].id ? (
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-full text-sm font-semibold shadow-organic-sm hover:bg-primary/90 hover:-translate-y-0.5 transition-all disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Save Complete Visit"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  const currentIndex = tabs.findIndex(t => t.id === activeIntakeTab);
                  if (currentIndex < tabs.length - 1) setActiveIntakeTab(tabs[currentIndex + 1].id);
                }}
                className="px-5 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium shadow-organic-sm hover:bg-primary/90 hover:-translate-y-0.5 transition-all"
              >
                Next
              </button>
            )}
          </div>
        </div>

      </form>
    </FormProvider>
  );
}
