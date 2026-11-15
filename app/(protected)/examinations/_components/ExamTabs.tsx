"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { TABS, type TabId } from "./constants";

const arrow =
  "grid size-8 shrink-0 place-items-center rounded-md border border-line text-muted-foreground transition-colors hover:border-sage hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line disabled:hover:text-muted-foreground";

/**
 * The examination's tab bar. It is `sticky` so it stays at the top while the
 * chart scrolls — which only works OUTSIDE the Card (the Card clips overflow).
 * Previous / next arrows step through the tabs in order.
 */
export function ExamTabs({ tab, onChange, patientName }: { tab: TabId; onChange: (t: TabId) => void; patientName?: string }) {
  const i = TABS.findIndex((t) => t.id === tab);
  const go = (delta: number) => TABS[i + delta] && onChange(TABS[i + delta].id);

  return (
    <div className="sticky top-0 z-20 -mx-1 rounded-md border border-line bg-card/95 px-2 py-1.5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/85 print:hidden">
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => go(-1)} disabled={i <= 0} aria-label={i > 0 ? `Previous: ${TABS[i - 1].label}` : "Previous tab"} className={arrow}>
          <ChevronLeft size={16} />
        </button>

        <div role="tablist" aria-label="Examination sections" className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
          {TABS.map((t, idx) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => onChange(t.id)}
              className={cn(
                "shrink-0 whitespace-nowrap rounded-md px-3 py-1.5 text-sm transition-colors",
                tab === t.id ? "bg-sage-soft font-semibold text-sage" : "font-medium text-mute hover:bg-app hover:text-ink",
              )}
            >
              <span className="mr-1.5 text-[10px] opacity-60">{idx + 1}</span>
              {t.label}
            </button>
          ))}
        </div>

        {patientName && <span className="hidden max-w-[10rem] truncate text-xs font-semibold text-muted-foreground xl:block">{patientName}</span>}

        <button type="button" onClick={() => go(1)} disabled={i >= TABS.length - 1} aria-label={i < TABS.length - 1 ? `Next: ${TABS[i + 1].label}` : "Next tab"} className={arrow}>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

/** Back / Next buttons at the end of a tab's content, so the examiner needn't scroll up. */
export function TabStepper({ tab, onChange }: { tab: TabId; onChange: (t: TabId) => void }) {
  const i = TABS.findIndex((t) => t.id === tab);
  const prev = TABS[i - 1];
  const next = TABS[i + 1];
  return (
    <div className="mt-2 flex items-center justify-between gap-3 border-t border-line/70 pt-3 print:hidden">
      {prev ? (
        <button type="button" onClick={() => onChange(prev.id)} className="inline-flex items-center gap-1.5 rounded-md border border-line px-3 py-2 text-sm font-semibold text-foreground hover:border-sage">
          <ChevronLeft size={15} /> {prev.label}
        </button>
      ) : (
        <span />
      )}
      {next ? (
        <button type="button" onClick={() => onChange(next.id)} className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover">
          {next.label} <ChevronRight size={15} />
        </button>
      ) : (
        <span className="text-xs text-muted-foreground">Last section — save or print below</span>
      )}
    </div>
  );
}
