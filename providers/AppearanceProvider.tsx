"use client";

import { useEffect } from "react";
import { useAppearanceStore } from "@/lib/store/appearance";

/** Applies the persisted accent/font choice to <html> so every sage-derived and font-sans/display surface follows. */
export function AppearanceProvider({ children }: { children: React.ReactNode }) {
  const accent = useAppearanceStore((s) => s.accent);
  const font = useAppearanceStore((s) => s.font);

  useEffect(() => {
    document.documentElement.setAttribute("data-accent", accent);
  }, [accent]);

  useEffect(() => {
    document.documentElement.setAttribute("data-font", font);
  }, [font]);

  return <>{children}</>;
}
