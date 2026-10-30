"use client";

import { Plus, Truck, Activity, Clock3, Wallet, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { PurchasesTable } from "./_components/PurchasesTable";
import { SupplierLowerGrid } from "./_components/SupplierLowerGrid";

function StatCard({
  label,
  value,
  change,
  foot,
  icon: Icon,
  bg,
  text,
}: {
  label: string;
  value: string;
  change: string;
  foot: string;
  icon: React.ElementType;
  bg: string;
  text: string;
}) {
  return (
    <div className="min-w-0 rounded-[11px] border border-[#e9e6dc] bg-[#fffefa] p-[17px_18px_15px] shadow-[0_5px_20px_rgba(42,52,41,0.035),0_1px_2px_rgba(42,52,41,0.04)]">
      <div className="flex items-center justify-between gap-2.5 text-[11px] text-[#727a70]">
        <span>{label}</span>
        <span className={"grid size-[34px] shrink-0 place-items-center rounded-[9px] " + bg + " " + text}>
          <Icon size={16} />
        </span>
      </div>
      <div className="my-3 font-['Manrope',sans-serif] text-[27px] font-semibold tracking-[-1px] text-[#293a30]">{value}</div>
      <div className="flex flex-wrap items-center gap-[7px] text-[10px] text-[#9a9e95]">
        <span className="inline-flex items-center gap-px font-bold text-[#3b805e]">
          <ArrowUpRight size={13} />
          {change}
        </span>
        <span>{foot}</span>
      </div>
    </div>
  );
}

export default function SupplierOrdersPage() {
  return (
    <div className="font-['DM_Sans',sans-serif] text-[13px] text-[#23342c]">
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&family=Playfair+Display:wght@500;600;700&display=swap"
      />

      <div className="mb-6 flex flex-wrap items-end justify-between gap-[18px]">
        <div>
          <div className="mb-[7px] text-[9px] font-bold tracking-[1.5px] text-[#8d927f]">PURCHASING & LAB COORDINATION</div>
          <h1 className="m-0 font-['Playfair_Display',serif] text-[29px] font-semibold tracking-[-0.5px] text-[#26392e]">
            Supplier lens orders
          </h1>
          <p className="m-0 mt-[7px] text-[12px] text-[#82877e]">
            Coordinate external optical labs, supplier lead times, incoming stock, and invoice reconciliation.
          </p>
        </div>
        <Button className="min-h-9 gap-2 rounded-[7px] border border-[#214c3a] bg-[#214c3a] px-3.5 text-[11px] font-semibold text-white hover:border-[#173d2c] hover:bg-[#173d2c]">
          <Plus size={14} />
          New supplier order
        </Button>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-[14px] md:grid-cols-4">
        <StatCard label="Open purchase orders" value="12" change="3 due soon" foot="next 7 days" icon={Truck} bg="bg-[#e9f0e8]" text="text-[#214c3a]" />
        <StatCard
          label="In transit"
          value="04"
          change="On schedule"
          foot="incoming deliveries"
          icon={Activity}
          bg="bg-[#e8f0f2]"
          text="text-[#557d8b]"
        />
        <StatCard
          label="Awaiting confirmation"
          value="03"
          change="Follow up"
          foot="supplier response"
          icon={Clock3}
          bg="bg-[#f7efdf]"
          text="text-[#a47a35]"
        />
        <StatCard label="This month" value="$18,420" change="8.1%" foot="purchases placed" icon={Wallet} bg="bg-[#f0edf6]" text="text-[#8477a3]" />
      </div>

      <PurchasesTable />
      <SupplierLowerGrid />
    </div>
  );
}
