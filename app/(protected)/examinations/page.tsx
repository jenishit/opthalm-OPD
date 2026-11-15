"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { Card } from "@/components/shadcn/card";
import SectionHeading from "../dashboard/_components/SectionHeading";
import { ExamChart } from "./_components/ExamChart";
import EyeMap from "./_components/EyeMap";
import { BLANK } from "./_components/exam-defaults";
import { useExamQueue } from "./_components/useExamQueue";
import { examToIntakeData } from "./_components/examToIntake";
import type { ExamState } from "./_components/types";
import type { TabId } from "./_components/constants";
import { QueuePanel } from "./_components/QueuePanel";
import { ExamHeader } from "./_components/ExamHeader";
import { ExamTabs, TabStepper } from "./_components/ExamTabs";
import { VisualAcuityTab } from "./_components/VisualAcuityTab";
import { FindingsTab } from "./_components/FindingsTab";
import { InvestigationsTab } from "./_components/InvestigationsTab";
import { ExamActions } from "./_components/ExamActions";
import { ExamReportPaper } from "./_components/ExamReportPaper";
import { useAsync } from "@/lib/hooks/use-async";
import { loadSellerInfo } from "@/lib/pos/seller";
import type { ExamPatient } from "./_components/types";
import { FollowUpDialog } from "./_components/FollowUpDialog";
import { setIn, fmtDate, addDays, today0, iso } from "@/lib/utils";
import { loadSchedule } from "@/services/queue-services";
import { apptTypeComplaint } from "../appointments/_components/appointment-type";
import { toScheduledAt } from "@/lib/clinic-time";
import { firstFreeSlot } from "../appointments/_components/schedule-stats";
import type { ANAT } from "@/types/eye-types";
import { useAuthStore } from "@/stores/authStore";
import { createVisit, getFullVisitData, saveClinicalData, updateVisitStatus } from "@/services/visits-services";
import { examFromVisit } from "./_components/examFromVisit";
import { ApiError } from "@/services/http";

type AnatId = keyof typeof ANAT;

export default function ExaminationsPage() {
  const router = useRouter();
  const staffUser = useAuthStore((s) => s.staffUser);
  const { patients, loading: queueLoading, refresh: refreshQueue } = useExamQueue();
  const [selId, setSelId] = useState<string | null>(null);
  const [exams, setExams] = useState<Record<string, ExamState>>({});
  const [tab, setTab] = useState<TabId>("va");
  const [eye, setEye] = useState<"od" | "os">("od");
  // A snapshot of what is being printed, so clearing the selection afterwards can't blank the paper.
  const [printJob, setPrintJob] = useState<{ p: ExamPatient; ex: ExamState; examiner: string; at: Date } | null>(null);
  const clinic = useAsync(loadSellerInfo);
  const [fuOpen, setFuOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  // Patients whose saved examination has been fetched (or is being fetched) — each is loaded once.
  const fetched = useRef(new Set<string>());
  const [loadingSaved, setLoadingSaved] = useState<string | null>(null);

  // Print the saved record once its paper is in the DOM; when the print dialog closes
  // (printed or cancelled), return to the queue with no patient selected.
  useEffect(() => {
    if (!printJob) return;
    const done = () => {
      const { p: printed } = printJob;
      setPrintJob(null);
      setSelId(null);
      setTab("va");
      toast.success(`Examination saved · ${printed.name}`, {
        action: { label: "View record", onClick: () => router.push(`/patients/${printed.id}`) },
      });
    };
    window.addEventListener("afterprint", done, { once: true });
    // Clear any on-screen toast so it can't end up on the printout.
    toast.dismiss();
    const t = setTimeout(() => window.print(), 150);
    return () => {
      clearTimeout(t);
      window.removeEventListener("afterprint", done);
    };
  }, [printJob, router]);

  const selectedId = selId;
  const selectedVisitId = patients.find((x) => x.id === selId)?.visitId;
  // Reopening a patient: show what was already recorded on their visit instead of a blank chart.
  useEffect(() => {
    const seen = fetched.current;
    if (!selectedId || !selectedVisitId || seen.has(selectedId)) return;
    seen.add(selectedId);
    let active = true;
    let done = false;
    (async () => {
      setLoadingSaved(selectedId);
      try {
        const full = await getFullVisitData(selectedVisitId);
        const saved = full ? examFromVisit(full) : null;
        // Never overwrite something the examiner has already started typing.
        if (active && saved) setExams((all) => (all[selectedId] ? all : { ...all, [selectedId]: saved }));
      } catch (error) {
        seen.delete(selectedId);
        console.error("Couldn't load the saved examination", error);
        toast.error("Couldn't load this patient's saved examination.");
      } finally {
        done = true;
        setLoadingSaved((cur) => (cur === selectedId ? null : cur));
      }
    })();
    return () => {
      active = false;
      // Switched patients mid-fetch: allow a fresh load next time this one is selected.
      if (!done) seen.delete(selectedId);
    };
  }, [selectedId, selectedVisitId]);

  if (patients.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <SectionHeading
          eyebrow="CLINICAL WORKSPACE"
          title="Eye examinations"
          description="Record clinical findings with structured measurements and a patient-first workflow."
        />
        <Card className="p-10 text-center text-sm text-mute">
          {queueLoading ? "Loading today's queue…" : "No patients in today's queue yet."}
        </Card>
      </div>
    );
  }

  // No patient is selected until the examiner picks one from the queue.
  const p = patients.find((x) => x.id === selId) ?? null;
  const ex = (p && exams[p.id]) || BLANK;
  const set = (path: Array<string | number>, v: unknown) => {
    if (!p) return;
    setExams((all) => ({ ...all, [p.id]: setIn(all[p.id] ?? BLANK, path, v) }));
  };

  const toggleMark = (id: AnatId) => {
    const current = ex.marks[eye];
    set(
      ["marks", eye],
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
    );
  };

  const startExamination = () => {
    if (!p) return;
    set(["saved"], false);
    toast.success(`Examination started for ${p.name}`);
  };

  const bookFollowUp = async () => {
    if (!p || ex.fu == null) return;
    setSaving(true);
    try {
      const dateIso = iso(addDays(today0(), ex.fu));
      const items = await loadSchedule(dateIso, dateIso);
      const time = firstFreeSlot(items, dateIso);
      if (!time) {
        toast.warning("That day is fully booked — pick another follow-up interval.");
        return;
      }
      await createVisit({
        patient_id: p.id,
        examine_by: staffUser?.id ?? "",
        status: "scheduled",
        scheduled_at: toScheduledAt(dateIso, time),
        visit_date: dateIso,
        chief_complaint: apptTypeComplaint("fu"),
      });
      setFuOpen(false);
      toast.success(`Follow-up booked · ${fmtDate(addDays(today0(), ex.fu), { weekday: "short", day: "numeric", month: "short" })} at ${time}`, {
        action: { label: "View appointments", onClick: () => router.push("/appointments") },
      });
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Couldn't book the follow-up");
    } finally {
      setSaving(false);
    }
  };

  /** Persists the chart to the patient's real visit, when this patient came from the real queue. */
  const persistExam = async (): Promise<void> => {
    if (!p) throw new Error("Select a patient first.");
    if (!p.visitId) throw new Error("This patient has no active visit to save the examination to.");
    const data = examToIntakeData(ex, p, staffUser?.name ?? "Staff");
    // Partial save: treatments and intake-form investigations already on the visit are left untouched.
    await saveClinicalData(p.visitId, data, { partial: true });
    await updateVisitStatus(p.visitId, "completed");
  };

  const saveDigital = async () => {
    if (!p) return;
    setSaving(true);
    try {
      await persistExam();
      set(["saved"], true);
      refreshQueue();
      toast.success(`Saved to ${p.name}'s record`, {
        action: { label: "View on profile", onClick: () => router.push(`/patients/${p.id}`) },
      });
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Failed to save examination");
    } finally {
      setSaving(false);
    }
  };

  const issuePrescription = async () => {
    if (!p) return;
    if (ex.mr.od.s == null && ex.mr.os.s == null) {
      toast.warning("Enter a manifest refraction first");
      return;
    }
    setSaving(true);
    try {
      // The final refraction saved on the visit IS the prescription — it appears
      // on the Prescriptions page straight away (no separate document exists).
      await persistExam();
      set(["issued"], true);
      refreshQueue();
      toast.success(`Prescription issued for ${p.name}`, {
        action: { label: "View prescriptions", onClick: () => router.push("/prescriptions") },
      });
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Failed to issue prescription");
    } finally {
      setSaving(false);
    }
  };

  /** Saves the examination to the visit, then prints the whole record. The print flow then clears the selection. */
  const savePrint = async () => {
    if (!p || saving) return;
    setSaving(true);
    try {
      await persistExam();
      set(["saved"], true);
      refreshQueue();
      setPrintJob({ p, ex, examiner: staffUser?.name ?? "Examiner", at: new Date() });
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : error instanceof Error ? error.message : "Failed to save examination");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4 print:hidden">
        <SectionHeading
          eyebrow="CLINICAL WORKSPACE"
          title="Eye examinations"
          description="Record clinical findings with structured measurements and a patient-first workflow."
          actions={
            <Button onClick={startExamination} disabled={!p}>
              <Plus className="size-4" />
              Start examination
            </Button>
          }
        />

        <div className="grid items-start gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
          <QueuePanel patients={patients} selectedId={p?.id ?? null} onSelect={setSelId} />

          {p ? (
            <div className="flex min-w-0 flex-col gap-3">
              <ExamHeader p={p} />
              {/* Sticky: outside the Card, which clips overflow and would stop it sticking. */}
              <ExamTabs tab={tab} onChange={setTab} patientName={p.name} />
              <Card className="flex flex-col gap-4 p-4">
                {tab === "va" && <VisualAcuityTab ex={ex} eye={eye} onEyeChange={setEye} set={set} />}
                {tab === "chart" && <ExamChart ex={ex} set={set} />}
                {tab === "map" && <EyeMap eye={eye} onEyeChange={setEye} marks={ex.marks[eye]} toggleMark={toggleMark} />}
                {tab === "investigations" && <InvestigationsTab ex={ex} set={set} />}
                {tab === "findings" && <FindingsTab ex={ex} set={set} />}
                <TabStepper tab={tab} onChange={setTab} />
              </Card>
            </div>
          ) : (
            <Card className="grid place-items-center p-12 text-center">
              <div className="max-w-sm">
                <h2 className="font-display text-lg font-semibold text-foreground">No patient selected</h2>
                <p className="mt-1.5 text-sm text-muted-foreground">Choose a patient from today&apos;s queue to start or continue their examination.</p>
              </div>
            </Card>
          )}
        </div>

        {p && (
          <ExamActions
            ex={ex}
            saving={saving || loadingSaved === p.id}
            onPrint={savePrint}
            onSave={saveDigital}
            onFollowUp={() => setFuOpen(true)}
            onIssue={issuePrescription}
          />
        )}
        <FollowUpDialog open={fuOpen && !!p} onOpenChange={setFuOpen} ex={ex} set={set} onBook={bookFollowUp} />
      </div>

      {/* Print-only: the complete examination record. Everything else on the page hides. */}
      <div className="hidden print:block">
        {printJob && <ExamReportPaper p={printJob.p} ex={printJob.ex} examiner={printJob.examiner} clinic={clinic.data?.info ?? null} at={printJob.at} />}
      </div>
    </>
  );
}
