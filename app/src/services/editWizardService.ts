import type { IApiResponse } from "@/types/serviceType";
import type {
  IFilterEditRequestBody,
  IFilterMatchCountResponse,
  IFilterEditPreviewRequestBody,
  IFilterEditPreviewResponse,
  IProductPreviewDetailsRequestBody,
  IProductPreviewDetailsResponse,
  ITaskRun,
} from "@/types/editWizard";
import axiosService from "./axiosService";

export const getFilterMatchCount = async (
  body: IFilterEditRequestBody,
): Promise<IApiResponse<IFilterMatchCountResponse>> => {
  const res = await axiosService({
    url: `/products/filter-edit/count`,
    method: "POST",
    data: body,
  });

  const { data, status } = res;

  if (!status) throw new Error("Failed to fetch filter match count");

  return data;
};

export const getFilterEditPreview = async (
  body: IFilterEditPreviewRequestBody,
): Promise<IApiResponse<IFilterEditPreviewResponse>> => {
  const res = await axiosService({
    url: `/products/filter-edit/preview`,
    method: "POST",
    data: body,
  });

  const { data, status } = res;

  if (!status) throw new Error("Failed to fetch filter edit preview");

  return data;
};

export const getProductPreviewDetails = async (
  body: IProductPreviewDetailsRequestBody,
): Promise<IApiResponse<IProductPreviewDetailsResponse>> => {
  const res = await axiosService({
    url: `/products/filter-edit/preview/product-details`,
    method: "POST",
    data: body,
  });

  const { data, status } = res;

  if (!status) throw new Error("Failed to fetch product preview details");

  return data;
};

export const submitFilterEdit = async (
  body: IFilterEditPreviewRequestBody,
): Promise<IApiResponse<ITaskRun>> => {
  const res = await axiosService({
    url: `/task-runs/products/filter-edit`,
    method: "POST",
    data: body,
  });

  const { data, status } = res;

  if (!status) throw new Error("Failed to submit filter edit");

  return data;
};
