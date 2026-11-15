import SectionHeading from "../../dashboard/_components/SectionHeading";
import { ShiftsList } from "./_components/ShiftsList";

export default function ShiftsPage() {
  return (
    <div className="flex flex-col gap-4">
      <SectionHeading eyebrow="OPTICAL RETAIL" title="Shifts & Z-reports" description="Cash-drawer shifts for this terminal and their end-of-day reports." />
      <ShiftsList />
    </div>
  );
}
