import { ID_MODAL_SHOPIFY } from "@/constants/constantUnique";
import { useSubmitFeedback } from "@/queries/feedbackQueries";
import { pricingQueries } from "@/queries/pricingQueries";
import { useShopStore } from "@/stores/shopStore";
import type { TDiscountType } from "@/types/pricing";
import { returnFormatNumber } from "@/utils/funcFormat";
import type { CallbackEvent } from "@shopify/polaris-types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface IProps {
  onApplyOffer: (discountCode: string) => void;
  onConfirmDowngrade: () => void;
  isPending?: boolean;
}

type TStep = "loss_summary" | "survey" | "downsell";

const DOWNSELL_DISCOUNT_CODE = "SAVE20";
const TOO_EXPENSIVE_REASON = "too_expensive";

const STEP_HEADING_I18N_KEY: Record<Exclude<TStep, "downsell">, string> = {
  loss_summary: "pricing.modal_loss_summary_title",
  survey: "pricing.modal_survey_title",
};

/**
 * Downgrade "Loss Summary" flow (data-model.md "State transitions (downgrade flow)"):
 * Loss Summary → reason survey → downsell offer (only if "Too expensive") → confirm.
 * Only rendered/opened when the merchant is a paying, non-trial subscriber (see
 * `views/index.tsx` — trial merchants skip this modal entirely per FR-011).
 */
const LossSummaryModal = ({
  onApplyOffer,
  onConfirmDowngrade,
  isPending = false,
}: IProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { mutate: submitFeedback } = useSubmitFeedback();
  const [step, setStep] = useState<TStep>("loss_summary");
  const [reason, setReason] = useState(TOO_EXPENSIVE_REASON);
  const [isCheckingOffer, setIsCheckingOffer] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

    const appPlan = useShopStore((state) => state.shopInfo.app_plan);
  const { data: preview } = useQuery({
    ...pricingQueries.getDiscountPreview(DOWNSELL_DISCOUNT_CODE),
    enabled: isModalOpen,
  });

  const formattedDiscountValue = (value: number, type: TDiscountType) =>
    type === "percentage" ? returnFormatNumber(value) : `$${returnFormatNumber(value)}`;

  const downsellHeading = preview
    ? t(
        preview.type === "percentage"
          ? "pricing.modal_downsell_title_percentage"
          : "pricing.modal_downsell_title_fixed",
        { value: formattedDiscountValue(preview.value, preview.type) },
      )
    : "";

  const handleSurveyChange = (event: CallbackEvent<"s-choice-list">) => {
    const [selected] = event.currentTarget.values;
    if (selected) setReason(selected);
  };

  const handleSurveyContinue = async () => {
    submitFeedback({
      category: "general",
      content: reason + (appPlan ? ` (app plan: ${appPlan})` : ""),
      metadata: { source_tag: "downgrade_survey" },
    });

    if (reason !== TOO_EXPENSIVE_REASON) {
      onConfirmDowngrade();
      return;
    }

    setIsCheckingOffer(true);
    try {
      await queryClient.fetchQuery(
        pricingQueries.getDiscountPreview(DOWNSELL_DISCOUNT_CODE),
      );
      setStep("downsell");
    } catch {
      onConfirmDowngrade(); // preview failed to load -> no offer, go straight to downgrade
    } finally {
      setIsCheckingOffer(false);
    }
  };

  return (
    <s-modal
      id={ID_MODAL_SHOPIFY.pricing.modalLossSummary}
      heading={step === "downsell" ? downsellHeading : t(STEP_HEADING_I18N_KEY[step])}
      onShow={() => {
        setStep("loss_summary");
        setReason(TOO_EXPENSIVE_REASON);
        setIsModalOpen(true);
      }}
      onHide={() => setIsModalOpen(false)}
    >
      {step === "loss_summary" && (
        <s-stack gap="base">
          <s-paragraph>{t("pricing.modal_loss_summary_products")}</s-paragraph>
          <s-paragraph>{t("pricing.modal_loss_summary_csv")}</s-paragraph>
          <s-paragraph>{t("pricing.modal_loss_summary_undo")}</s-paragraph>
        </s-stack>
      )}

      {step === "survey" && (
        <s-choice-list
          label={t("pricing.modal_survey_title")}
          name="downgrade-reason"
          values={[reason]}
          onInput={handleSurveyChange}
        >
          <s-choice value={TOO_EXPENSIVE_REASON}>
            {t("pricing.survey_option_too_expensive")}
          </s-choice>
          <s-choice value="difficult_to_use">
            {t("pricing.survey_option_difficult_to_use")}
          </s-choice>
          <s-choice value="lacks_features">
            {t("pricing.survey_option_lacks_features")}
          </s-choice>
          <s-choice value="temporarily_closing">
            {t("pricing.survey_option_temporarily_closing")}
          </s-choice>
        </s-choice-list>
      )}

      {step === "downsell" && preview && (
        <s-stack gap="base">
          <s-paragraph>{t("pricing.modal_downsell_description")}</s-paragraph>
          <s-stack direction="inline" alignItems="center" gap="small-400">
            <span className="line-through">
              <s-text color="subdued">
                {`$${returnFormatNumber(preview.prices.growth.original_price)}`}
              </s-text>
            </span>
            <s-text type="strong">
              {`$${returnFormatNumber(preview.prices.growth.discounted_price)}`}
            </s-text>
            <s-badge tone="success">
              {t(
                preview.type === "percentage"
                  ? "pricing.modal_downsell_savings_badge_percentage"
                  : "pricing.modal_downsell_savings_badge_fixed",
                { value: formattedDiscountValue(preview.value, preview.type) },
              )}
            </s-badge>
          </s-stack>
          <s-text color="subdued">
            {preview.duration_cycles == null
              ? t("pricing.modal_downsell_duration_ongoing")
              : t("pricing.modal_downsell_duration_limited", {
                  count: preview.duration_cycles,
                })}
          </s-text>
        </s-stack>
      )}

      {step === "loss_summary" && (
        <>
          <s-button
            slot="primary-action"
            variant="primary"
            commandFor={ID_MODAL_SHOPIFY.pricing.modalLossSummary}
            command="--hide"
          >
            {t("pricing.buttons_keep_current_plan")}
          </s-button>
          <s-button
            slot="secondary-actions"
            variant="secondary"
            onClick={() => setStep("survey")}
          >
            {t("pricing.buttons_continue_lose_features")}
          </s-button>
        </>
      )}

      {step === "survey" && (
        <s-button
          slot="primary-action"
          variant="primary"
          loading={isCheckingOffer}
          onClick={handleSurveyContinue}
        >
          {t("pricing.buttons_survey_continue")}
        </s-button>
      )}

      {step === "downsell" && preview && (
        <>
          <s-button
            slot="primary-action"
            variant="primary"
            loading={isPending}
            onClick={() => onApplyOffer(preview?.code ?? DOWNSELL_DISCOUNT_CODE)}
          >
            {t("pricing.buttons_apply_offer")}
          </s-button>
          <s-button
            slot="secondary-actions"
            variant="secondary"
            tone="critical"
            loading={isPending}
            onClick={onConfirmDowngrade}
          >
            {t("pricing.buttons_confirm_downgrade")}
          </s-button>
        </>
      )}
    </s-modal>
  );
};

export default LossSummaryModal;
