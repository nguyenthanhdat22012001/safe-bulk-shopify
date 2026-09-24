import type { IApiResponse } from "@/types/serviceType";
import type {
  IPaginatedData,
  ITaskRun,
  ITaskRunItemGroup,
  ITaskRunListParams,
  ITaskRunListResource,
  TTaskRunItemPhase,
} from "@/types/editWizard";
import axiosService from "./axiosService";

export const getTaskRuns = async ({
  page = 1,
  limit = 10,
  search,
  status,
  operation_type,
  date_from,
  date_to,
}: ITaskRunListParams): Promise<IApiResponse<IPaginatedData<ITaskRunListResource>>> => {
  const res = await axiosService({
    url: `/task-runs`,
    method: "GET",
    params: { page, limit, search, status, operation_type, date_from, date_to },
  });

  const { data, status: resStatus } = res;

  if (!resStatus) throw new Error("Failed to fetch task runs");

  return data;
};

export const getTaskRun = async (
  IDtaskRun: number,
): Promise<IApiResponse<ITaskRun>> => {
  const res = await axiosService({
    url: `task-runs/${IDtaskRun}`,
    method: "GET",
  });

  const { data, status } = res;

  if (!status) throw new Error("Failed to fetch task run");

  return data;
};

export const getTaskRunItems = async (
  IDtaskRun: number,
  params: { page: number; phase: TTaskRunItemPhase },
): Promise<IApiResponse<IPaginatedData<ITaskRunItemGroup>>> => {
  const res = await axiosService({
    url: `task-runs/${IDtaskRun}/items`,
    method: "GET",
    params,
  });

  const { data, status } = res;

  if (!status) throw new Error("Failed to fetch task run items");

  return data;
};

export const undoTaskRun = async (
  IDtaskRun: number,
): Promise<IApiResponse<ITaskRun>> => {
  const res = await axiosService({
    url: `task-runs/${IDtaskRun}/undo`,
    method: "POST",
  });

  const { data, status } = res;

  if (!status) throw new Error("Failed to undo task run");

  return data;
};

export const cancelTaskRun = async (
  IDtaskRun: number,
): Promise<IApiResponse<ITaskRun>> => {
  const res = await axiosService({
    url: `task-runs/${IDtaskRun}/cancel`,
    method: "POST",
  });

  const { data, status } = res;

  if (!status) throw new Error("Failed to cancel task run");

  return data;
};

export const retryTaskRun = async (
  IDtaskRun: number,
): Promise<IApiResponse<ITaskRun>> => {
  const res = await axiosService({
    url: `task-runs/${IDtaskRun}/retry`,
    method: "POST",
  });

  const { data, status } = res;

  if (!status) throw new Error("Failed to retry task run");

  return data;
};
