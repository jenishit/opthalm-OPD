"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Calendar, Check, Plus, Printer, Save, X } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { Card } from "@/components/shadcn/card";
import { Input } from "@/components/shadcn/input";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/shadcn/avatar";
import { Chip, Segmented } from "@/components/ui/ChartUi";
import { Gauge } from "@/components/ui/Gauge";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from "@/components/shadcn/dialog";
import SectionHeading from "../dashboard/_components/SectionHeading";
import { ExamChart } from "./_components/ExamChart";
import EyeMap from "./_components/EyeMap";
import Snellen from "./_components/Snellen";
import { BLANK, FINDINGS } from "./_components/mock-data";
import { useExamQueue } from "./_components/useExamQueue";
import { examToIntakeData } from "./_components/examToIntake";
import type { ExamPatient, ExamState, Urg } from "./_components/types";
import { cn, setIn, fmtDate, addDays, today0, avatarAccent } from "@/lib/utils";
import { COND, ANAT } from "@/types/eye-types";
import { useAuthStore } from "@/stores/authStore";
import { saveClinicalData, updateVisitStatus } from "@/services/visits-services";
import { createPrescription } from "@/services/prescriptions-services";
import { ApiError } from "@/services/http";

type AnatId = keyof typeof ANAT;
type TabId = "va" | "chart" | "map" | "findings";

const TABS: Array<{ id: TabId; label: string }> = [
  { id: "va", label: "Visual acuity" },
  { id: "chart", label: "Exam chart" },
  { id: "map", label: "Eye map" },
  { id: "findings", label: "Findings" },
];

const URG_TONE: Record<Urg, "ok" | "warn" | "bad"> = {
  ok: "ok",
  warn: "warn",
  bad: "bad",
};
const URG_NAME: Record<Urg, string> = {
  ok: "Stable",
  warn: "Monitor",
  bad: "Urgent",
};

const QUEUE_TIMES = ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM"];

const FU_OPTIONS = [
  [7, "1 wk"],
  [14, "2 wk"],
  [30, "1 mo"],
  [90, "3 mo"],
  [180, "6 mo"],
] as const;

function PatientAvatar({
  p,
  size = "default",
}: {
  p: ExamPatient;
  size?: "sm" | "default" | "lg";
}) {
  const { hue, initials } = avatarAccent(p.name);
  return (
    <Avatar size={size}>
      {p.photo && <AvatarImage src={p.photo} alt={p.name} />}
      <AvatarFallback
        className="font-display font-semibold"
        style={{ background: `hsl(${hue} 28% 82%)`, color: "#2C3531" }}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}

export default function ExaminationsPage() {
  const router = useRouter();
  const staffUser = useAuthStore((s) => s.staffUser);
  const { patients, loading: queueLoading, usingMock, refresh: refreshQueue } = useExamQueue();
  const [selId, setSelId] = useState<string | null>(null);
  const [exams, setExams] = useState<Record<string, ExamState>>({});
  const [tab, setTab] = useState<TabId>("va");
  const [eye, setEye] = useState<"od" | "os">("od");
  const [findingDraft, setFindingDraft] = useState("");
  const [reportOpen, setReportOpen] = useState(false);
  const [fuOpen, setFuOpen] = useState(false);
  const [saving, setSaving] = useState(false);

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

  const p = patients.find((x) => x.id === selId) ?? patients[0];
  const ex = exams[p.id] ?? BLANK;
  const set = (path: Array<string | number>, v: unknown) =>
    setExams((all) => ({ ...all, [p.id]: setIn(all[p.id] ?? BLANK, path, v) }));

  const toggleFinding = (id: string) =>
    set(
      ["findings"],
      ex.findings.includes(id)
        ? ex.findings.filter((x) => x !== id)
        : [...ex.findings, id],
    );

  const addCustomFinding = () => {
    const text = findingDraft.trim();
    if (!text) return;
    set(["customFindings"], [...ex.customFindings, text]);
    setFindingDraft("");
  };

  const removeCustomFinding = (text: string) =>
    set(
      ["customFindings"],
      ex.customFindings.filter((x) => x !== text),
    );

  const toggleMark = (id: AnatId) => {
    const current = ex.marks[eye];
    set(
      ["marks", eye],
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
    );
  };

  const lastVisit = p.visits[0];

  const startExamination = () => {
    set(["saved"], false);
    toast.success(`Examination started for ${p.name}`);
  };

  const bookFollowUp = () => {
    if (ex.fu == null) return;
    setFuOpen(false);
    toast.success(
      `Follow-up booked · around ${fmtDate(addDays(today0(), ex.fu), { weekday: "short", day: "numeric", month: "short" })}`,
    );
  };

  /** Persists the chart to the patient's real visit, when this patient came from the real queue. */
  const persistExam = async (): Promise<boolean> => {
    if (!p.visitId) return false;
    const data = examToIntakeData(ex, p, staffUser?.name ?? "Staff");
    await saveClinicalData(p.visitId, data);
    await updateVisitStatus(p.visitId, "completed");
    return true;
  };

  const saveDigital = async () => {
    setSaving(true);
    try {
      const persisted = await persistExam();
      set(["saved"], true);
      refreshQueue();
      if (persisted) {
        toast.success(`Saved to ${p.name}'s record`, {
          action: { label: "View on profile", onClick: () => router.push(`/patients/${p.id}`) },
        });
      } else {
        toast.success(`Saved to ${p.name}'s digital record (sample patient — not persisted)`);
      }
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Failed to save examination");
    } finally {
      setSaving(false);
    }
  };

  const issuePrescription = async () => {
    if (ex.mr.od.s == null && ex.mr.os.s == null) {
      toast.warning("Enter a manifest refraction first");
      return;
    }
    setSaving(true);
    try {
      const persisted = await persistExam();
      if (persisted && p.visitId) {
        await createPrescription(p.visitId, p.id, "spectacle", staffUser?.name ?? "Staff");
      }
      set(["issued"], true);
      refreshQueue();
      if (persisted) {
        toast.success(`Prescription issued for ${p.name}`, {
          action: { label: "View on profile", onClick: () => router.push(`/patients/${p.id}`) },
        });
      } else {
        toast.success(`Prescription issued for ${p.name} (sample patient — not persisted)`);
      }
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Failed to issue prescription");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <SectionHeading
        eyebrow="CLINICAL WORKSPACE"
        title="Eye examinations"
        description="Record clinical findings with structured measurements and a patient-first workflow."
        actions={
          <Button onClick={startExamination}>
            <Plus className="size-4" />
            Start examination
          </Button>
        }
      />

      <div className="grid lg:grid-cols-[260px_minmax(0,1fr)] gap-4 items-start">
        {/* Today's patients */}
        <Card className="p-0 overflow-hidden">
          <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-line">
            <div>
              <h3 className="font-display font-semibold text-base">
                Today&apos;s patients
              </h3>
              <p className="text-xs text-mute">
                {usingMock ? "Sample queue · " : "Examination queue · "}
                {patients.length} patients
              </p>
            </div>
            <span className="grid h-7 min-w-7 place-items-center rounded-md bg-sage-soft px-1.5 text-xs font-bold text-sage">
              {String(patients.length).padStart(2, "0")}
            </span>
          </div>
          <div className="flex flex-col">
            {patients.map((x, i) => (
              <button
                key={x.id}
                type="button"
                onClick={() => setSelId(x.id)}
                className={cn(
                  "flex items-center gap-2.5 border-l-[3px] px-3.5 py-3 border-b border-line/70 last:border-b-0 text-left transition-colors",
                  x.id === p.id
                    ? "border-l-sage bg-sage-soft/50"
                    : "border-l-transparent hover:bg-app",
                )}
              >
                <PatientAvatar p={x} size="sm" />
                <span className="min-w-0 flex-1">
                  <b className="block truncate text-sm font-semibold">
                    {x.name}
                  </b>
                  <small className="block truncate text-xs text-mute">
                    {COND[x.conds[0]]?.name ?? "General"}
                  </small>
                </span>
                <span className="shrink-0 font-mono text-xs text-mute">
                  {QUEUE_TIMES[i] ?? ""}
                </span>
              </button>
            ))}
          </div>
        </Card>

        <div className="flex flex-col gap-3 min-w-0">
          {/* Exam header */}
          <Card className="p-4 flex flex-row flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <PatientAvatar p={p} size="lg" />
              <div className="min-w-0">
                <h2 className="font-display text-xl font-semibold truncate">
                  {p.name}
                </h2>
                <p className="text-sm text-mute truncate">
                  {p.id.slice(0, 8).toUpperCase()} · {p.age} years ·{" "}
                  {p.chiefComplaint ?? COND[lastVisit?.dx ?? ""]?.name ?? "Comprehensive eye examination"}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 shrink-0">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sage-soft px-3 py-1 text-xs font-semibold text-sage">
                <span className="size-1.5 rounded-full bg-sage" />
                In progress
              </span>
              <span className={`pill pill-${URG_TONE[p.urg]}`}>
                {URG_NAME[p.urg]}
              </span>
            </div>
          </Card>

          {/* Tabs + workspace */}
          <Card className="p-4 flex flex-col gap-4">
            <div className="flex items-center gap-5 border-b border-line overflow-hidden">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "relative whitespace-nowrap pb-3 text-sm transition-colors",
                    tab === t.id
                      ? "font-semibold text-sage"
                      : "font-medium text-mute hover:text-ink",
                  )}
                >
                  {t.label}
                  {tab === t.id && (
                    <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-sage" />
                  )}
                </button>
              ))}
            </div>

            {tab === "va" && (
              <div className="flex flex-col gap-5">
                <Segmented
                  value={eye}
                  onChange={setEye}
                  options={[
                    { value: "od", label: "Right eye (OD)" },
                    { value: "os", label: "Left eye (OS)" },
                  ]}
                />
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Visual acuity · tap the letters read
                    </span>
                    <Snellen
                      keys={ex.va[eye]}
                      onChange={(k) => set(["va", eye], k)}
                    />
                  </div>
                  <div>
                    <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Intraocular pressure
                    </span>
                    <Gauge
                      value={ex.iop[eye] ?? 15}
                      onChange={(v) => set(["iop", eye], v)}
                    />
                  </div>
                </div>
              </div>
            )}

            {tab === "chart" && <ExamChart ex={ex} set={set} />}

            {tab === "map" && (
              <EyeMap
                eye={eye}
                onEyeChange={setEye}
                marks={ex.marks[eye]}
                toggleMark={toggleMark}
              />
            )}

            {tab === "findings" && (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-4">
                  <div>
                    <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Findings
                    </span>
                    <div className="flex flex-col gap-1.5">
                      {FINDINGS.map((f) => {
                        const on = ex.findings.includes(f.id);
                        const Icon = f.i;
                        return (
                          <button
                            key={f.id}
                            type="button"
                            role="checkbox"
                            aria-checked={on}
                            onClick={() => toggleFinding(f.id)}
                            className={cn(
                              "flex items-center gap-2.5 p-2 rounded-md border text-left text-sm",
                              on
                                ? "bg-clay-soft border-clay"
                                : "bg-card border-line hover:border-sage",
                            )}
                          >
                            <span
                              className={cn(
                                "w-5 h-5 rounded border grid place-items-center shrink-0",
                                on
                                  ? "bg-clay border-clay text-onacc"
                                  : "border-strong",
                              )}
                            >
                              {on && <Check className="size-3.5" />}
                            </span>
                            <Icon className="size-4 text-mute shrink-0" />
                            <span className="flex-1">{f.n}</span>
                          </button>
                        );
                      })}
                      {ex.customFindings.map((text) => (
                        <div
                          key={text}
                          className="flex items-center gap-2.5 p-2 rounded-md border bg-clay-soft border-clay text-sm"
                        >
                          <span className="w-5 h-5 rounded border grid place-items-center shrink-0 bg-clay border-clay text-onacc">
                            <Check className="size-3.5" />
                          </span>
                          <span className="flex-1">{text}</span>
                          <button
                            type="button"
                            onClick={() => removeCustomFinding(text)}
                            aria-label={`Remove ${text}`}
                            className="text-mute hover:text-clay shrink-0"
                          >
                            <X className="size-3.5" />
                          </button>
                        </div>
                      ))}
                      <div className="flex gap-1.5">
                        <Input
                          value={findingDraft}
                          onChange={(e) => setFindingDraft(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" &&
                            (e.preventDefault(), addCustomFinding())
                          }
                          type="text"
                          placeholder="Others…"
                          className="text-sm"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={addCustomFinding}
                        >
                          <Plus className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div>
                    <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Follow-up in
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {FU_OPTIONS.map(([d, l]) => (
                        <Chip
                          key={d}
                          on={ex.fu === d}
                          onClick={() => set(["fu"], ex.fu === d ? null : d)}
                        >
                          {l}
                        </Chip>
                      ))}
                    </div>
                    {ex.fu != null && (
                      <div className="text-sm text-mute mt-1.5">
                        Around{" "}
                        {fmtDate(addDays(today0(), ex.fu), {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })}
                      </div>
                    )}
                    <Input
                      value={ex.fuNote}
                      onChange={(e) => set(["fuNote"], e.target.value)}
                      type="text"
                      placeholder="Others… (e.g. call if vision drops)"
                      className="text-sm mt-2"
                    />
                  </div>

                  <div>
                    <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Notes (optional)
                    </span>
                    <textarea
                      id="notes"
                      value={ex.notes}
                      onChange={(e) => set(["notes"], e.target.value)}
                      rows={4}
                      placeholder="Only if needed"
                      className="w-full text-sm rounded-md border border-line bg-card px-2.5 py-2 text-ink"
                    />
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      <div className="sticky bottom-3 z-10 bg-card border border-line rounded-md p-3 flex flex-wrap gap-2 justify-center shadow-lg">
        <Button onClick={() => setReportOpen(true)}>
          <Printer className="size-4" />
          Save &amp; Print Report
        </Button>
        <Button variant="ghost" onClick={saveDigital} disabled={saving}>
          <Save className="size-4" />
          {ex.saved ? "Saved ✓" : saving ? "Saving…" : "Save Digital"}
        </Button>
        <Button variant="ghost" onClick={() => setFuOpen(true)}>
          <Calendar className="size-4" />
          Schedule Follow-up
        </Button>
        <Button
          variant={ex.issued ? "secondary" : "warm"}
          onClick={issuePrescription}
          disabled={saving}
        >
          {ex.issued ? "Rx issued ✓" : saving ? "Saving…" : "Issue Prescription"}
        </Button>
      </div>

      {/* Report preview */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogTitle>Report preview</DialogTitle>
          <div className="flex flex-col gap-3 text-sm">
            <div className="rounded-md border border-line bg-app p-3">
              <div className="font-display font-semibold text-base">
                {p.name}
              </div>
              <div className="text-mute font-mono text-xs">{p.id}</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(["od", "os"] as const).map((e) => (
                <div key={e} className="rounded-md border border-line p-2.5">
                  <div className="mono-label mb-1">{e.toUpperCase()}</div>
                  <div className="font-mono">
                    Sph {ex.mr[e].s ?? "—"} · Cyl {ex.mr[e].c ?? "—"} ×{" "}
                    {ex.mr[e].a ?? "—"}°
                  </div>
                  <div className="text-mute text-xs mt-1">
                    IOP {ex.iop[e] ?? "—"} mmHg
                  </div>
                </div>
              ))}
            </div>
            {ex.notes && <p className="text-mute">{ex.notes}</p>}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setReportOpen(false)}>
              <X className="size-4" />
              Close
            </Button>
            <Button onClick={() => window.print()}>
              <Printer className="size-4" />
              Print
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Follow-up scheduling */}
      <Dialog open={fuOpen} onOpenChange={setFuOpen}>
        <DialogContent>
          <DialogTitle>Schedule follow-up</DialogTitle>
          <div className="flex flex-wrap gap-2 mb-2">
            {FU_OPTIONS.map(([d, l]) => (
              <Chip key={d} on={ex.fu === d} onClick={() => set(["fu"], d)}>
                {l}
              </Chip>
            ))}
          </div>
          <Button disabled={ex.fu == null} onClick={bookFollowUp}>
            <Calendar className="size-4" />
            Book first free slot
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
