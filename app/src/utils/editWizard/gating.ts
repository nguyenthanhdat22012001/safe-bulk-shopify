import { MINIMUM_THRESHOLD, PER_EDIT_LIMIT } from "@/constants/editWizard";
import type { TShopStoreInfo } from "@/stores/shopStore";
import type { IQuotaGating, TLimitReason } from "@/types/editWizard";
import { derivePlanStatus } from "@/utils/pricing/planStatus";

export { derivePlanStatus } from "@/utils/pricing/planStatus";

export const getLimitReason = (
  gating: Omit<IQuotaGating, "limit_reason">,
): TLimitReason => {
  const { plan_status, matched_count, effective_limit_this_request, monthly_remaining, per_edit_limit } =
    gating;

  if (effective_limit_this_request === null || matched_count <= effective_limit_this_request) {
    return "NONE";
  }

  if (plan_status === "free") {
    if (monthly_remaining === null || monthly_remaining < MINIMUM_THRESHOLD) {
      return "FREE_MONTHLY_EXHAUSTED";
    }
    if (per_edit_limit !== null && monthly_remaining < per_edit_limit) {
      return "FREE_MONTHLY_LOW";
    }
    return "FREE_PER_EDIT";
  }

  if (plan_status === "trial") {
    if (monthly_remaining === null || monthly_remaining < MINIMUM_THRESHOLD) {
      return "TRIAL_EXHAUSTED";
    }
    return "TRIAL_LOW";
  }

  return "NONE";
};

export const computeQuotaGating = (
  matchedCount: number,
  shopInfo: Pick<
    TShopStoreInfo,
    "app_plan" | "trial_status" | "monthly_quota_used" | "monthly_quota_limit"
  >,
): IQuotaGating => {
  const plan_status = derivePlanStatus(shopInfo);
  const per_edit_limit = plan_status === "paid" ? null : PER_EDIT_LIMIT[plan_status];
  const monthly_used = shopInfo.monthly_quota_used;
  const monthly_limit = shopInfo.monthly_quota_limit;
  const monthly_remaining =
    monthly_limit === null ? null : Math.max(0, monthly_limit - monthly_used);

  const effective_limit_this_request =
    plan_status === "paid" || per_edit_limit === null
      ? null
      : monthly_remaining === null
        ? per_edit_limit
        : Math.min(per_edit_limit, monthly_remaining);

  const gatingWithoutReason: Omit<IQuotaGating, "limit_reason"> = {
    plan_status,
    per_edit_limit,
    monthly_used,
    monthly_limit,
    monthly_remaining,
    effective_limit_this_request,
    matched_count: matchedCount,
  };

  return {
    ...gatingWithoutReason,
    limit_reason: getLimitReason(gatingWithoutReason),
  };
};
