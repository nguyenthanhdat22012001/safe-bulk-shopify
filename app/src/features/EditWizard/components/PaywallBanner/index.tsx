import PaywallModal, {
  type TPaywallVariant,
} from "@/components/pricing/PaywallModal";
import { ID_MODAL_SHOPIFY } from "@/constants/constantUnique";
import { SORT_BY_OPTIONS } from "@/constants/editWizard";
import { useFormat } from "@/hooks/shopify";
import type { IQuotaGating, TSortBy } from "@/types/editWizard";
import { returnFormatNumber } from "@/utils/funcFormat";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface IProps {
  gating: IQuotaGating;
  sortBy: TSortBy;
  onSortByChange: (value: TSortBy) => void;
  onProcessFirstN: () => void;
  monthlyResetsAt: string | null;
}

const BRANCH_A_REASONS = new Set([
  "FREE_PER_EDIT",
  "FREE_MONTHLY_LOW",
  "TRIAL_LOW",
]);

const PaywallBanner = ({
  gating,
  sortBy,
  onSortByChange,
  onProcessFirstN,
  monthlyResetsAt,
}: IProps) => {
  const { t } = useTranslation();
  const { returnFormatDate } = useFormat();
  const [paywallVariant, setPaywallVariant] =
    useState<TPaywallVariant>("product_limit");

  if (gating.limit_reason === "NONE") return null;

  const isBranchA = BRANCH_A_REASONS.has(gating.limit_reason);
  const reasonKey = gating.limit_reason.toLowerCase();

  const handleUpgradeClick = () => {
    setPaywallVariant(
      gating.plan_status === "trial" ? "trial_exhausted" : "product_limit",
    );
    shopify.modal.show(ID_MODAL_SHOPIFY.pricing.modalPaywall);
  };

  return (
    <>
      <s-banner
        tone={isBranchA ? "warning" : "critical"}
        heading={t(`edit_wizard.banner_gating_${reasonKey}_title`)}
      >
        <div className="flex flex-col gap-3">
          <s-paragraph>
            {t(`edit_wizard.banner_gating_${reasonKey}_description`, {
              effectiveLimit:
                gating.effective_limit_this_request !== null
                  ? returnFormatNumber(gating.effective_limit_this_request)
                  : "",
              matchedCount: returnFormatNumber(gating.matched_count),
              resetsAt: monthlyResetsAt
                ? returnFormatDate(monthlyResetsAt, { dateStyle: "medium" })
                : "",
            })}
          </s-paragraph>

          {isBranchA && (
            <s-select
              label={t("edit_wizard.label_sort_by")}
              value={sortBy}
              onInput={(e) => onSortByChange(e.currentTarget.value as TSortBy)}
            >
              {SORT_BY_OPTIONS.map((option) => (
                <s-option key={option.value} value={option.value}>
                  {t(option.labelI18nKey)}
                </s-option>
              ))}
            </s-select>
          )}

          <div className="flex gap-4">
            <s-button onClick={onProcessFirstN}>
              {t("edit_wizard.button_process_first_n", {
                count:
                  gating.effective_limit_this_request !== null
                    ? returnFormatNumber(gating.effective_limit_this_request)
                    : "",
              })}
            </s-button>
            <s-button variant="primary" onClick={handleUpgradeClick}>
              {t(
                isBranchA
                  ? "edit_wizard.button_upgrade_process_all"
                  : "edit_wizard.button_upgrade_now",
                { count: returnFormatNumber(gating.matched_count) },
              )}
            </s-button>
          </div>
        </div>
      </s-banner>

      <PaywallModal variant={paywallVariant} pathReturn="/edit-wizard" />
    </>
  );
};

export default PaywallBanner;
