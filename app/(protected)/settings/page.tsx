"use client";

import { useState } from "react";
import { Home, Building2, Bell, Wallet, CreditCard, ScanBarcode, ShieldCheck, Plug, Settings } from "lucide-react";
import { SettingsNav } from "./_components/SettingsNav";
import { PracticeProfileTab } from "./_components/tabs/PracticeProfileTab";
import { LocationsTab } from "./_components/tabs/LocationsTab";
import { NotificationsTab } from "./_components/tabs/NotificationsTab";
import { BillingTab } from "./_components/tabs/BillingTab";
import { PaymentsTab } from "./_components/tabs/PaymentsTab";
import { BarcodePosTab } from "./_components/tabs/BarcodePosTab";
import { DataPrivacyTab } from "./_components/tabs/DataPrivacyTab";
import { IntegrationsTab } from "./_components/tabs/IntegrationsTab";
import { PreferencesTab } from "./_components/tabs/PreferencesTab";

const TABS = [
  { icon: Home, label: "Practice profile", group: "PRACTICE", content: PracticeProfileTab },
  { icon: Building2, label: "Locations & rooms", group: "PRACTICE", content: LocationsTab },
  { icon: Bell, label: "Notifications", group: "PRACTICE", content: NotificationsTab },
  { icon: CreditCard, label: "Payments & tax", group: "PRACTICE", content: PaymentsTab },
  { icon: ScanBarcode, label: "Barcode & POS", group: "PRACTICE", content: BarcodePosTab },
  { icon: ShieldCheck, label: "Data & privacy", group: "PRACTICE", content: DataPrivacyTab },
  { icon: Wallet, label: "Billing & subscription", group: "WORKSPACE", content: BillingTab },
  { icon: Plug, label: "Integrations", group: "WORKSPACE", content: IntegrationsTab },
  { icon: Settings, label: "Preferences", group: "YOUR ACCOUNT", content: PreferencesTab },
] as const;

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]["label"]>("Practice profile");
  const ActiveContent = TABS.find((t) => t.label === activeTab)!.content;

  return (
    <div className="font-['DM_Sans',sans-serif] text-[13px] text-[#23342c]">
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&family=Playfair+Display:wght@500;600;700&display=swap"
      />

      <div className="mb-6">
        <div className="mb-[7px] text-[9px] font-bold tracking-[1.5px] text-[#8d927f]">PRACTICE CONFIGURATION</div>
        <h1 className="m-0 font-['Playfair_Display',serif] text-[29px] font-semibold tracking-[-0.5px] text-[#26392e]">Settings</h1>
        <p className="m-0 mt-[7px] text-[12px] text-[#82877e]">
          Configure how ClearView runs clinically and at the register, manage your OpthalmOK workspace, and set your own
          personal defaults.
        </p>
      </div>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[230px_1fr]">
        <SettingsNav tabs={TABS} activeTab={activeTab} onSelect={(label) => setActiveTab(label as (typeof TABS)[number]["label"])} />
        <div className="rounded-[11px] border border-[#e9e6dc] bg-[#fffefa] p-[20px_22px] shadow-[0_5px_20px_rgba(42,52,41,0.035),0_1px_2px_rgba(42,52,41,0.04)]">
          <ActiveContent />
        </div>
      </div>
    </div>
  );
}
