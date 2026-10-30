"use client";

import { ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export function SettingsNav({
  tabs,
  activeTab,
  onSelect,
}: {
  tabs: readonly { icon: LucideIcon; label: string; group: string }[];
  activeTab: string;
  onSelect: (label: string) => void;
}) {
  const groups = Array.from(new Set(tabs.map((t) => t.group)));

  return (
    <div className="flex flex-col gap-3 rounded-[11px] border border-[#e9e6dc] bg-[#fffefa] p-2 shadow-[0_5px_20px_rgba(42,52,41,0.035),0_1px_2px_rgba(42,52,41,0.04)]">
      {groups.map((group) => (
        <div key={group} className="flex flex-col gap-0.5">
          <span className="px-2.5 pb-1 text-[9px] font-bold tracking-[0.7px] text-[#a0a399]">{group}</span>
          <div className="flex flex-row gap-0.5 overflow-x-auto lg:flex-col">
            {tabs
              .filter((t) => t.group === group)
              .map((s) => (
                <button
                  key={s.label}
                  onClick={() => onSelect(s.label)}
                  className={
                    "flex w-full shrink-0 items-center gap-2.5 whitespace-nowrap rounded-lg px-2.5 py-[11px] text-left text-[11px] lg:whitespace-normal " +
                    (activeTab === s.label ? "bg-[#e9f0e8] font-bold text-[#2d5c40]" : "text-[#788276]")
                  }
                >
                  <s.icon size={17} />
                  {s.label}
                  <ChevronRight size={15} className="ml-auto hidden lg:block" />
                </button>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
