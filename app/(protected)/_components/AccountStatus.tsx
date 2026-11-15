"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Hourglass, Sparkles } from "lucide-react";
import { useAccountStore } from "@/lib/account-status";
import { useAuthStore } from "@/stores/authStore";
import { getClinic, getClinicSubscription } from "@/services/clinic-services";
import { SubscriptionInactiveError } from "@/services/http";

/**
 * Learns the clinic's activation state once the session is ready (admins can read the
 * subscription) and shows a banner while the account is awaiting activation.
 */
export function AccountStatus() {
  const pathname = usePathname();
  const onSetupPage = pathname === "/setup";
  const role = useAuthStore((s) => s.staffUser?.role);
  const token = useAuthStore((s) => s.accessToken);
  const state = useAccountStore((s) => s.state);
  const setState = useAccountStore((s) => s.setState);
  const [needsSetup, setNeedsSetup] = useState(false);

  useEffect(() => {
    // Only admins can read the subscription; the platform operator has no clinic of their own.
    if (!token || role !== "admin") return;
    let active = true;
    getClinicSubscription()
      .then((sub) => {
        if (!active) return;
        setState(sub.status === "pending" ? "pending" : sub.status === "active" || sub.status === "trialing" ? "active" : "inactive");
      })
      .catch((error) => {
        // 402 from the subscription gate itself: the subscription has lapsed.
        if (active && error instanceof SubscriptionInactiveError) setState("inactive");
      });
    getClinic()
      .then((clinic) => {
        if (active) setNeedsSetup(!clinic.setup_completed);
      })
      .catch(() => {
        // The setup banner is a convenience; a failed read must not break the console.
      });
    return () => {
      active = false;
    };
  }, [token, role, setState, onSetupPage]);

  // The setup page is the banner's destination — don't cover it with a prompt
  // to go there.
  if (onSetupPage) return null;

  if (needsSetup) {
    return (
      <div role="status" className="flex flex-wrap items-center gap-2 border-b border-sage/40 bg-sage-soft px-4 py-2 text-xs text-sage print:hidden">
        <Sparkles className="size-4 shrink-0" aria-hidden />
        <span className="font-semibold">Finish setting up your clinic.</span>
        <span>Add your clinic details and your name to complete your account.</span>
        <Link href="/setup" className="ml-auto font-semibold underline">Continue setup</Link>
      </div>
    );
  }

  if (state === "inactive") {
    return (
      <div role="alert" className="flex items-center gap-2 border-b border-bad/40 bg-bad-soft px-4 py-2 text-xs text-bad-ink print:hidden">
        <Hourglass className="size-4 shrink-0" aria-hidden />
        <span className="font-semibold">Subscription inactive.</span>
        <span>Some features are unavailable. Contact the platform team to renew.</span>
      </div>
    );
  }
  if (state !== "pending") return null;
  return (
    <div role="status" className="flex flex-wrap items-center gap-2 border-b border-warn/40 bg-warn-soft px-4 py-2 text-xs text-warn-ink print:hidden">
      <Hourglass className="size-4 shrink-0" aria-hidden />
      <span className="font-semibold">Awaiting activation.</span>
      <span>
        You can browse and complete your clinic profile, but other changes are disabled until the platform team activates your account.
      </span>
      <Link href="/settings" className="ml-auto font-semibold underline">Clinic settings</Link>
    </div>
  );
}
