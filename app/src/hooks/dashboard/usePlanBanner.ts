import { FREE_QUOTA_WARNING_THRESHOLD } from "@/constants/pricing";
import { useTrialBannerVisible } from "@/hooks/pricing";
import { useShopStore } from "@/stores/shopStore";

export type TPlanBanner =
  | { type: "trial" }
  | { type: "free_quota_warning" }
  | { type: "free_quota_exhausted" }
  | { type: "none" };

export const usePlanBanner = (): TPlanBanner => {
  const shopInfo = useShopStore((state) => state.shopInfo);
  const isTrialVisible = useTrialBannerVisible();

  if (isTrialVisible) {
    return { type: "trial" };
  }

  const isFreeQuotaExhausted =
    shopInfo.app_plan === "free" &&
    shopInfo.monthly_quota_limit !== null &&
    shopInfo.monthly_quota_used >= shopInfo.monthly_quota_limit;

  if (isFreeQuotaExhausted) {
    return { type: "free_quota_exhausted" };
  }

  const isFreeQuotaWarning =
    shopInfo.app_plan === "free" &&
    shopInfo.monthly_quota_limit !== null &&
    shopInfo.monthly_quota_limit > 0 &&
    shopInfo.monthly_quota_used / shopInfo.monthly_quota_limit >=
      FREE_QUOTA_WARNING_THRESHOLD;

  if (isFreeQuotaWarning) {
    return { type: "free_quota_warning" };
  }

  return { type: "none" };
};
