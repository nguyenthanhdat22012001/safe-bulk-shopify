import {
  getFilterEditPreview,
  getFilterMatchCount,
  getProductPreviewDetails,
  submitFilterEdit,
} from "@/services/editWizardService";
import type {
  IFilterEditPreviewRequestBody,
  IFilterEditRequestBody,
  IProductPreviewDetailsRequestBody,
} from "@/types/editWizard";
import { queryOptions, useMutation } from "@tanstack/react-query";

export const EEditWizardQueryKeys = {
  filterMatchCount: "EEditWizardQueryKeys.filterMatchCount",
  filterEditPreview: "EEditWizardQueryKeys.filterEditPreview",
  productPreviewDetails: "EEditWizardQueryKeys.productPreviewDetails",
} as const;

export const EEditWizardQueries = {
  filterMatchCount: (body: IFilterEditRequestBody) =>
    queryOptions({
      queryKey: [EEditWizardQueryKeys.filterMatchCount, body],
      queryFn: async () => {
        const { status, data } = await getFilterMatchCount(body);
        if (!status) throw new Error("Failed to fetch filter match count");
        return data;
      },
    }),
  filterEditPreview: (
    body: IFilterEditPreviewRequestBody,
    previewRevision: number,
  ) =>
    queryOptions({
      queryKey: [EEditWizardQueryKeys.filterEditPreview, body, previewRevision],
      queryFn: async () => {
        const { status, data } = await getFilterEditPreview(body);
        if (!status) throw new Error("Failed to fetch filter edit preview");
        return data;
      },
    }),
  productPreviewDetails: (body: IProductPreviewDetailsRequestBody | null) =>
    queryOptions({
      queryKey: [EEditWizardQueryKeys.productPreviewDetails, body],
      queryFn: async () => {
        if (!body) throw new Error("Request body is null");
        const { status, data } = await getProductPreviewDetails(body);
        if (!status) throw new Error("Failed to fetch product preview details");
        return data;
      },
    }),
};

export const useSubmitFilterEdit = () => {
  return useMutation({
    mutationFn: async (body: IFilterEditPreviewRequestBody) => {
      const { status, data } = await submitFilterEdit(body);
      if (!status) throw new Error("Failed to submit filter edit");
      return data;
    },
  });
};
