"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { upsertSubscription } from "@/services/admin-services";
import { ApiError } from "@/services/http";
import type { PlatformSubscriptionUsage } from "@/types/platform-types";

/** Default activation: one year from today, in the YYYY-MM-DD form the API takes. */
function oneYearFromNow(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
}

function periodEndDate(subscription: PlatformSubscriptionUsage | null): string {
  const raw = subscription?.current_period_end;
  if (!raw) return oneYearFromNow();
  return raw.slice(0, 10);
}

/**
 * Platform-operator activation control for one clinic. A clinic is read-only
 * while its subscription is pending/past due/cancelled and fully usable while
 * active/trialing — so this is the switch that opens the workspace.
 */
export function ClinicActivationPanel({
  clinicId,
  clinicName,
  subscription,
  onDone,
}: {
  clinicId: string;
  clinicName: string;
  subscription: PlatformSubscriptionUsage | null;
  onDone: () => void;
}) {
  const [plan, setPlan] = useState(subscription?.plan_name ?? "Standard");
  const [until, setUntil] = useState(() => periodEndDate(subscription));
  const [busy, setBusy] = useState<null | "activate" | "readonly">(null);

  const isActive = subscription?.status === "active" || subscription?.status === "trialing";

  async function act(kind: "activate" | "readonly") {
    setBusy(kind);
    try {
      await upsertSubscription(clinicId, {
        plan_name: plan.trim() || "Standard",
        status: kind === "activate" ? "active" : "pending",
        current_period_end: until,
      });
      toast.success(
        kind === "activate"
          ? `${clinicName} is now active`
          : `${clinicName} is read-only again`,
      );
      onDone();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Couldn't update the account");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="border-t border-line bg-app px-5 py-4">
      <h4 className="m-0 text-[10px] font-semibold text-ink">Plan activation</h4>
      <p className="m-0 mb-3 mt-1 text-[9px] text-mute">
        Pending clinics can finish setup and browse, but cannot add patients, visits or invoices until activated.
      </p>

      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-[9px] font-semibold text-mute">
          Plan
          <input
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
            className="h-8 w-36 rounded-[6px] border border-line bg-card px-2 text-[11px] text-ink outline-none focus:border-sage"
          />
        </label>
        <label className="flex flex-col gap-1 text-[9px] font-semibold text-mute">
          {isActive ? "Active until" : "Period ends"}
          <input
            type="date"
            value={until}
            onChange={(e) => setUntil(e.target.value)}
            className="h-8 w-36 rounded-[6px] border border-line bg-card px-2 text-[11px] text-ink outline-none focus:border-sage"
          />
        </label>
        <div className="ml-auto flex flex-wrap gap-2">
          {isActive ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={busy !== null || !until}
              onClick={() => act("readonly")}
            >
              {busy === "readonly" ? <Loader2 className="size-4 animate-spin" /> : <Lock className="size-4" />}
              Make read-only
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              disabled={busy !== null || !until}
              onClick={() => act("activate")}
            >
              {busy === "activate" ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
              Activate clinic
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
