import { normalizePlan } from "@/constants/pricing";
import { useShopStore } from "@/stores/shopStore";

export const useInfoPricing = () => {
  const subscription = useShopStore((state) => state.shopInfo);

  const isTrialActive =
    subscription?.trial_status === null ||
    subscription?.trial_status === "started" ||
    subscription?.trial_status === "holding";

  const isNerverChargeBefor = subscription?.trial_status === null;

  const currentPlan = normalizePlan(subscription?.app_plan);
  const trialDaysRemaining = subscription?.trial_days_remaining;

  return {
    isTrialActive,
    currentPlan,
    trialDaysRemaining,
    isNerverChargeBefor
  };
};
