import type { IApiResponse } from "@/types/serviceType";
import type { IFilterEditRequestBody, ITaskRun } from "@/types/editWizard";
import type {
  ICsvImportTaskRun,
  IImportConfigurationRequestBody,
  IImportPreviewFilters,
  IImportPreviewResult,
  IPreviewItemIgnoreResult,
} from "@/types/csv";
import axiosService from "./axiosService";

export const exportCsv = async (
  body: IFilterEditRequestBody,
): Promise<IApiResponse<ITaskRun>> => {
  const res = await axiosService({
    url: `/exports`,
    method: "POST",
    data: body,
  });

  const { data, status } = res;

  if (!status) throw new Error("Failed to export CSV");

  return data;
};

export const importCsv = async (
  file: File,
): Promise<IApiResponse<ICsvImportTaskRun>> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("resource_type", "product");

  const res = await axiosService({
    url: "/imports",
    method: "POST",
    data: formData,
  });

  const { data, status } = res;

  if (!status) throw new Error("Failed to import CSV");

  return data;
};

export const getImportTaskRun = async (
  id: number,
): Promise<IApiResponse<ICsvImportTaskRun>> => {
  const res = await axiosService({
    url: `/imports/${id}`,
    method: "GET",
  });

  const { data, status } = res;

  if (!status) throw new Error("Failed to fetch import task run");

  return data;
};

export const updateImportConfiguration = async (
  id: number,
  body: IImportConfigurationRequestBody,
): Promise<IApiResponse<ICsvImportTaskRun>> => {
  const res = await axiosService({
    url: `/imports/${id}/configuration`,
    method: "PUT",
    data: body,
  });

  const { data, status } = res;

  if (!status) throw new Error("Failed to update import configuration");

  return data;
};

export const getImportPreview = async (
  id: number,
  page: number,
  filters?: IImportPreviewFilters,
): Promise<IApiResponse<IImportPreviewResult>> => {
  const filter: Record<string, string> = {};
  if (filters?.warning) filter.warning = filters.warning;
  if (filters?.ignored) filter.ignored = filters.ignored;
  if (filters?.changed) filter.changed = filters.changed;

  const res = await axiosService({
    url: `/imports/${id}/preview`,
    method: "GET",
    params: {
      page,
      ...(Object.keys(filter).length > 0 ? { filter } : {}),
    },
  });

  const { data, status } = res;

  if (!status) throw new Error("Failed to fetch import preview");

  return data;
};

export const updatePreviewItemIgnored = async (
  id: number,
  itemId: number,
  ignored: boolean,
): Promise<IApiResponse<IPreviewItemIgnoreResult>> => {
  const res = await axiosService({
    url: `/imports/${id}/preview/items/${itemId}`,
    method: "PATCH",
    data: { ignored },
  });

  const { data, status } = res;

  if (!status) throw new Error("Failed to update preview item");

  return data;
};

export const runImport = async (
  id: number,
  configVersion: number,
): Promise<IApiResponse<ICsvImportTaskRun>> => {
  const res = await axiosService({
    url: `/imports/${id}/run`,
    method: "POST",
    data: { config_version: configVersion },
  });

  const { data, status } = res;

  if (!status) throw new Error("Failed to run import");

  return data;
};
