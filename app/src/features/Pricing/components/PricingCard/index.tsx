import { CheckCircleEnterpriseIcon } from "@/assets/pricing/CheckCircleEnterpriseIcon";
import { CheckCircleIcon } from "@/assets/pricing/CheckCircleIcon";
import { CrossCircleIcon } from "@/assets/pricing/CrossCircleIcon";
import { TRIAL_DAYS_OFFER } from "@/constants/pricing";
import { useInfoPricing } from "@/hooks/pricing/useInfoPricing";
import { useCreateSubscription } from "@/queries/pricingQueries";
import type { IPricingFeature, TPlan } from "@/types/pricing";
import { useTranslation } from "react-i18next";


const PLAN_ORDER: Record<TPlan, number> = {
  free: 0,
  growth: 1,
  professional: 2,
};

interface IProps {
  plan: TPlan;
  currentPlan: TPlan;
  titleI18nKey: string;
  price: number | string;
  descriptionI18nKey: string;
  badgeI18nKey?: string;
  features: IPricingFeature[];
  isPopular?: boolean;
  isEnterprise?: boolean;
  /**
   * Overrides the default "call `POST /subscriptions` immediately" CTA behavior.
   * Used for the Free column's downgrade CTA, which must open the Loss Summary
   * modal instead of downgrading right away (unless the merchant is mid-trial).
   */
  onDowngradeClick?: () => void;
}

const PricingCard = ({
  plan,
  currentPlan,
  titleI18nKey,
  price,
  descriptionI18nKey,
  badgeI18nKey,
  features,
  isPopular = false,
  isEnterprise = false,
  onDowngradeClick,
}: IProps) => {
  const { t } = useTranslation();
  const { isTrialActive, trialDaysRemaining, isNerverChargeBefor } =
    useInfoPricing();

  const {
    mutate: createSubscription,
    isPending,
    isError,
  } = useCreateSubscription();

  const isCurrentPlan = plan === currentPlan;
  const isPlanFree = plan === "free";

  const isDowngrade = PLAN_ORDER[plan] < PLAN_ORDER[currentPlan];

  const buttonLabelI18nKey = isCurrentPlan
    ? "pricing.buttons_current_plan"
    : isNerverChargeBefor
      ? "pricing.buttons_start_trial"
      : isDowngrade
        ? `pricing.buttons_downgrade_${plan}`
        : `pricing.buttons_upgrade_${plan}`;

  const handleClick = ({ skip_trial }: { skip_trial?: boolean }) => {
    if (isCurrentPlan) return;
    if (isDowngrade && plan === "free" && onDowngradeClick) {
      onDowngradeClick();
      return;
    }
    createSubscription({ plan, skip_trial });
  };

  const cardClasses = `h-full flex flex-col rounded-xl overflow-hidden transition-transform duration-300 border-2 ${
    isPopular
      ? "border-brand-primary bg-white shadow-[0_8px_30px_rgb(0,0,0,0.08)] scale-[1.02] z-10"
      : isEnterprise
        ? "border-brand-professional-dark bg-brand-professional-dark text-white shadow-md"
        : "border-transparent bg-white ring-1 ring-gray-200 shadow-sm"
  }`;

  return (
    <div className={cardClasses}>
      {badgeI18nKey && (
        <div
          className={`flex justify-center -mt-px ${isPopular ? "bg-brand-primary" : isEnterprise ? "bg-brand-professional" : "bg-gray-200"} py-1`}
        >
          <span className="text-xs font-bold text-white tracking-widest uppercase rounded-full px-3 py-0.5">
            {t(badgeI18nKey)}
          </span>
        </div>
      )}

      <div className={`p-6 flex flex-col grow relative pt-8 ${plan === "free" ? "pt-[55px]" : ""}`}>
        <div className="mb-2">
          <h3
            className={`text-sm font-bold uppercase tracking-wider ${isPopular ? "text-brand-primary" : isEnterprise ? "text-brand-professional" : "text-gray-500"}`}
          >
            {t(titleI18nKey)}
          </h3>
        </div>

        <div className="mb-2 flex items-baseline gap-1">
          <span
            className={`text-[40px] font-bold tracking-tight ${isEnterprise ? "text-white" : "text-gray-900"}`}
          >
            {typeof price === "number" ? `$${price}` : price}
          </span>
          {typeof price === "number" && (
            <span
              className={`text-sm font-medium ${isEnterprise ? "text-gray-400" : "text-gray-500"}`}
            >
              /{t("common.txt_month")}
            </span>
          )}
        </div>

        <div className="mb-4 h-12 mt-1">
          <p
            className={`text-sm leading-relaxed ${isEnterprise ? "text-gray-300" : "text-gray-600"}`}
          >
            {t(descriptionI18nKey)}
          </p>
        </div>

        <div className="w-full min-h-14.5 flex flex-col items-center">
          <div className="w-full">
            {isCurrentPlan ? (
              <div
                className={`w-full text-center py-0.75 border rounded-lg text-[13px] font-semibold cursor-default ${
                  isPopular
                    ? "bg-brand-primary/10 border-brand-primary/30 text-brand-primary"
                    : isEnterprise
                      ? "bg-amber-500/10 border-amber-500/20 text-amber-300"
                      : "border-border-muted text-text-subdued bg-surface-muted "
                }`}
              >
                {t(buttonLabelI18nKey, {
                  trial_days: TRIAL_DAYS_OFFER,
                })}
              </div>
            ) : (
              <s-button
                inlineSize="fill"
                loading={isPending}
                onClick={() => handleClick({})}
                disabled={isCurrentPlan}
                variant={isCurrentPlan ? "secondary" : "primary"}
              >
                {t(buttonLabelI18nKey, {
                  trial_days: TRIAL_DAYS_OFFER,
                })}
              </s-button>
            )}
          </div>

          {!isPlanFree && isTrialActive && (
            <div className="mt-3 text-center flex flex-col gap-1 w-full">
              <p
                className={`text-xs ${isEnterprise ? "text-gray-400" : "text-gray-500"}`}
              >
                {t("pricing.trial_helper_text", {
                  trial_day: (trialDaysRemaining || TRIAL_DAYS_OFFER) + 1,
                })}
              </p>
              {trialDaysRemaining && trialDaysRemaining > 0 && (
                <s-stack
                  direction="inline"
                  alignItems="center"
                  justifyContent="center"
                  gap="small-400"
                >
                  <p
                    className={`text-[13px] font-medium ${isEnterprise ? "text-gray-300" : "text-gray-700"}`}
                  >
                    {t("pricing.trial_countdown", {
                      days_remaining: trialDaysRemaining,
                    })}
                  </p>
                  {isCurrentPlan && (
                    <s-link onClick={() => handleClick({ skip_trial: true })}>
                      {t("pricing.buttons_skip_trial")}
                    </s-link>
                  )}
                </s-stack>
              )}
            </div>
          )}

          {isError && (
            <p className="mt-1 text-xs text-center text-red-500">
              {t("pricing.error_cta_retry")}
            </p>
          )}
        </div>

        <ul className="mt-4 space-y-4 font-medium mb-8">
          {features.map((feature, index) => (
            <li key={index} className="flex gap-3 items-start">
              <div className="shrink-0 mt-0.5">
                {feature.included ? (
                  isEnterprise ? (
                    <CheckCircleEnterpriseIcon />
                  ) : (
                    <CheckCircleIcon />
                  )
                ) : (
                  <CrossCircleIcon />
                )}
              </div>
              <span
                className={`text-sm ${
                  feature.included
                    ? isEnterprise
                      ? "text-gray-200"
                      : "text-gray-700"
                    : isEnterprise
                      ? "text-gray-500"
                      : "text-gray-400"
                } ${feature.highlight ? "font-semibold" : ""}`}
              >
                {t(feature.nameI18nKey)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PricingCard;
