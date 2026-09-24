// import html2canvas, { type Options as OptionsHtmlCanvas } from "html2canvas";
import type { IApiResponse } from "@/types/serviceType";
import type { IShopInfo } from "@/types/shop";
import type {
  IDiscountPreview,
  ISubscriptionChangePayload,
  ISubscriptionChangeResult,
  ISubscriptionStatus,
} from "@/types/pricing";
import axiosService from "./axiosService";

export const getInfoShop = async (): Promise<IApiResponse<IShopInfo>> => {
  const res = await axiosService({
    url: `/shop`,
    method: "GET",
  });

  const { data, status } = res;

  if (!status) throw new Error("Failed to fetch Shop info");

  return data;
};

export const updateShop = async (
  payload: Partial<Pick<IShopInfo, "onboarding_tasks">>,
): Promise<IApiResponse<IShopInfo>> => {
  const res = await axiosService({
    url: `/shop`,
    method: "PATCH",
    data: payload,
  });

  const { data, status } = res;

  if (!status) throw new Error("Failed to update Shop info");

  return data;
};

export const getSubscriptions = async (): Promise<
  IApiResponse<ISubscriptionStatus>
> => {
  const res = await axiosService({
    url: `/subscriptions`,
    method: "GET",
  });

  const { data, status } = res;

  if (!status) throw new Error("Failed to fetch Shop subscriptions");

  return data;
};
export const createSubscription = async (
  payload: ISubscriptionChangePayload,
): Promise<IApiResponse<ISubscriptionChangeResult>> => {
  const res = await axiosService({
    url: `/subscriptions`,
    method: "POST",
    data: payload,
  });

  const { data, status } = res;

  if (!status) throw new Error("Failed to create Shop subscription");

  return data;
};

export const getDiscountPreview = async (
  code: string,
): Promise<IApiResponse<IDiscountPreview>> => {
  const res = await axiosService({
    url: `/subscriptions/discount-preview`,
    method: "GET",
    params: { code },
  });

  const { data, status } = res;

  if (!status) throw new Error("Failed to fetch discount preview");

  return data;
};
