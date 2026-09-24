import { create } from "zustand";
import type { IShopInfo } from "@/types/shop";
import type { ISubscriptionStatus } from "@/types/pricing";

export type TShopStoreInfo = Pick<
  IShopInfo,
  "id" | "shopify_domain" | "app_plan" | "email" | "onboarding_tasks" | "created_at"
> &
  Pick<
    ISubscriptionStatus,
    | "trial_status"
    | "trial_days_remaining"
    | "trial_days_offer"
    | "monthly_quota_used"
    | "monthly_quota_limit"
    | "monthly_resets_at"
  > & {
    timezone: string;
    currency: string;
  };

export interface IShopStoreState {
  shopInfo: TShopStoreInfo;
  setShopInfo: (shopInfo: Partial<TShopStoreInfo>) => void;
}

export const useShopStore = create<IShopStoreState>((set) => ({
  shopInfo: {
    app_plan: "free",
    id: 0,
    shopify_domain: "",
    email: "",
    onboarding_tasks: [],
    created_at: "",
    trial_status: null,
    trial_days_remaining: null,
    trial_days_offer: 0,
    monthly_quota_used: 0,
    monthly_quota_limit: 0,
    monthly_resets_at: null,
    timezone: "",
    currency: "",
  },
  setShopInfo: (payload: Partial<TShopStoreInfo>) =>
    set((state) => {
      return {
        shopInfo: state.shopInfo
          ? { ...state.shopInfo, ...payload }
          : (payload as TShopStoreInfo),
      };
    }),
}));
