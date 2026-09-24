import { CheckCircleGreen } from "@/assets/pricing/CheckCircleGreen";
import { CrossCircleGray } from "@/assets/pricing/CrossCircleGray";
import PaywallModal, {
  type TPaywallVariant,
} from "@/components/pricing/PaywallModal";
import TrialBanner from "@/components/pricing/TrialBanner";
import { ID_MODAL_SHOPIFY } from "@/constants/constantUnique";
import {
  DETAILED_COMPARISON,
  ENTERPRISE_FEATURES,
  FREE_FEATURES,
  PRO_FEATURES,
} from "@/constants/pricing";
import { useInfoPricing } from "@/hooks/pricing";
import { useCreateSubscription } from "@/queries/pricingQueries";
import { useShopStore } from "@/stores/shopStore";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import LossSummaryModal from "../components/LossSummaryModal";
import PricingCard from "../components/PricingCard";

const PricingView = () => {
  const { t } = useTranslation();

  const data = useShopStore((state) => state.shopInfo);
  const setShopInfo = useShopStore((state) => state.setShopInfo);

  const { mutate: createSubscription } = useCreateSubscription();
  const [paywallVariant, setPaywallVariant] =
    useState<TPaywallVariant>("product_limit");

  const { isTrialActive, currentPlan } = useInfoPricing();

  const handleFreeDowngradeClick = () => {
    if (isTrialActive) {
      // Active trial → skip the Loss Summary modal entirely (FR-011)
      createSubscription({ plan: "free" });
      setShopInfo({
        app_plan: "free",
      });
      return;
    }
    shopify.modal.show(ID_MODAL_SHOPIFY.pricing.modalLossSummary);
  };

  return (
    <s-page>
      <div className="flex flex-col gap-6 items-center">
        <div className="w-full">
          <TrialBanner
            subscription={data}
            onQuotaExhausted={() => {
              setPaywallVariant("trial_exhausted");
              shopify.modal.show(ID_MODAL_SHOPIFY.pricing.modalPaywall);
            }}
          />
        </div>
        <div className="text-center ">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 pb-1">
            {t("pricing.title")}
          </h1>
          <div className=" text-gray-500 font-medium">
            <p>{t("pricing.description")}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-[1000px] relative isolation-auto">
          <PricingCard
            plan="free"
            currentPlan={currentPlan}
            titleI18nKey="pricing.plans_free_title"
            price={0}
            descriptionI18nKey="pricing.plans_free_description"
            features={FREE_FEATURES}
            onDowngradeClick={handleFreeDowngradeClick}
          />

          <PricingCard
            plan="growth"
            currentPlan={currentPlan}
            titleI18nKey="pricing.plans_pro_title"
            price={5}
            descriptionI18nKey="pricing.plans_pro_description"
            badgeI18nKey="pricing.badges_most_popular"
            features={PRO_FEATURES}
            isPopular={true}
          />

          <PricingCard
            plan="professional"
            currentPlan={currentPlan}
            titleI18nKey="pricing.plans_enterprise_title"
            price={10}
            descriptionI18nKey="pricing.plans_enterprise_description"
            badgeI18nKey="pricing.badges_best_value"
            features={ENTERPRISE_FEATURES}
            isEnterprise={true}
          />
        </div>
        <div className="w-full ">
          <div className="bg-white rounded-xl ring-1 ring-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                {t("pricing.comparison_title")}
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-surface-subtle border-b border-gray-100">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-4 font-semibold text-gray-500 w-1/4"
                    >
                      {t("pricing.comparison_feature")}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 font-semibold text-gray-900 text-center w-1/4"
                    >
                      {t("pricing.comparison_free")}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 font-semibold text-brand-primary text-center w-1/4"
                    >
                      {t("pricing.comparison_pro")}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 font-semibold text-brand-professional text-center w-1/4"
                    >
                      {t("pricing.comparison_enterprise")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {DETAILED_COMPARISON.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4 font-medium text-gray-700">
                        {t(row.nameI18nKey)}
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-center">
                        <div className="flex justify-center">
                          {t(row.freeI18nKey) === "x" ? (
                            <CrossCircleGray />
                          ) : t(row.freeI18nKey) === "v" ? (
                            <CheckCircleGreen />
                          ) : (
                            t(row.freeI18nKey)
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-900 text-center">
                        <div className="flex justify-center">
                          {t(row.proI18nKey) === "x" ? (
                            <CrossCircleGray />
                          ) : t(row.proI18nKey) === "v" ? (
                            <CheckCircleGreen />
                          ) : (
                            t(row.proI18nKey)
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-900 text-center">
                        <div className="flex justify-center">
                          {t(row.enterpriseI18nKey) === "x" ? (
                            <CrossCircleGray />
                          ) : t(row.enterpriseI18nKey) === "v" ? (
                            <CheckCircleGreen />
                          ) : (
                            t(row.enterpriseI18nKey)
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>{" "}
      </div>
      <LossSummaryModal
        onApplyOffer={(discountCode) =>
          createSubscription({
            plan: "growth",
            discount_code: discountCode,
          })
        }
        onConfirmDowngrade={() => {
          createSubscription({ plan: "free" });
          setShopInfo({
            app_plan: "free",
          });
          shopify.modal.hide(ID_MODAL_SHOPIFY.pricing.modalLossSummary);
        }}
      />
      <PaywallModal variant={paywallVariant} pathReturn="/pricing" />
    </s-page>
  );
};

export default PricingView;
