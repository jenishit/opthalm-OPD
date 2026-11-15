import { Sparkles } from "lucide-react";
import { OpthalmOKLogo } from "@/app/(auth)/_components/OpthalmOKLogo";
import { Card } from "@/components/shadcn/card";
import { LENS_TYPE_LABEL, type PrescriptionRecord } from "../../_components/types";
import { fmtLongDate, fmtSigned } from "./rx-utils";

export function RxPreview({ rx }: { rx: PrescriptionRecord }) {
  const validUntil = new Date(rx.issuedAt);
  validUntil.setMonth(validUntil.getMonth() + rx.validMonths);

  return (
    <div className="flex flex-col gap-4">
      <Card className="overflow-hidden p-0">
        <div className="border-b border-line px-4 py-3 print:hidden">
          <h3 className="font-display text-base font-semibold">Prescription preview</h3>
          <p className="text-xs text-muted-foreground">Patient-ready document</p>
        </div>
        {/* The paper stays white in dark mode — it is a printed document. */}
        <div className="m-4 rounded-md border border-line bg-white p-6 text-neutral-900 print:m-0 print:border-0">
          <OpthalmOKLogo variant="light" width={44} />
          <div className="my-4 h-0.5 bg-neutral-900" />
          <h3 className="mb-3 font-display text-lg font-semibold">Spectacle prescription</h3>
          <div className="mb-4 flex flex-col gap-0.5 text-sm">
            <b>{rx.patientName || "—"}</b>
            <span className="text-neutral-500">Patient ID: {rx.patientId || "—"}</span>
            <span className="text-neutral-500">Issued: {fmtLongDate(rx.issuedAt)}</span>
          </div>
          <div className="overflow-hidden rounded-md border border-neutral-300">
            <div className="grid grid-cols-5 bg-neutral-50 text-center text-[11px] font-semibold text-neutral-500">
              <span className="py-2" />
              <span className="py-2">SPH</span>
              <span className="py-2">CYL</span>
              <span className="py-2">AXIS</span>
              <span className="py-2">ADD</span>
            </div>
            {(["od", "os"] as const).map((eye) => (
              <div key={eye} className="grid grid-cols-5 border-t border-neutral-300 text-center text-sm">
                <b className="py-2 pl-3 text-left">{eye.toUpperCase()}</b>
                <span className="py-2">{fmtSigned(rx[eye].sph) || "—"}</span>
                <span className="py-2">{fmtSigned(rx[eye].cyl) || "—"}</span>
                <span className="py-2">{rx[eye].axis != null ? `${rx[eye].axis}°` : "—"}</span>
                <span className="py-2">{fmtSigned(rx[eye].add) || "—"}</span>
              </div>
            ))}
          </div>
          <div className="my-4 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
            <span className="text-neutral-500">Lens type</span>
            <b>{LENS_TYPE_LABEL[rx.lensType]}</b>
            <span className="text-neutral-500">PD</span>
            <b>{rx.pd != null ? `${rx.pd} mm` : "—"}</b>
            <span className="text-neutral-500">Valid until</span>
            <b>{fmtLongDate(validUntil)}</b>
          </div>
          {rx.notes && <p className="mb-4 text-xs text-neutral-500">{rx.notes}</p>}
          <div className="mt-6">
            <div className="mb-1.5 h-px w-32 bg-neutral-400" />
            <span className="text-xs text-neutral-500">{rx.signedBy} · Optometrist</span>
          </div>
          <p className="mt-4 border-t border-neutral-300 pt-3 text-[10px] text-neutral-500">
            Please bring this prescription to your optical provider.
          </p>
        </div>
      </Card>

      <Card className="flex items-start gap-3 p-4 print:hidden">
        <Sparkles className="mt-0.5 size-4.5 shrink-0 text-sage" />
        <div>
          <b className="block text-sm font-semibold">Connected workflow</b>
          <p className="mt-1 text-sm text-mute">
            Saving this prescription makes it available to the optical team for lens selection, quotation, and spectacle order creation.
          </p>
        </div>
      </Card>
    </div>
  );
}
