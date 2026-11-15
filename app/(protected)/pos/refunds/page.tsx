import SectionHeading from "../../dashboard/_components/SectionHeading";
import { RefundWorkspace } from "./_components/RefundWorkspace";

export default function RefundsPage() {
  return (
    <div className="flex flex-col gap-4">
      <SectionHeading eyebrow="OPTICAL RETAIL" title="Refunds" description="Find an invoice and return money to the customer. Every refund is logged with a reason and counted in the shift's Z-report." />
      <RefundWorkspace />
    </div>
  );
}
