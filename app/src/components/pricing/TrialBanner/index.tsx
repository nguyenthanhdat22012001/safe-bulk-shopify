import ProgressBar from "@/components/commonUIs/ProgressBar";
import { useTrialBannerVisible } from "@/hooks/pricing";
import type { ISubscriptionStatus } from "@/types/pricing";
import { returnFormatNumber } from "@/utils/funcFormat";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

interface IProps {
  subscription?: ISubscriptionStatus;
  /**
   * Called once when the trial's product quota is fully consumed while days
   * remain in the trial (FR-014 early paywall trigger). Not called again for
   * the same subscription snapshot.
   */
  onQuotaExhausted?: () => void;
}

/**
 * 7-day growth trial banner (User Story 3). Only renders while `trial_status` is
 * `"started"` or `"holding"` — hidden for every other value, including `null`
 * (FR-013, data-model.md validation rules).
 */
const TrialBanner = ({ subscription, onQuotaExhausted }: IProps) => {
  const { t } = useTranslation();
  const hasNotifiedExhaustionRef = useRef(false);

  const isVisible = useTrialBannerVisible();

  const trialDaysRemaining = subscription?.trial_days_remaining ?? 0;
  const totalDays = subscription?.trial_days_offer ?? 7;
  const currentDay = Math.min(totalDays, Math.max(1, totalDays - trialDaysRemaining + 1));
  const quotaUsed = subscription?.monthly_quota_used ?? 0;
  const quotaLimit = subscription?.monthly_quota_limit ?? 0;
  const isQuotaExhausted = quotaLimit > 0 && quotaUsed >= quotaLimit;
  const isTrialActive =
    subscription?.trial_status === "started" || subscription?.trial_status === "holding";

  useEffect(() => {
    if (
      isTrialActive &&
      isQuotaExhausted &&
      trialDaysRemaining > 0 &&
      !hasNotifiedExhaustionRef.current
    ) {
      hasNotifiedExhaustionRef.current = true;
      onQuotaExhausted?.();
    }
  }, [isTrialActive, isQuotaExhausted, trialDaysRemaining, onQuotaExhausted]);

  if (!isVisible) return null;

  const usagePercent =
    quotaLimit > 0
      ? Math.min(100, Math.round((quotaUsed / quotaLimit) * 100))
      : 0;

  return (
    <s-banner
      heading={t("pricing.banner_trial_title", {
        currentDay,
        totalDays,
        used: returnFormatNumber(quotaUsed),
        limit: returnFormatNumber(quotaLimit),
      })}
      tone="info"
    >
      <s-paragraph>{t("pricing.banner_trial_description")}</s-paragraph>
      <ProgressBar percent={usagePercent} label={t("pricing.banner_trial_progress_label")} />
    </s-banner>
  );
};

export default TrialBanner;
