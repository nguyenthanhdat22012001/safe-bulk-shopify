import {
  cancelTaskRun,
  getTaskRun,
  getTaskRunItems,
  getTaskRuns,
  retryTaskRun,
  undoTaskRun,
} from "@/services/taskRunService";
import { TASK_RUN_POLL_INTERVAL_MS } from "@/constants/csv";
import type {
  ITaskRunListParams,
  ITaskRunListResource,
  TTaskRunItemPhase,
  TTaskRunStatus,
} from "@/types/editWizard";
import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

export const ETaskRunQueryKeys = {
  taskRuns: "ETaskRunQueryKeys.taskRuns",
  taskRun: "ETaskRunQueryKeys.taskRun",
  taskRunItems: "ETaskRunQueryKeys.taskRunItems",
} as const;

/** Statuses meaning "still running in the background" — drives both the History
 * Table's polling interval and the Footer Info Banner's visibility. */
export const IN_FLIGHT_STATUSES: ReadonlySet<TTaskRunStatus> = new Set([
  "pending",
  "created",
  "running",
  "undoing",
]);

const hasInFlightRow = (rows: ITaskRunListResource[]): boolean =>
  rows.some((run) => IN_FLIGHT_STATUSES.has(run.status));

export const taskRunQueries = {
  taskRuns: (params: ITaskRunListParams) =>
    queryOptions({
      queryKey: [ETaskRunQueryKeys.taskRuns, params],
      queryFn: async () => {
        const { status, data } = await getTaskRuns(params);
        if (!status) throw new Error("Failed to fetch task runs");
        return data;
      },
      refetchInterval: (query) => {
        const rows = query.state.data?.data ?? [];
        return hasInFlightRow(rows) ? 4000 : false;
      },
    }),
  taskRun: (id: number | null) =>
    queryOptions({
      queryKey: [ETaskRunQueryKeys.taskRun, id],
      queryFn: async () => {
        if (!id) throw new Error("Task run ID is required");
        const { status, data } = await getTaskRun(id);
        if (!status) throw new Error("Failed to fetch task run");
        return data;
      },
      refetchInterval: (query) => {
        const run = query.state.data;
        return run && IN_FLIGHT_STATUSES.has(run.status)
          ? TASK_RUN_POLL_INTERVAL_MS
          : false;
      },
    }),
  taskRunItems: (id: number, phase: TTaskRunItemPhase, page: number) =>
    queryOptions({
      queryKey: [ETaskRunQueryKeys.taskRunItems, id, phase, page],
      queryFn: async () => {
        const { status, data } = await getTaskRunItems(id, { page, phase });
        if (!status) throw new Error("Failed to fetch task run items");
        return data;
      },
    }),
};

export const useUndoTaskRun = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (IDtaskRun: number) => {
      const { status, data } = await undoTaskRun(IDtaskRun);
      if (!status) throw new Error("Failed to undo task run");
      return data;
    },
    onSettled: (_data, _error, IDtaskRun) => {
      queryClient.invalidateQueries({ queryKey: [ETaskRunQueryKeys.taskRuns] });
      queryClient.invalidateQueries({ queryKey: [ETaskRunQueryKeys.taskRun, IDtaskRun] });
      queryClient.invalidateQueries({ queryKey: [ETaskRunQueryKeys.taskRunItems, IDtaskRun] });
    },
  });
};

export const useCancelTaskRun = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (IDtaskRun: number) => {
      const { status, data } = await cancelTaskRun(IDtaskRun);
      if (!status) throw new Error("Failed to cancel task run");
      return data;
    },
    onSuccess: (_data, IDtaskRun) => {
      queryClient.invalidateQueries({ queryKey: [ETaskRunQueryKeys.taskRuns] });
      queryClient.invalidateQueries({ queryKey: [ETaskRunQueryKeys.taskRun, IDtaskRun] });
    },
  });
};

export const useRetryTaskRun = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (IDtaskRun: number) => {
      const { status, data } = await retryTaskRun(IDtaskRun);
      if (!status) throw new Error("Failed to retry task run");
      return data;
    },
    onSuccess: (_data, IDtaskRun) => {
      queryClient.invalidateQueries({ queryKey: [ETaskRunQueryKeys.taskRuns] });
      queryClient.invalidateQueries({ queryKey: [ETaskRunQueryKeys.taskRun, IDtaskRun] });
    },
  });
};

export const useDownloadTaskRun = () => {
  return useMutation({
    mutationFn: async (IDtaskRun: number) => {
      const { status, data } = await getTaskRun(IDtaskRun);
      if (!status) throw new Error("Failed to fetch task run");
      return data;
    },
  });
};
