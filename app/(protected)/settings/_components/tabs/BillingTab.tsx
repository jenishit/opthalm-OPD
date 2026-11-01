"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CreditCard, Loader2, Wallet } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { getClinicSubscription } from "@/services/clinic-services";
import { ApiError } from "@/services/http";
import type { ClinicSubscription } from "@/types/clinic-types";

const STATUS_STYLE: Record<string, string> = {
  active: "bg-[#e9f0e8] text-[#214c3a]",
  trialing: "bg-[#e8f0f2] text-[#557d8b]",
  past_due: "bg-[#f7efdf] text-[#a47a35]",
  cancelled: "bg-[#f1e1dd] text-[#9c625b]",
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
        <span className="text-[10px] text-[#7f887c]">{label}</span>
        <b className="text-[11px] text-[#23342c]">
          {used.toLocaleString()}{" "}
          <span className="font-normal text-[#92988c]">/ {unlimited ? "Unlimited" : limit.toLocaleString()}</span>
        </b>
      </div>
      <div className="h-1.5 overflow-hidden rounded-[5px] bg-[#eeece4]">
        <span
          className="block h-full rounded-[5px]"
          style={{ width: `${pct}%`, backgroundColor: unlimited ? "#c7cec2" : "#3c7652" }}
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
      <div className="flex items-center justify-center gap-2 py-16 text-[11px] text-[#92988c]">
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
          <h3 className="m-0 font-['Playfair_Display',serif] text-base font-semibold text-[#2a3b30]">Billing & subscription</h3>
          <p className="m-0 mt-[5px] text-[10px] text-[#96998f]">
            Your ClearView plan, usage, and payment details.
          </p>
        </div>
        <span className="grid size-[34px] shrink-0 place-items-center rounded-[9px] bg-[#e9f0e8] text-[#214c3a]">
          <Wallet size={18} />
        </span>
      </div>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-[9px] border border-[#e9e6dc] bg-[#fbfaf6] p-[15px]">
        <div>
          <span
            className={
              "inline-flex items-center gap-[5px] rounded-[5px] px-[7px] py-1 text-[9px] font-semibold leading-none " +
              STATUS_STYLE[statusKey]
            }
          >
            {STATUS_LABEL[statusKey] ?? subscription.status}
          </span>
          <div className="mt-2 font-['Manrope',sans-serif] text-[20px] font-semibold text-[#23342c]">
            {subscription.plan_name ?? "No plan assigned"}
          </div>
          <p className="mt-1 text-[10px] text-[#92988c]">Current period ends {periodEnd}</p>
        </div>
        <Button
          onClick={() => toast.info("Contact your account manager to change plans")}
          className="min-h-9 rounded-[7px] border border-[#214c3a] bg-[#214c3a] px-3.5 text-[11px] font-semibold text-white hover:border-[#173d2c] hover:bg-[#173d2c]"
        >
          Change plan
        </Button>
      </div>

      <div className="mb-5 flex flex-col gap-4">
        <span className="text-[10px] font-semibold text-[#687468]">Plan usage</span>
        <UsageBar label="Staff seats" used={subscription.seats_used} limit={subscription.seats_limit} />
        <UsageBar
          label="Patient records"
          used={subscription.patient_records_used}
          limit={subscription.patient_records_limit}
        />
        <UsageBar label="Locations" used={subscription.locations_used} limit={subscription.locations_limit} />
      </div>

      <div className="my-1 h-px bg-[#eeece4]" />

      <div className="flex items-center justify-between gap-[15px] py-3">
        <div className="flex items-center gap-2.5">
          <span className="grid size-[34px] shrink-0 place-items-center rounded-[9px] bg-[#e8f0f2] text-[#557d8b]">
            <CreditCard size={16} />
          </span>
          <div>
            <b className="text-[11px] text-[#23342c]">{subscription.payment_method_label ?? "No payment method on file"}</b>
            <p className="mt-[5px] text-[10px] text-[#92988c]">
              {subscription.payment_method_label
                ? "Used for your OpthalmOK subscription"
                : "Add one so your subscription keeps renewing without interruption"}
            </p>
          </div>
        </div>
        <Button
          onClick={() => toast.info("Payment method management isn't wired up yet")}
          className="min-h-[30px] rounded-[7px] border border-[#e2dfd5] bg-[#fffefa] px-2.5 text-[11px] font-semibold text-[#48564a] hover:border-[#cbd5c8] hover:bg-[#f3f4ec]"
        >
          {subscription.payment_method_label ? "Update" : "Add"}
        </Button>
      </div>

      <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 border-t border-[#eeece4] pt-[17px]">
        <span className="text-[9px] text-[#a0a399]">Questions about your plan? Contact billing support.</span>
        <Button
          onClick={() => toast.info("Contact support to cancel your subscription")}
          className="min-h-9 rounded-[7px] border border-[#f0d9d3] bg-[#fffefa] px-3.5 text-[11px] font-semibold text-[#a66b62] hover:border-[#e3b8ae] hover:bg-[#f5e7e3]"
        >
          Cancel subscription
        </Button>
      </div>
    </>
  );
}
