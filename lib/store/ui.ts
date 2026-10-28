import { create } from "zustand";

export type IntakeTab =
  | "chief-complaint"
  | "symptoms"
  | "refraction"
  | "examination"
  | "investigations"
  | "diagnosis"
  | "treatment";

interface UiState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  activeIntakeTab: IntakeTab;
  setActiveIntakeTab: (tab: IntakeTab) => void;

  /** Staff-wide calendar preference for date pickers (BS default). */
  calendarMode: "BS" | "AD";
  setCalendarMode: (mode: "BS" | "AD") => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: true,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  activeIntakeTab: "chief-complaint",
  setActiveIntakeTab: (tab) => set({ activeIntakeTab: tab }),

  calendarMode: "BS",
  setCalendarMode: (mode) => set({ calendarMode: mode }),
}));
