import { Loader2 } from "lucide-react";
import { Button } from "@/components/shadcn/button";

export function SaveRow({
  onSave,
  saving = false,
  lastSaved,
}: {
  onSave: () => void;
  saving?: boolean;
  /** ISO timestamp of the last successful save, or null/undefined if never saved this session. */
  lastSaved?: string | null;
}) {
  const lastSavedLabel = lastSaved
    ? `Last saved at ${new Date(lastSaved).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    : "Not saved yet";

  return (
    <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 border-t border-[#eeece4] pt-[17px]">
      <span className="text-[9px] text-[#a0a399]">{lastSavedLabel}</span>
      <Button
        onClick={onSave}
        disabled={saving}
        className="min-h-9 gap-1.5 rounded-[7px] border border-[#214c3a] bg-[#214c3a] px-3.5 text-[11px] font-semibold text-white hover:border-[#173d2c] hover:bg-[#173d2c] disabled:opacity-60"
      >
        {saving && <Loader2 size={13} className="animate-spin" />}
        {saving ? "Saving…" : "Save changes"}
      </Button>
    </div>
  );
}
