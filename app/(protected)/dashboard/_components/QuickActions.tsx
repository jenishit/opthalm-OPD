import Link from "next/link";
import {
  CalendarCheck,
  FileText,
  ScanBarcode,
  ShoppingCart,
  Truck,
  UserRoundPlus,
} from "lucide-react";

const actions = [
  { label: "Add patient", href: "/patients/register", icon: UserRoundPlus },
  { label: "Book appointment", href: "/appointments", icon: CalendarCheck },
  { label: "New prescription", href: "/prescriptions/new", icon: FileText },
  { label: "Create sale", href: "/pos", icon: ShoppingCart },
  { label: "Order lenses", href: "/customer-orders", icon: Truck },
  { label: "Scan barcode", href: "/inventory", icon: ScanBarcode },
] as const;

export default function QuickActions() {
  return (
    <div className="min-w-0 rounded-xl border border-line bg-card p-5 shadow-sm">
      <h3 className="font-display text-base font-semibold text-foreground">Quick actions</h3>
      <p className="mt-1 text-xs text-muted-foreground">Common tasks, one click away</p>

      <div className="mt-4 grid grid-cols-3 gap-2.5 sm:grid-cols-6">
        {actions.map(({ label, href, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            className="flex flex-col items-center gap-2 rounded-lg border border-line px-2 py-3 text-center hover:bg-muted/40"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-sage-soft text-sage">
              <Icon size={16} />
            </span>
            <span className="text-xs font-medium text-foreground">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
