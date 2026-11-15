import { Calendar, Printer, Save } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import type { ExamState } from "./types";

export function ExamActions({
  ex,
  saving,
  onPrint,
  onSave,
  onFollowUp,
  onIssue,
}: {
  ex: ExamState;
  saving: boolean;
  onPrint: () => void;
  onSave: () => void;
  onFollowUp: () => void;
  onIssue: () => void;
}) {
  return (
    <div className="sticky bottom-3 z-10 flex flex-wrap justify-center gap-2 rounded-md border border-line bg-card p-3 shadow-lg print:hidden">
      <Button onClick={onPrint} disabled={saving}>
        <Printer className="size-4" />
        {saving ? "Saving…" : "Save & Print Report"}
      </Button>
      <Button variant="ghost" onClick={onSave} disabled={saving}>
        <Save className="size-4" />
        {ex.saved ? "Saved ✓" : saving ? "Saving…" : "Save Digital"}
      </Button>
      <Button variant="ghost" onClick={onFollowUp}>
        <Calendar className="size-4" />
        Schedule Follow-up
      </Button>
      <Button variant={ex.issued ? "secondary" : "warm"} onClick={onIssue} disabled={saving}>
        {ex.issued ? "Rx issued ✓" : saving ? "Saving…" : "Issue Prescription"}
      </Button>
    </div>
  );
}
