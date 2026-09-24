import { ID_MODAL_SHOPIFY } from "@/constants/constantUnique";
import { useCreateSubscription } from "@/queries/pricingQueries";
import type { EPlanLimitContext, TPlan } from "@/types/pricing";
import { useTranslation } from "react-i18next";

export type TPaywallVariant = EPlanLimitContext | "trial_exhausted";

interface IProps {
  /** Route the merchant lands back on after completing the upgrade checkout. */
  pathReturn?: string;
  /** Which paywall context to display — controlled by the parent before calling shopify.modal.show(). */
  variant: TPaywallVariant;
}

interface IPaywallVariantConfig {
  titleI18nKey: string;
  descriptionI18nKey: string;
  ctaI18nKey: string;
  plan: Extract<TPlan, "growth" | "professional">;
  skipTrial?: boolean;
}

const VARIANT_CONFIG: Record<TPaywallVariant, IPaywallVariantConfig> = {
  product_limit: {
    titleI18nKey: "pricing.modal_paywall_product_limit_title",
    descriptionI18nKey: "pricing.modal_paywall_product_limit_description",
    ctaI18nKey: "pricing.buttons_upgrade_growth",
    plan: "growth",
  },
  csv_feature: {
    titleI18nKey: "pricing.modal_paywall_csv_title",
    descriptionI18nKey: "pricing.modal_paywall_csv_description",
    ctaI18nKey: "pricing.buttons_upgrade_growth",
    plan: "growth",
  },
  undo_expired: {
    titleI18nKey: "pricing.modal_paywall_undo_expired_title",
    descriptionI18nKey: "pricing.modal_paywall_undo_expired_description",
    ctaI18nKey: "pricing.buttons_upgrade_growth",
    plan: "growth",
  },
  staff_permissions: {
    titleI18nKey: "pricing.modal_paywall_staff_permissions_title",
    descriptionI18nKey: "pricing.modal_paywall_staff_permissions_description",
    ctaI18nKey: "pricing.buttons_upgrade_professional",
    plan: "professional",
  },
  trial_exhausted: {
    titleI18nKey: "pricing.modal_early_paywall_title",
    descriptionI18nKey: "pricing.modal_early_paywall_description",
    ctaI18nKey: "pricing.buttons_activate_pro",
    plan: "growth",
    skipTrial: true,
  },
};

/**
 * Generic paywall modal, reused for every `EPlanLimitContext` variant raised
 * anywhere in the app (via `usePlanLimitErrorHandler`) plus the trial early-paywall
 * (User Story 3). Its primary CTA always resolves the limitation with the plan
 * appropriate to that context (FR-016).
 *
 * Open programmatically via:
 *   shopify.modal.show(ID_MODAL_SHOPIFY.pricing.modalPaywall)
 * Set the `variant` prop on the parent before calling show().
 */
const PaywallModal = ({ variant }: IProps) => {
  const { t } = useTranslation();
  const { mutate: createSubscription, isPending } = useCreateSubscription();

  const config = VARIANT_CONFIG[variant];

  const handleUpgrade = () => {
    createSubscription({
      plan: config.plan,
      ...(config.skipTrial ? { skip_trial: true } : {}),
    });
  };

  return (
    <s-modal
      id={ID_MODAL_SHOPIFY.pricing.modalPaywall}
      heading={t(config.titleI18nKey)}
    >
      <s-paragraph>{t(config.descriptionI18nKey)}</s-paragraph>

      <s-button
        slot="primary-action"
        variant="primary"
        loading={isPending}
        onClick={handleUpgrade}
      >
        {t(config.ctaI18nKey)}
      </s-button>
      <s-button
        slot="secondary-actions"
        variant="secondary"
        commandFor={ID_MODAL_SHOPIFY.pricing.modalPaywall}
        command="--hide"
      >
        {t("pricing.buttons_maybe_later")}
      </s-button>
    </s-modal>
  );
};

export default PaywallModal;
