"use client";

import React, { useEffect, useState } from "react";
import { useForm, FormProvider, type SubmitErrorHandler } from "react-hook-form";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileText,
  FlaskConical,
  Glasses,
  MessageSquare,
  Pill,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";
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

const tabs: { id: IntakeTab; label: string; icon: LucideIcon }[] = [
  { id: "chief-complaint", label: "History & C/C", icon: MessageSquare },
  { id: "symptoms", label: "Symptoms", icon: ClipboardList },
  { id: "refraction", label: "Vision/Rx", icon: Glasses },
  { id: "examination", label: "Examination", icon: Stethoscope },
  { id: "investigations", label: "Investigations", icon: FlaskConical },
  { id: "diagnosis", label: "Diagnosis", icon: FileText },
  { id: "treatment", label: "Treatment", icon: Pill },
];

export function IntakeExamForm({ patientId }: { patientId: string }) {
  const router = useRouter();
  const { activeIntakeTab, setActiveIntakeTab } = useUiStore();
  const { staffUser } = useAuthStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [visited, setVisited] = useState<IntakeTab[]>(["chief-complaint"]);

  const goToTab = (tab: IntakeTab) => {
    setActiveIntakeTab(tab);
    setVisited((current) => (current.includes(tab) ? current : [...current, tab]));
  };

  const methods = useForm<z.input<typeof intakeExamFormSchema>, unknown, IntakeExamFormData>({
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
    } catch (error: unknown) {
      setSubmitError(error instanceof Error ? error.message : "Failed to save visit data");

      // Look for first error to switch tab if validation failed (though resolver handles most of it before onSubmit)
      const errors = methods.formState.errors;
      if (Object.keys(errors).length > 0) {
        if (errors.chief_complaint || errors.history) goToTab("chief-complaint");
        else if (errors.symptoms) goToTab("symptoms");
        else if (errors.readings) goToTab("refraction");
        else if (errors.examination) goToTab("examination");
        else if (errors.diagnoses) goToTab("diagnosis");
        else if (errors.treatments || errors.follow_up) goToTab("treatment");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle errors that prevent onSubmit from being called
  const onError: SubmitErrorHandler<z.input<typeof intakeExamFormSchema>> = (errors) => {
    if (errors.chief_complaint || errors.history) goToTab("chief-complaint");
    else if (errors.symptoms) goToTab("symptoms");
    else if (errors.readings) goToTab("refraction");
    else if (errors.examination) goToTab("examination");
    else if (errors.diagnoses) goToTab("diagnosis");
    else if (errors.treatments || errors.follow_up) goToTab("treatment");
  };

  if (loadingInitial) {
    return <div className="p-8 text-center text-muted-foreground">Loading form context...</div>;
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit, onError)} className="flex flex-col h-full overflow-hidden">

        {/* Step rail — reference consult tabs, in our type and colour system */}
        <div className="shrink-0 border-b border-border/60 bg-muted/40 px-4 py-3">
          <nav className="flex flex-wrap items-center gap-2" aria-label="Visit sections">
            {tabs.map((tab, index) => {
              const isActive = activeIntakeTab === tab.id;
              const isDone = visited.includes(tab.id) && !isActive;
              const Icon = isDone ? Check : tab.icon;

              let hasError = false;
              const errors = methods.formState.errors;
              if (tab.id === "chief-complaint" && (errors.chief_complaint || errors.history)) hasError = true;
              if (tab.id === "symptoms" && errors.symptoms) hasError = true;
              if (tab.id === "refraction" && errors.readings) hasError = true;
              if (tab.id === "examination" && errors.examination) hasError = true;
              if (tab.id === "diagnosis" && errors.diagnoses) hasError = true;
              if (tab.id === "treatment" && (errors.treatments || errors.follow_up)) hasError = true;

              return (
                <React.Fragment key={tab.id}>
                  <button
                    type="button"
                    onClick={() => goToTab(tab.id)}
                    aria-current={isActive ? "step" : undefined}
                    className={`relative inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors ${
                      isActive
                        ? "border-primary bg-primary text-primary-foreground "
                        : isDone
                          ? "border-primary/20 bg-primary/10 text-primary"
                          : "border-border/60 bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    }`}
                  >
                    <Icon className="size-3.5" />
                    {tab.label}
                    {hasError ? (
                      <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-destructive ring-2 ring-background" />
                    ) : null}
                  </button>
                  {index < tabs.length - 1 ? (
                    <span
                      aria-hidden
                      className={`h-px w-3 border-t-2 ${isDone ? "border-primary/40" : "border-border"}`}
                    />
                  ) : null}
                </React.Fragment>
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
          <div className="bg-clay-soft text-clay border-b border-clay/20 px-4 py-2 text-xs shrink-0 font-medium">
            Please correct the errors in the form before submitting.
          </div>
        )}

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto bg-background p-4 md:p-6">
          <div className="mx-auto max-w-5xl space-y-6">
            <div className={activeIntakeTab === "chief-complaint" ? "block" : "hidden"}><ChiefComplaintSection /></div>
            <div className={activeIntakeTab === "symptoms" ? "block" : "hidden"}><SymptomsSection /></div>
            <div className={activeIntakeTab === "refraction" ? "block" : "hidden"}><RefractionSection /></div>
            <div className={activeIntakeTab === "examination" ? "block" : "hidden"}><ExaminationSection /></div>
            <div className={activeIntakeTab === "investigations" ? "block" : "hidden"}><InvestigationsSection /></div>
            <div className={activeIntakeTab === "diagnosis" ? "block" : "hidden"}><DiagnosisSection /></div>
            <div className={activeIntakeTab === "treatment" ? "block" : "hidden"}><TreatmentSection /></div>
          </div>
        </div>

        {/* Sticky action bar — reference consult footer */}
        <div className="shrink-0 border-t border-line bg-card p-3">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {tabs.find((t) => t.id === activeIntakeTab)?.label}
              </p>
              <p className="truncate font-display text-sm font-medium text-foreground">
                Examining doctor: {methods.watch("examined_by") || "Unassigned"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const currentIndex = tabs.findIndex((t) => t.id === activeIntakeTab);
                  if (currentIndex > 0) goToTab(tabs[currentIndex - 1].id);
                }}
                disabled={activeIntakeTab === tabs[0].id}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-40"
              >
                <ChevronLeft className="size-4" />
                Previous
              </button>

              {activeIntakeTab === tabs[tabs.length - 1].id ? (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary-hover disabled:pointer-events-none disabled:opacity-50"
                >
                  <Check className="size-4" />
                  {isSubmitting ? "Saving..." : "Save Complete Visit"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const currentIndex = tabs.findIndex((t) => t.id === activeIntakeTab);
                    if (currentIndex < tabs.length - 1) goToTab(tabs[currentIndex + 1].id);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary-hover "
                >
                  Next
                  <ChevronRight className="size-4" />
                </button>
              )}
            </div>
          </div>
        </div>

      </form>
    </FormProvider>
  );
}
