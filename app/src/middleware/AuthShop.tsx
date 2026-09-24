import { pricingQueries } from "@/queries/pricingQueries";
import { queriesShopify } from "@/queries/queriesShopify";
import { shopQueries } from "@/queries/shopQueries";
import { shopStatesQueries } from "@/queries/shopStatesQueries";
import { useFeedbackStateStore } from "@/stores/feedbackStateStore";
import { useShopStore } from "@/stores/shopStore";
import { useQueries } from "@tanstack/react-query";
import { useEffect, type PropsWithChildren } from "react";
import { useTranslation } from "react-i18next";

const AuthShop = ({ children }: PropsWithChildren) => {
  const { t } = useTranslation();

  const setShopInfo = useShopStore((state) => state.setShopInfo);
  const setFeedbackState = useFeedbackStateStore((state) => state.setFeedbackState);
  const setIsFeedbackStateLoaded = useFeedbackStateStore((state) => state.setIsLoaded);

  const [
    {
      isLoading: isLoadingStore,
      data: dataInfoShop,
      isError: isErrorStore,
      refetch: refetchStore,
    },
    {
      isLoading: isLoadingPricing,
      data: dataPricing,
      isError: isErrorPricing,
      refetch: refetchPricing,
    },
    { data: dataShopFromShopify },
    { data: dataFeedbackState },
  ] = useQueries({
    queries: [
      {
        ...shopQueries.getInfoShop,
      },
      {
        ...pricingQueries.getSubscriptions,
        refetchOnWindowFocus: true,
      },
      {
        ...queriesShopify.getDetailShopFromShopify,
      },
      {
        ...shopStatesQueries.feedbackNamespace(),
      },
    ],
  });

  // update shop info from store api
  useEffect(() => {
    if (!dataInfoShop) return;

    const { id, shopify_domain, app_plan, email, onboarding_tasks, created_at } =
      dataInfoShop;
    setShopInfo({ id, shopify_domain, app_plan, email, onboarding_tasks, created_at });
  }, [dataInfoShop]);

  // update subscription info from pricing api
  useEffect(() => {
    if (!dataPricing) return;

    const {
      trial_status,
      trial_days_remaining,
      trial_days_offer,
      monthly_quota_used,
      monthly_quota_limit,
      monthly_resets_at,
    } = dataPricing;
    setShopInfo({
      trial_status,
      trial_days_remaining,
      trial_days_offer,
      monthly_quota_used,
      monthly_quota_limit,
      monthly_resets_at,
    });
  }, [dataPricing]);

  // update timezone and currency from shopify api
  useEffect(() => {
    if (!dataShopFromShopify) return;
    setShopInfo({
      timezone: dataShopFromShopify.shop.ianaTimezone,
      currency: dataShopFromShopify.shop.currencyCode,
    });
  }, [dataShopFromShopify]);

  // load feedback shop-states once at bootstrap (spec 8.2 — single GET, shared everywhere)
  useEffect(() => {
    if (!dataFeedbackState) return;
    setFeedbackState(dataFeedbackState);
    setIsFeedbackStateLoaded(true);
  }, [dataFeedbackState]);

  if (isLoadingStore || isLoadingPricing) {
    shopify.loading(true);
    return null;
  }

  shopify.loading(false);

  if (isErrorStore || isErrorPricing) {
    return (
      <s-page>
        <s-banner heading={t("common.error")} tone="critical">
          {t("common.error_description")}
          <s-button
            slot="secondary-actions"
            variant="secondary"
            onClick={() => {
              // refetch logic for all queries
              refetchStore();
              refetchPricing();
            }}
          >
            {t("common.buttons_retry")}
          </s-button>
        </s-banner>
      </s-page>
    );
  }

  return <>{children}</>;
};

export default AuthShop;
