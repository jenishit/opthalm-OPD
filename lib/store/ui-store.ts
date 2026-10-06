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
}

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  activeIntakeTab: "chief-complaint",
  setActiveIntakeTab: (tab) => set({ activeIntakeTab: tab }),
}));
