import { CSV_MAX_FILE_SIZE_MB } from "@/constants/csv";
import type { TShopStoreInfo } from "@/stores/shopStore";
import type {
  IFileSizeCheck,
  ITrialQuotaReminder,
  TCsvPlanStatus,
} from "@/types/csv";
import { isTrialActive } from "@/utils/pricing/planStatus";

export const deriveCsvPlanStatus = (
  shopInfo: Pick<TShopStoreInfo, "app_plan" | "trial_status">,
): TCsvPlanStatus => (isTrialActive(shopInfo) ? "trial" : shopInfo.app_plan);

export const getUploadZoneGateState = (
  planStatus: TCsvPlanStatus,
):
  | { locked: true; reason: "PLAN_LOCKED" }
  | { locked: false; maxFileSizeMb: number | null } =>
  planStatus === "free"
    ? { locked: true, reason: "PLAN_LOCKED" }
    : { locked: false, maxFileSizeMb: CSV_MAX_FILE_SIZE_MB[planStatus] };

export const validateFileSize = (
  planStatus: TCsvPlanStatus,
  fileSizeBytes: number,
): IFileSizeCheck => {
  const limitMb = CSV_MAX_FILE_SIZE_MB[planStatus];
  if (limitMb === null) return { blocked: false };

  const fileSizeMb = fileSizeBytes / (1024 * 1024);
  return fileSizeMb > limitMb
    ? { blocked: true, limitMb, fileSizeMb }
    : { blocked: false, limitMb, fileSizeMb };
};

export const getExportTriggerGateState = (
  planStatus: TCsvPlanStatus,
): { locked: boolean } => ({ locked: planStatus === "free" });

export const getTrialQuotaReminder = (
  shopInfo: Pick<TShopStoreInfo, "monthly_quota_used" | "monthly_quota_limit">,
): ITrialQuotaReminder | null => {
  if (shopInfo.monthly_quota_limit === null) return null;
  return {
    used: shopInfo.monthly_quota_used,
    limit: shopInfo.monthly_quota_limit,
    remaining: Math.max(
      0,
      shopInfo.monthly_quota_limit - shopInfo.monthly_quota_used,
    ),
  };
};
