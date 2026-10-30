import { Check, X } from "lucide-react";
import { Button } from "@/components/shadcn/button";

/** Clear/Done action row shared by the clinical value pickers. */
export const PickerFoot = ({
  onClear,
  onDone,
  extra,
}: {
  onClear: () => void;
  onDone: () => void;
  extra?: React.ReactNode;
}) => (
  <div className="flex flex-wrap items-center gap-2 pt-1">
    {extra}
    <Button variant="ghost" onClick={onClear}>
      <X className="size-4" />
      Clear
    </Button>
    <div className="flex-1" />
    <Button onClick={onDone}>
      <Check className="size-4" />
      Done
    </Button>
  </div>
);
