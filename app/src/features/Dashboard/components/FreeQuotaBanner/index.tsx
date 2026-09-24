import { useCreateSubscription } from "@/queries/pricingQueries";
import { useFormat } from "@/hooks/shopify";
import { returnFormatNumber } from "@/utils/funcFormat";
import { useTranslation } from "react-i18next";

interface IProps {
  variant: "warning" | "exhausted";
  quotaUsed: number;
  quotaLimit: number;
  resetsAt: string | null;
}

const PRO_PLAN_PRICE = 14.99;

const FreeQuotaBanner = ({
  variant,
  quotaUsed,
  quotaLimit,
  resetsAt,
}: IProps) => {
  const { t } = useTranslation();
  const { returnFormatDate, returnFormatCurrency } = useFormat();
  const { mutate: createSubscription, isPending } = useCreateSubscription();

  const handleUpgrade = () => createSubscription({ plan: "growth" });

  return (
    <>
      <s-banner
        tone="warning"
        heading={t(`pricing.banner_free_quota_${variant}_title`)}
      >
        <s-stack gap="base">
          <s-paragraph>
            {t(`pricing.banner_free_quota_${variant}_description`, {
              used: returnFormatNumber(quotaUsed),
              limit: returnFormatNumber(quotaLimit),
              resetsAt: resetsAt
                ? returnFormatDate(resetsAt, { dateStyle: "medium" })
                : "",
            })}
          </s-paragraph>

          <s-button
            variant="primary"
            loading={isPending}
            onClick={handleUpgrade}
          >
            {t("pricing.banner_free_quota_button_upgrade", {
              price: returnFormatCurrency(PRO_PLAN_PRICE),
            })}
          </s-button>
        </s-stack>
      </s-banner>
    </>
  );
};

export default FreeQuotaBanner;
