import { Calendar } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/shadcn/dialog";
import { Chip } from "@/components/ui/ChartUi";
import { FU_OPTIONS, type SetExam } from "./constants";
import type { ExamState } from "./types";

export function FollowUpDialog({
  open,
  onOpenChange,
  ex,
  set,
  onBook,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ex: ExamState;
  set: SetExam;
  onBook: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Schedule follow-up</DialogTitle>
        <div className="mb-2 flex flex-wrap gap-2">
          {FU_OPTIONS.map(([d, l]) => (
            <Chip key={d} on={ex.fu === d} onClick={() => set(["fu"], d)}>
              {l}
            </Chip>
          ))}
        </div>
        <Button disabled={ex.fu == null} onClick={onBook}>
          <Calendar className="size-4" />
          Book first free slot
        </Button>
      </DialogContent>
    </Dialog>
  );
}
