export type ApptType = "new" | "fu" | "surg";

/**
 * The backend's Visit has no dedicated appointment-type field — only a free
 * text chief_complaint. We tag the three types we book with a recognisable
 * phrase (apptTypeComplaint) and read it back the same way (inferApptType)
 * so existing visits booked elsewhere still classify reasonably.
 */
export const TY: Record<ApptType, { label: string; cardClass: string; pillClass: string }> = {
  new: { label: "New visit", cardClass: "bg-t-new-soft text-ink", pillClass: "pill-new" },
  fu: { label: "Follow-up", cardClass: "bg-ok-soft text-ink", pillClass: "pill-ok" },
  surg: { label: "Surgery", cardClass: "bg-t-surg-soft text-ink", pillClass: "pill-surg" },
};

export function inferApptType(chiefComplaint: string): ApptType {
  const s = chiefComplaint.toLowerCase();
  if (s.includes("surg")) return "surg";
  if (s.includes("follow")) return "fu";
  return "new";
}

export function apptTypeComplaint(type: ApptType): string {
  return type === "new"
    ? "New patient consultation"
    : type === "fu"
      ? "Follow-up visit"
      : "Surgery";
}
