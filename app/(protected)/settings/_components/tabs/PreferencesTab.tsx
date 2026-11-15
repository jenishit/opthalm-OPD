"use client";

import { toast } from "sonner";
import { Check, Settings } from "lucide-react";
import { Toggle } from "../Toggle";
import {
  ACCENTS,
  ACCENT_LABEL,
  ACCENT_SWATCH,
  FONTS,
  FONT_DESCRIPTION,
  FONT_LABEL,
  useAppearanceStore,
} from "@/lib/store/appearance";

export function PreferencesTab() {
  const accent = useAppearanceStore((s) => s.accent);
  const setAccent = useAppearanceStore((s) => s.setAccent);
  const font = useAppearanceStore((s) => s.font);
  const setFont = useAppearanceStore((s) => s.setFont);

  return (
    <>
      <div className="flex items-center justify-between gap-3 pb-[14px]">
        <div>
          <h3 className="m-0 font-display text-base font-semibold text-ink">Preferences</h3>
          <p className="m-0 mt-[5px] text-[10px] text-mute">Personal defaults for how the app looks and opens for you.</p>
        </div>
        <span className="grid size-[34px] shrink-0 place-items-center rounded-[9px] bg-t-new-soft text-t-new">
          <Settings size={18} />
        </span>
      </div>
      <div className="flex flex-col gap-5">
        <div>
          <span className="mb-2.5 block text-[10px] font-semibold text-mute">Accent color</span>
          <div className="flex flex-wrap gap-3">
            {ACCENTS.map((a) => (
              <button
                key={a}
                onClick={() => {
                  setAccent(a);
                  toast.info(`${ACCENT_LABEL[a]} accent applied`);
                }}
                aria-label={ACCENT_LABEL[a]}
                className="flex flex-col items-center gap-1.5"
              >
                <span
                  className="grid size-9 place-items-center rounded-full ring-2 ring-offset-2 transition-shadow"
                  style={{
                    backgroundColor: ACCENT_SWATCH[a],
                    boxShadow: "none",
                    outline: accent === a ? `2px solid ${ACCENT_SWATCH[a]}` : "none",
                    outlineOffset: 2,
                  }}
                >
                  {accent === a && <Check size={16} className="text-white" />}
                </span>
                <span className="text-[9px] text-mute">{ACCENT_LABEL[a]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="my-1 h-px bg-line" />

        <div>
          <span className="mb-2.5 block text-[10px] font-semibold text-mute">Typeface</span>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {FONTS.map((f) => (
              <button
                key={f}
                onClick={() => {
                  setFont(f);
                  toast.info(`${FONT_LABEL[f]} typeface applied`);
                }}
                className={
                  "flex flex-col items-start gap-1 rounded-[9px] border p-3 text-left transition-colors " +
                  (font === f ? "border-sage bg-sage-soft" : "border-line bg-card hover:border-strong")
                }
              >
                <div className="flex w-full items-center justify-between">
                  <b className="text-[11px] text-ink">{FONT_LABEL[f]}</b>
                  {font === f && <Check size={14} className="text-sage" />}
                </div>
                <span className="text-[9px] text-mute">{FONT_DESCRIPTION[f]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="my-1 h-px bg-line" />

        <div className="flex items-center justify-between gap-[15px] py-1">
          <div>
            <b className="text-[11px] text-ink">Compact sidebar</b>
            <p className="mt-[5px] text-[10px] text-mute">Collapse navigation labels to fit more on screen.</p>
          </div>
          <Toggle label="Toggle compact sidebar" />
        </div>
        <div className="flex items-center justify-between gap-[15px] py-1">
          <div>
            <b className="text-[11px] text-ink">Keyboard shortcuts</b>
            <p className="mt-[5px] text-[10px] text-mute">Enable quick-action shortcuts like F3 for barcode scan.</p>
          </div>
          <Toggle defaultOn label="Toggle keyboard shortcuts" />
        </div>
      </div>
    </>
  );
}
