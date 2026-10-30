import { create } from "zustand";
import { persist } from "zustand/middleware";

export const ACCENTS = ["sage", "clay", "blue", "violet", "gold"] as const;
export type Accent = (typeof ACCENTS)[number];

export const FONTS = ["default", "rounded", "editorial"] as const;
export type FontChoice = (typeof FONTS)[number];

export const ACCENT_LABEL: Record<Accent, string> = {
  sage: "Sage",
  clay: "Clay",
  blue: "Blue",
  violet: "Violet",
  gold: "Gold",
};

export const ACCENT_SWATCH: Record<Accent, string> = {
  sage: "#2D5A27",
  clay: "#B35A3F",
  blue: "#2F6DB5",
  violet: "#7A4FB0",
  gold: "#96700D",
};

export const FONT_LABEL: Record<FontChoice, string> = {
  default: "Default",
  rounded: "Rounded",
  editorial: "Editorial",
};

export const FONT_DESCRIPTION: Record<FontChoice, string> = {
  default: "Source Sans body, Lora headings",
  rounded: "Poppins throughout — softer, modern",
  editorial: "Source Sans body, Instrument Serif headings",
};

interface AppearanceState {
  accent: Accent;
  font: FontChoice;
  setAccent: (accent: Accent) => void;
  setFont: (font: FontChoice) => void;
}

export const useAppearanceStore = create<AppearanceState>()(
  persist(
    (set) => ({
      accent: "sage",
      font: "default",
      setAccent: (accent) => set({ accent }),
      setFont: (font) => set({ font }),
    }),
    { name: "eye-clinic-appearance" }
  )
);
