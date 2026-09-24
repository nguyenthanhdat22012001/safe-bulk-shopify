import { useShopStore } from "@/stores/shopStore";

export const useTrialBannerVisible = (): boolean => {
  const subscription = useShopStore((state) => state.shopInfo);

  const trialDaysRemaining = subscription.trial_days_remaining ?? 0;
  const quotaUsed = subscription.monthly_quota_used ?? 0;
  const quotaLimit = subscription.monthly_quota_limit ?? 0;

  const isTrialActive =
    (subscription.trial_status === "started" || subscription.trial_status === "holding") &&
    trialDaysRemaining > 0;

  const usagePercent =
    quotaLimit > 0 ? Math.min(100, Math.round((quotaUsed / quotaLimit) * 100)) : 0;

  return isTrialActive && usagePercent > 0;
};
