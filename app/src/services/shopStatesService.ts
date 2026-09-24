import type { IApiResponse } from "@/types/serviceType";
import type {
  IShopStatesFeedbackNamespace,
  IShopStatesPatchBody,
} from "@/types/feedback";
import axiosService from "./axiosService";

export const getShopStatesFeedback = async (): Promise<
  IApiResponse<{ feedback: IShopStatesFeedbackNamespace }>
> => {
  const res = await axiosService({
    url: "/shop-states",
    method: "GET",
    params: { namespaces: ["feedback"] },
  });

  const { data, status } = res;

  if (!status) throw new Error("Failed to fetch shop states");

  return data;
};

export const patchShopStatesFeedback = async (
  feedback: Partial<IShopStatesFeedbackNamespace>,
): Promise<IApiResponse<{ feedback: IShopStatesFeedbackNamespace }>> => {
  const body: IShopStatesPatchBody = { states: { feedback } };

  const res = await axiosService({
    url: "/shop-states",
    method: "PATCH",
    data: body,
  });

  const { data, status } = res;

  if (!status) throw new Error("Failed to update shop states");

  return data;
};
