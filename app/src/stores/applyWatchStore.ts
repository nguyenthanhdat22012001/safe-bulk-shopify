import { create } from "zustand";

export interface IApplyWatchStore {
  pendingTaskRunId: number | null;
  lastTaskRunId: number | null;
  setPendingTaskRunId: (id: number | null) => void;
}

export const useApplyWatchStore = create<IApplyWatchStore>((set) => ({
  pendingTaskRunId: null,
  lastTaskRunId: null,
  setPendingTaskRunId: (id) =>
    set((state) => ({
      pendingTaskRunId: id,
      lastTaskRunId: id ?? state.lastTaskRunId,
    })),
}));
