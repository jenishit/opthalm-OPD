import type { LabJob, LabJobStatus } from "@/types/lab-types";

export type StatusTab = "active" | LabJobStatus;

export const STATUS_LABEL: Record<LabJobStatus, string> = {
  in_fitting: "In fitting",
  ready_to_deliver: "Ready to deliver",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const STATUS_STYLE: Record<LabJobStatus, string> = {
  in_fitting: "bg-t-surg-soft text-t-surg",
  ready_to_deliver: "bg-t-new-soft text-t-new",
  delivered: "bg-ok-soft text-ok-ink",
  cancelled: "bg-bad-soft text-bad-ink",
};

/** Next sensible transitions from a status (the backend decides what is actually allowed). */
export const NEXT_STATUSES: Record<LabJobStatus, LabJobStatus[]> = {
  in_fitting: ["ready_to_deliver", "cancelled"],
  ready_to_deliver: ["delivered", "in_fitting", "cancelled"],
  delivered: [],
  cancelled: [],
};

export const isActive = (j: LabJob) => j.status !== "delivered" && j.status !== "cancelled";
