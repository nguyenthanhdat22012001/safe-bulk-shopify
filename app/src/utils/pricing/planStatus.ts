import type { TShopStoreInfo } from "@/stores/shopStore";
import type { TPlanStatus } from "@/types/editWizard";

export const isTrialActive = (
  shopInfo: Pick<TShopStoreInfo, "app_plan" | "trial_status">,
): boolean =>
  shopInfo.app_plan === "growth" &&
  (shopInfo.trial_status === "started" || shopInfo.trial_status === "holding");

export const derivePlanStatus = (
  shopInfo: Pick<TShopStoreInfo, "app_plan" | "trial_status">,
): TPlanStatus => {
  if (isTrialActive(shopInfo)) return "trial";
  if (shopInfo.app_plan === "free") return "free";
  return "paid";
};
