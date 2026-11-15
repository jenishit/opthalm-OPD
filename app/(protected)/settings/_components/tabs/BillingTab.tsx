"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CreditCard, Loader2, Wallet } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { getClinicSubscription } from "@/services/clinic-services";
import { ApiError } from "@/services/http";
import type { ClinicSubscription } from "@/types/clinic-types";

const STATUS_STYLE: Record<string, string> = {
  active: "bg-sage-soft text-sage",
  trialing: "bg-t-new-soft text-t-new",
  past_due: "bg-warn-soft text-warn-ink",
  cancelled: "bg-bad-soft text-bad-ink",
};

const STATUS_LABEL: Record<string, string> = {
  active: "Active",
  trialing: "Trialing",
  past_due: "Past due",
  cancelled: "Cancelled",
};

function UsageBar({ label, used, limit }: { label: string; used: number; limit: number | null }) {
  const unlimited = limit === null;
  const pct = unlimited ? 100 : Math.min(100, (used / Math.max(limit, 1)) * 100);
  return (
    <div>
      <div className="mb-[9px] flex items-center justify-between">
        <span className="text-[10px] text-mute">{label}</span>
        <b className="text-[11px] text-ink">
          {used.toLocaleString()}{" "}
          <span className="font-normal text-mute">/ {unlimited ? "Unlimited" : limit.toLocaleString()}</span>
        </b>
      </div>
      <div className="h-1.5 overflow-hidden rounded-[5px] bg-line">
        <span
          className="block h-full rounded-[5px]"
          style={{ width: `${pct}%`, backgroundColor: unlimited ? "var(--c-strong)" : "var(--c-ok)" }}
        />
      </div>
    </div>
  );
}

export function BillingTab() {
  const [subscription, setSubscription] = useState<ClinicSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getClinicSubscription()
      .then((data) => {
        if (active) setSubscription(data);
      })
      .catch((error) => {
        console.error("Failed to load subscription", error);
        toast.error(error instanceof ApiError ? error.message : "Failed to load billing details");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (loading || !subscription) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-[11px] text-mute">
        <Loader2 size={15} className="animate-spin" /> Loading billing details…
      </div>
    );
  }

  const statusKey = subscription.status in STATUS_STYLE ? subscription.status : "active";
  const periodEnd = new Date(subscription.current_period_end).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <>
      <div className="flex items-center justify-between gap-3 pb-[14px]">
        <div>
          <h3 className="m-0 font-display text-base font-semibold text-ink">Billing & subscription</h3>
          <p className="m-0 mt-[5px] text-[10px] text-mute">
            Your ClearView plan, usage, and payment details.
          </p>
        </div>
        <span className="grid size-[34px] shrink-0 place-items-center rounded-[9px] bg-sage-soft text-sage">
          <Wallet size={18} />
        </span>
      </div>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-[9px] border border-line bg-app p-[15px]">
        <div>
          <span
            className={
              "inline-flex items-center gap-[5px] rounded-[5px] px-[7px] py-1 text-[9px] font-semibold leading-none " +
              STATUS_STYLE[statusKey]
            }
          >
            {STATUS_LABEL[statusKey] ?? subscription.status}
          </span>
          <div className="mt-2 font-sans text-[20px] font-semibold text-ink">
            {subscription.plan_name ?? "No plan assigned"}
          </div>
          <p className="mt-1 text-[10px] text-mute">Current period ends {periodEnd}</p>
        </div>
        <Button
          onClick={() => toast.info("Contact your account manager to change plans")}
          className="min-h-9 rounded-[7px] border border-sage bg-sage px-3.5 text-[11px] font-semibold text-primary-foreground hover:border-sagehover hover:bg-sagehover"
        >
          Change plan
        </Button>
      </div>

      <div className="mb-5 flex flex-col gap-4">
        <span className="text-[10px] font-semibold text-mute">Plan usage</span>
        <UsageBar label="Staff seats" used={subscription.seats_used} limit={subscription.seats_limit} />
        <UsageBar
          label="Patient records"
          used={subscription.patient_records_used}
          limit={subscription.patient_records_limit}
        />
        <UsageBar label="Locations" used={subscription.locations_used} limit={subscription.locations_limit} />
      </div>

      <div className="my-1 h-px bg-line" />

      <div className="flex items-center justify-between gap-[15px] py-3">
        <div className="flex items-center gap-2.5">
          <span className="grid size-[34px] shrink-0 place-items-center rounded-[9px] bg-t-new-soft text-t-new">
            <CreditCard size={16} />
          </span>
          <div>
            <b className="text-[11px] text-ink">{subscription.payment_method_label ?? "No payment method on file"}</b>
            <p className="mt-[5px] text-[10px] text-mute">
              {subscription.payment_method_label
                ? "Used for your OpthalmOK subscription"
                : "Add one so your subscription keeps renewing without interruption"}
            </p>
          </div>
        </div>
        <Button
          onClick={() => toast.info("Payment method management isn't wired up yet")}
          className="min-h-[30px] rounded-[7px] border border-line bg-card px-2.5 text-[11px] font-semibold text-ink hover:border-strong hover:bg-app"
        >
          {subscription.payment_method_label ? "Update" : "Add"}
        </Button>
      </div>

      <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-[17px]">
        <span className="text-[9px] text-mute">Questions about your plan? Contact billing support.</span>
        <Button
          onClick={() => toast.info("Contact support to cancel your subscription")}
          className="min-h-9 rounded-[7px] border border-bad-soft bg-card px-3.5 text-[11px] font-semibold text-bad-ink hover:border-bad hover:bg-bad-soft"
        >
          Cancel subscription
        </Button>
      </div>
    </>
  );
}
