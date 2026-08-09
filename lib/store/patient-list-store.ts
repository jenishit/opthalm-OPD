import { create } from "zustand";

interface PatientListState {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  sortBy: "name" | "date" | "phone";
  setSortBy: (sort: "name" | "date" | "phone") => void;
}

export const usePatientListStore = create<PatientListState>((set) => ({
  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  sortBy: "name",
  setSortBy: (sort) => set({ sortBy: sort }),
}));
