"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  CalendarDays,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Trash2,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { Avatar, AvatarFallback } from "@/components/shadcn/avatar";
import { Dialog, DialogContent, DialogTitle } from "@/components/shadcn/dialog";
import { Chip } from "@/components/ui/ChartUi";
import {
  cn,
  addDays,
  mondayOf,
  today0,
  fmtDate,
  iso,
  uid,
  avatarAccent,
  DAYS,
} from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import {
  createVisitDto,
  updateVisitComplaint,
  updateVisitDate,
  updateVisitStatus,
} from "@/services/visits-services";
import type { QueueItem } from "@/services/queue-services";
import type { Patient } from "@/schemas/patient-schema";
import { useWeekQueue } from "./useWeekQueue";
import {
  TY,
  type ApptType,
  apptTypeComplaint,
  inferApptType,
} from "./appointment-type";

const HOURS = [9, 10, 11, 12, 13, 14, 15, 16];
const clampHour = (h: number) => Math.min(16, Math.max(9, h));

function PatientAvatar({
  patient,
  size = "sm",
}: {
  patient: Patient;
  size?: "sm" | "default" | "lg";
}) {
  const { hue, initials } = avatarAccent(
    `${patient.first_name} ${patient.last_name}`,
  );
  return (
    <Avatar size={size}>
      <AvatarFallback
        className="font-display font-semibold"
        style={{ background: `hsl(${hue} 28% 82%)`, color: "#2C3531" }}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}

type ModalState =
  | { kind: "edit"; visitId: string }
  | { kind: "new"; day: Date; hour: number }
  | null;

export function WeekView() {
  const staffUser = useAuthStore((s) => s.staffUser);
  const [wk, setWk] = useState(0);
  const [modal, setModal] = useState<ModalState>(null);
  const [ntype, setNtype] = useState<ApptType>("new");
  const [over, setOver] = useState<string | null>(null);
  const [hourOverride, setHourOverride] = useState<Record<string, number>>({});
  const [boardItems, setBoardItems] = useState<QueueItem[]>([]);

  const mon = addDays(mondayOf(today0()), wk * 7);
  const days = [...Array(7)].map((_, i) => addDays(mon, i));
  const td = iso(today0());

  const { items, patients, loading, usingMock } = useWeekQueue(mon);

  useEffect(() => {
    setBoardItems(items);
  }, [items]);

  const displayHour = (item: QueueItem) =>
    hourOverride[item.visit.id] ??
    clampHour(
      item.visit.created_at ? new Date(item.visit.created_at).getHours() : 9,
    );

  const at = (d: Date, h: number) =>
    boardItems.find(
      (i) => i.visit.visit_date === iso(d) && displayHour(i) === h,
    );

  function bookPatient(
    patientId: string,
    day: Date,
    hour: number,
    type: ApptType,
  ) {
    const patient = patients.find((p) => p.id === patientId);
    if (!patient) return;
    const localId = `local-${uid()}`;
    const complaint = apptTypeComplaint(type);
    const optimistic: QueueItem = {
      patient,
      visit: {
        id: localId,
        patient_id: patientId,
        status: "scheduled",
        visit_date: iso(day),
        chief_complaint: complaint,
        created_at: new Date().toISOString(),
      },
    };
    setBoardItems((list) => [...list, optimistic]);
    setHourOverride((m) => ({ ...m, [localId]: hour }));
    toast.success(
      `Booked · ${fmtDate(day, { weekday: "short", day: "numeric", month: "short" })}, ${hour}:00`,
    );

    createVisitDto({
      patient_id: patientId,
      examine_by: staffUser?.id ?? "",
      status: "scheduled",
      visit_date: iso(day),
      chief_complaint: complaint,
    })
      .then((created) => {
        setBoardItems((list) =>
          list.map((it) =>
            it.visit.id === localId
              ? { ...it, visit: { ...it.visit, id: created.id } }
              : it,
          ),
        );
        setHourOverride(({ [localId]: h, ...rest }) =>
          h != null ? { ...rest, [created.id]: h } : rest,
        );
      })
      .catch((error) => {
        // No dedicated scheduling endpoint to retry against yet — the booking
        // stays visible locally for this session even if the sync failed.
        console.error("Failed to persist booked appointment", error);
      });
  }

  function moveAppt(visitId: string, day: Date, hour: number) {
    setBoardItems((list) =>
      list.map((it) =>
        it.visit.id === visitId
          ? { ...it, visit: { ...it.visit, visit_date: iso(day) } }
          : it,
      ),
    );
    setHourOverride((m) => ({ ...m, [visitId]: hour }));
    toast.success("Appointment moved");
    if (!visitId.startsWith("local-")) {
      updateVisitDate(visitId, iso(day)).catch((error) =>
        console.error("Failed to persist moved appointment", error),
      );
    }
  }

  function cancelAppt(visitId: string) {
    setBoardItems((list) => list.filter((it) => it.visit.id !== visitId));
    setModal(null);
    toast.success("Appointment cancelled");
    if (!visitId.startsWith("local-")) {
      updateVisitStatus(visitId, "cancelled").catch((error) =>
        console.error("Failed to cancel appointment on server", error),
      );
    }
  }

  function changeType(visitId: string, type: ApptType) {
    const complaint = apptTypeComplaint(type);
    setBoardItems((list) =>
      list.map((it) =>
        it.visit.id === visitId
          ? { ...it, visit: { ...it.visit, chief_complaint: complaint } }
          : it,
      ),
    );
    if (!visitId.startsWith("local-")) {
      updateVisitComplaint(visitId, complaint).catch((error) =>
        console.error("Failed to persist appointment type", error),
      );
    }
  }

  function drop(e: React.DragEvent, d: Date, h: number) {
    e.preventDefault();
    setOver(null);
    let x: { kind: "patient" | "appt"; id: string };
    try {
      x = JSON.parse(e.dataTransfer.getData("text/plain"));
    } catch {
      return;
    }
    const existing = at(d, h);
    if (existing && !(x.kind === "appt" && existing.visit.id === x.id)) {
      toast.warning("That slot is already booked");
      return;
    }
    if (x.kind === "patient") bookPatient(x.id, d, h, "new");
    if (x.kind === "appt") moveAppt(x.id, d, h);
  }

  const cur =
    modal?.kind === "edit"
      ? boardItems.find((i) => i.visit.id === modal.visitId)
      : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          title="Previous week"
          onClick={() => setWk((w) => w - 1)}
          className="grid size-8 place-items-center rounded-md border border-line text-muted-foreground hover:border-sage hover:text-foreground"
        >
          <ChevronLeft size={17} />
        </button>
        <button
          type="button"
          title="Next week"
          onClick={() => setWk((w) => w + 1)}
          className="grid size-8 place-items-center rounded-md border border-line text-muted-foreground hover:border-sage hover:text-foreground"
        >
          <ChevronRight size={17} />
        </button>
        <Button
          size="sm"
          onClick={() => {
            setWk(0);
            toast.info("Jumped to today");
          }}
        >
          <CalendarDays className="size-4" />
          Today
        </Button>
        <div className="ml-1 font-display text-lg font-semibold text-foreground">
          {fmtDate(days[0])} –{" "}
          {fmtDate(days[6], {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </div>
        <div className="flex-1" />
        {Object.entries(TY).map(([k, v]) => (
          <span key={k} className={cn("pill", v.pillClass)}>
            {v.label}
          </span>
        ))}
      </div>

      {usingMock && (
        <div className="rounded-md bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
          Showing a sample week — no appointments are scheduled yet.
        </div>
      )}

      <div className="grid items-start gap-4 xl:grid-cols-[210px_minmax(0,1fr)]">
        <div className="overflow-x-auto rounded-md border border-line bg-card">
          <div
            className="grid min-w-[860px]"
            style={{ gridTemplateColumns: "56px repeat(7,minmax(104px,1fr))" }}
          >
            <div className="border-b border-line" />
            {days.map((d, i) => (
              <div
                key={i}
                className={cn(
                  "border-b border-l border-line p-2 text-center",
                  iso(d) === td && "bg-sage-soft",
                )}
              >
                <div className="mono-label">{DAYS[i]}</div>
                <div
                  className={cn(
                    "font-display text-xl font-semibold text-foreground",
                    iso(d) === td && "text-sage",
                  )}
                >
                  {d.getDate()}
                </div>
              </div>
            ))}
            {HOURS.map((h) => (
              <React.Fragment key={h}>
                <div className="border-b border-line p-1.5 text-right font-mono text-xs text-muted-foreground">
                  {h}:00
                </div>
                {days.map((d) => {
                  const item = at(d, h);
                  const k = `${iso(d)}-${h}`;
                  return (
                    <div
                      key={k}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setOver(k);
                      }}
                      onDragLeave={() => setOver(null)}
                      onDrop={(e) => drop(e, d, h)}
                      onClick={() =>
                        setModal(
                          item
                            ? { kind: "edit", visitId: item.visit.id }
                            : { kind: "new", day: d, hour: h },
                        )
                      }
                      className={cn(
                        "min-h-[62px] cursor-pointer border-b border-l border-line p-1 hover:bg-app",
                        iso(d) === td && "bg-sage-soft",
                        over === k && "!bg-clay-soft",
                      )}
                    >
                      {item && (
                        <div
                          draggable
                          onDragStart={(e) => {
                            e.stopPropagation();
                            e.dataTransfer.setData(
                              "text/plain",
                              JSON.stringify({
                                kind: "appt",
                                id: item.visit.id,
                              }),
                            );
                          }}
                          className={cn(
                            "h-full rounded px-2 py-1.5 text-xs",
                            TY[inferApptType(item.visit.chief_complaint)]
                              .cardClass,
                          )}
                        >
                          <div className="truncate font-semibold leading-tight">
                            {item.patient.first_name} {item.patient.last_name}
                          </div>
                          <div className="text-muted-foreground">
                            {
                              TY[inferApptType(item.visit.chief_complaint)]
                                .label
                            }
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {!loading && boardItems.length === 0 && !usingMock && (
        <div className="rounded-xl border border-line bg-card p-8 shadow-sm">
          <div className="flex flex-col items-center gap-2 text-center">
            <CalendarRange className="size-6 text-muted-foreground" />
            <div className="text-sm font-semibold text-foreground">
              No appointments this week
            </div>
            <p className="text-xs text-muted-foreground">
              Drag a patient into a slot, or jump back to today.
            </p>
            <Button size="sm" variant="secondary" onClick={() => setWk(0)}>
              Go to today
            </Button>
          </div>
        </div>
      )}

      <Dialog open={!!modal} onOpenChange={(open) => !open && setModal(null)}>
        <DialogContent>
          <DialogTitle>{cur ? "Appointment" : "New appointment"}</DialogTitle>
          {cur ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <PatientAvatar patient={cur.patient} size="lg" />
                <div>
                  <div className="font-display text-lg font-semibold text-foreground">
                    {cur.patient.first_name} {cur.patient.last_name}
                  </div>
                  <div className="font-mono text-sm text-muted-foreground">
                    {fmtDate(new Date(`${cur.visit.visit_date}T00:00`), {
                      weekday: "long",
                      day: "numeric",
                      month: "short",
                    })}{" "}
                    · {displayHour(cur)}:00
                  </div>
                </div>
              </div>
              <div>
                <div className="mono-label mb-1.5">Type</div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(TY).map(([k, v]) => (
                    <Chip
                      key={k}
                      on={inferApptType(cur.visit.chief_complaint) === k}
                      onClick={() => changeType(cur.visit.id, k as ApptType)}
                    >
                      {v.label}
                    </Chip>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {staffUser?.role === "doctor" && (
                  <Button asChild>
                    <Link href="/examinations">
                      <ClipboardList className="size-4" />
                      Open consultation
                    </Link>
                  </Button>
                )}
                <Button variant="ghost" asChild>
                  <Link href={`/patients/${cur.patient.id}`}>
                    <UserRound className="size-4" />
                    Record
                  </Link>
                </Button>
                <div className="flex-1" />
                <Button
                  variant="ghost"
                  onClick={() => cancelAppt(cur.visit.id)}
                >
                  <Trash2 className="size-4" />
                  Cancel visit
                </Button>
              </div>
            </div>
          ) : (
            modal?.kind === "new" && (
              <div className="flex flex-col gap-4">
                <div className="font-mono text-sm text-muted-foreground">
                  {fmtDate(modal.day, {
                    weekday: "long",
                    day: "numeric",
                    month: "short",
                  })}{" "}
                  · {modal.hour}:00
                </div>
                <div>
                  <div className="mono-label mb-1.5">Type</div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(TY).map(([k, v]) => (
                      <Chip
                        key={k}
                        on={ntype === k}
                        onClick={() => setNtype(k as ApptType)}
                      >
                        {v.label}
                      </Chip>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="mono-label mb-1.5">Choose patient</div>
                  <div className="grid max-h-[300px] grid-cols-2 gap-2 overflow-auto">
                    {patients.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          if (modal.kind !== "new") return;
                          bookPatient(p.id, modal.day, modal.hour, ntype);
                          setModal(null);
                        }}
                        className="flex items-center gap-2 rounded-md border border-line p-2 text-left hover:border-sage"
                      >
                        <PatientAvatar patient={p} />
                        <span className="truncate text-sm font-semibold text-foreground">
                          {p.first_name} {p.last_name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
