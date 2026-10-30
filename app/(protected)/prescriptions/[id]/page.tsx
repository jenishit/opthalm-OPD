"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Check, Download, Printer, Sparkles } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { Card } from "@/components/shadcn/card";
import { Badge } from "@/components/shadcn/badge";
import SectionHeading from "../../dashboard/_components/SectionHeading";
import { OpthalmOKLogo } from "@/app/(auth)/_components/OpthalmOKLogo";
import { usePrescriptionStore } from "../_components/store";
import { LENS_TYPE_LABEL, type LensType, type PrescriptionRecord, type RxEye } from "../_components/types";
import { getPatients } from "@/services/patients-services";
import type { Patient } from "@/schemas/patient-schema";
import { useAuthStore } from "@/stores/authStore";

const LENS_TYPES: LensType[] = ["single_vision", "bifocal", "progressive", "contact_lens", "none"];
const VALID_MONTHS = [6, 12, 24];

function newRecord(id: string, signedBy: string): PrescriptionRecord {
  return {
    id,
    prescriptionNumber: `RX-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`,
    patientId: "",
    patientName: "",
    issuedAt: new Date().toISOString().slice(0, 10),
    lensType: "single_vision",
    pd: null,
    validMonths: 12,
    notes: "",
    od: { sph: null, cyl: null, axis: null, add: null },
    os: { sph: null, cyl: null, axis: null, add: null },
    signedBy,
    status: "draft",
  };
}

function fmtSigned(v: number | null) {
  if (v == null) return "";
  return (v > 0 ? "+" : "") + v.toFixed(2);
}

const field = "w-full rounded-md border border-line bg-card px-3 py-2 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-ring/40";

export default function PrescriptionDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const isNew = params.id === "new";
  const staffUser = useAuthStore((s) => s.staffUser);
  const prescriptions = usePrescriptionStore((s) => s.prescriptions);
  const upsert = usePrescriptionStore((s) => s.upsert);
  const existing = prescriptions.find((p) => p.id === params.id);

  const [rx, setRx] = useState<PrescriptionRecord>(
    () => existing ?? newRecord(isNew ? `rx${Date.now()}` : params.id, staffUser?.name ?? "Staff")
  );
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => {
    if (!isNew) return;
    getPatients()
      .then(setPatients)
      .catch(() => toast.error("Could not load patients"));
  }, [isNew]);

  if (!existing && !isNew) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-muted-foreground">Prescription not found.</p>
        <Button variant="secondary" onClick={() => router.push("/prescriptions")}>
          <ArrowLeft className="size-4" />
          Back to prescriptions
        </Button>
      </div>
    );
  }

  const setEye = (eye: "od" | "os", key: keyof RxEye, value: number | null) =>
    setRx((r) => ({ ...r, [eye]: { ...r[eye], [key]: value } }));

  const selectPatient = (id: string) => {
    const p = patients.find((x) => x.id === id);
    if (!p) return;
    setRx((r) => ({ ...r, patientId: p.id, patientName: `${p.first_name} ${p.last_name}` }));
  };

  const save = () => {
    if (!rx.patientName) {
      toast.warning("Select a patient first");
      return;
    }
    upsert({ ...rx, status: "issued" });
    toast.success("Prescription saved and attached to patient record");
    if (isNew) router.replace(`/prescriptions/${rx.id}`);
  };

  const validUntil = (() => {
    const d = new Date(rx.issuedAt);
    d.setMonth(d.getMonth() + rx.validMonths);
    return d;
  })();

  const numInput = (eye: "od" | "os", key: keyof RxEye, step: number, label: string) => (
    <input
      aria-label={label}
      type="number"
      step={step}
      value={rx[eye][key] ?? ""}
      onChange={(e) => setEye(eye, key, e.target.value === "" ? null : Number(e.target.value))}
      className={`${field} text-center`}
    />
  );

  return (
    <>
      <SectionHeading
        eyebrow="REFRACTION & OPTICAL CARE"
        title={isNew ? "New prescription" : rx.patientName}
        description="Accurate, readable prescriptions connected to the patient record and optical order."
        actions={
          <Button variant="ghost" asChild>
            <Link href="/prescriptions">
              <ArrowLeft className="size-4" />
              All prescriptions
            </Link>
          </Button>
        }
      />

      <div className="grid xl:grid-cols-[1.1fr_0.9fr] gap-4 items-start">
        {/* Editor */}
        <Card className="p-5 flex flex-col gap-4 print:hidden">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-lg font-semibold">Prescription details</h3>
              <p className="text-sm text-muted-foreground">Patient and examination information</p>
            </div>
            <Badge variant={rx.status === "issued" ? "default" : "secondary"}>
              {rx.status === "issued" ? "Issued" : "Draft"}
            </Badge>
          </div>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-ink">
            Patient
            {isNew ? (
              <select
                value={rx.patientId}
                onChange={(e) => selectPatient(e.target.value)}
                className={field}
              >
                <option value="" disabled>
                  Select a patient…
                </option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.first_name} {p.last_name}
                  </option>
                ))}
              </select>
            ) : (
              <div className={`${field} bg-app text-mute`}>{rx.patientName}</div>
            )}
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5 text-sm font-medium text-ink">
              Prescription date
              <input
                type="date"
                value={rx.issuedAt}
                onChange={(e) => setRx((r) => ({ ...r, issuedAt: e.target.value }))}
                className={field}
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-ink">
              Lens type
              <select
                value={rx.lensType}
                onChange={(e) => setRx((r) => ({ ...r, lensType: e.target.value as LensType }))}
                className={field}
              >
                {LENS_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {LENS_TYPE_LABEL[t]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="rounded-md border border-line overflow-hidden">
            <div className="grid grid-cols-[1.2fr_repeat(4,1fr)] bg-app text-[11px] font-semibold uppercase tracking-[0.14em] text-mute">
              <span className="px-3 py-2">Eye</span>
              <span className="px-3 py-2 text-center">SPH</span>
              <span className="px-3 py-2 text-center">CYL</span>
              <span className="px-3 py-2 text-center">Axis</span>
              <span className="px-3 py-2 text-center">ADD</span>
            </div>
            {(["od", "os"] as const).map((eye) => (
              <div key={eye} className="grid grid-cols-[1.2fr_repeat(4,1fr)] gap-1.5 items-center border-t border-line p-1.5">
                <b className="px-1.5 text-sm">{eye === "od" ? "Right (OD)" : "Left (OS)"}</b>
                {numInput(eye, "sph", 0.25, `Sphere ${eye}`)}
                {numInput(eye, "cyl", 0.25, `Cylinder ${eye}`)}
                {numInput(eye, "axis", 1, `Axis ${eye}`)}
                {numInput(eye, "add", 0.25, `Add ${eye}`)}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5 text-sm font-medium text-ink">
              Pupillary distance (PD)
              <input
                type="number"
                value={rx.pd ?? ""}
                onChange={(e) => setRx((r) => ({ ...r, pd: e.target.value === "" ? null : Number(e.target.value) }))}
                placeholder="mm"
                className={field}
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-ink">
              Prescription valid for
              <select
                value={rx.validMonths}
                onChange={(e) => setRx((r) => ({ ...r, validMonths: Number(e.target.value) }))}
                className={field}
              >
                {VALID_MONTHS.map((m) => (
                  <option key={m} value={m}>
                    {m} months
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-ink">
            Notes
            <textarea
              value={rx.notes}
              onChange={(e) => setRx((r) => ({ ...r, notes: e.target.value }))}
              rows={3}
              className={field}
            />
          </label>

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="secondary" onClick={() => toast.info("Prescription print preview opened")}>
              <Printer className="size-4" />
              Print preview
            </Button>
            <Button onClick={save}>
              <Check className="size-4" />
              Save prescription
            </Button>
          </div>
        </Card>

        {/* Preview */}
        <div className="flex flex-col gap-4">
          <Card className="p-0 overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-line print:hidden">
              <div>
                <h3 className="font-display text-base font-semibold">Prescription preview</h3>
                <p className="text-xs text-muted-foreground">Patient-ready document</p>
              </div>
              <button
                onClick={() => toast.info("PDF export prepared")}
                aria-label="Export PDF"
                className="grid size-8 place-items-center rounded-md border border-line text-muted-foreground hover:border-sage hover:text-foreground"
              >
                <Download className="size-4" />
              </button>
            </div>
            <div className="m-4 rounded-md border border-line bg-white p-6 text-[#1d2420]">
              <OpthalmOKLogo variant="light" width={44} />
              <div className="my-4 h-0.5 bg-[#214c3a]" />
              <h3 className="font-display text-lg font-semibold mb-3">Spectacle prescription</h3>
              <div className="flex flex-col gap-0.5 mb-4 text-sm">
                <b>{rx.patientName || "—"}</b>
                <span className="text-[#81877d]">Patient ID: {rx.patientId || "—"}</span>
                <span className="text-[#81877d]">
                  Issued: {new Date(rx.issuedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                </span>
              </div>
              <div className="rounded-md border border-[#e9e6dc] overflow-hidden">
                <div className="grid grid-cols-5 text-center bg-[#f8f7f1] text-[#8e9488] text-[11px] font-semibold">
                  <span className="py-2"></span>
                  <span className="py-2">SPH</span>
                  <span className="py-2">CYL</span>
                  <span className="py-2">AXIS</span>
                  <span className="py-2">ADD</span>
                </div>
                {(["od", "os"] as const).map((eye) => (
                  <div key={eye} className="grid grid-cols-5 text-center text-sm border-t border-[#eeece4]">
                    <b className="py-2 text-left pl-3">{eye.toUpperCase()}</b>
                    <span className="py-2">{fmtSigned(rx[eye].sph) || "—"}</span>
                    <span className="py-2">{fmtSigned(rx[eye].cyl) || "—"}</span>
                    <span className="py-2">{rx[eye].axis != null ? `${rx[eye].axis}°` : "—"}</span>
                    <span className="py-2">{fmtSigned(rx[eye].add) || "—"}</span>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-y-2 gap-x-3 my-4 text-xs">
                <span className="text-[#93988f]">Lens type</span>
                <b>{LENS_TYPE_LABEL[rx.lensType]}</b>
                <span className="text-[#93988f]">PD</span>
                <b>{rx.pd != null ? `${rx.pd} mm` : "—"}</b>
                <span className="text-[#93988f]">Valid until</span>
                <b>{validUntil.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</b>
              </div>
              {rx.notes && <p className="text-xs text-[#7f8c7d] mb-4">{rx.notes}</p>}
              <div className="mt-6">
                <div className="w-32 h-px bg-[#bfc7bc] mb-1.5" />
                <span className="text-xs text-[#7d857a]">{rx.signedBy} · Optometrist</span>
              </div>
              <p className="mt-4 pt-3 border-t border-[#efede6] text-[10px] text-[#969b90]">
                Please bring this prescription to your optical provider.
              </p>
            </div>
          </Card>

          <Card className="p-4 flex items-start gap-3 print:hidden">
            <Sparkles className="size-4.5 text-sage shrink-0 mt-0.5" />
            <div>
              <b className="block text-sm font-semibold">Connected workflow</b>
              <p className="text-sm text-mute mt-1">
                Saving this prescription makes it available to the optical team for lens selection, quotation, and
                spectacle order creation.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
