import { create } from "zustand";
import type { VisitStatus } from "@/lib/schemas/visit.schema";

interface QueueState {
  statusFilter: VisitStatus | "all";
  setStatusFilter: (status: VisitStatus | "all") => void;
  
  dateFilter: Date;
  setDateFilter: (date: Date) => void;
}

export const useQueueStore = create<QueueState>((set) => ({
  statusFilter: "all",
  setStatusFilter: (status) => set({ statusFilter: status }),
  
  dateFilter: new Date(),
  setDateFilter: (date) => set({ dateFilter: date }),
}));
