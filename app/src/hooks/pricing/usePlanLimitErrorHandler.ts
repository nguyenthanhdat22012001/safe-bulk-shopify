import type { TPaywallVariant } from "@/components/pricing/PaywallModal";
import { ID_MODAL_SHOPIFY } from "@/constants/constantUnique";
import type { IPlanLimitError } from "@/types/pricing";
import axios from "axios";
import { useCallback, useState } from "react";

const extractPlanLimitError = (error: unknown): IPlanLimitError | null => {
  if (!axios.isAxiosError(error)) return null;
  const body = error.response?.data as Partial<IPlanLimitError> | undefined;
  if (!body || body.error !== "PLAN_LIMIT_EXCEEDED") return null;
  return body as IPlanLimitError;
};

/**
 * Shared hook for reacting to the app-wide `403 PLAN_LIMIT_EXCEEDED` error
 * contract from any feature's own `catch`/`onError` block — not just the
 * Pricing page.
 *
 * Usage: render `<PaywallModal variant={paywallVariant} />` near the root of
 * your feature, then call `handlePlanLimitError(error)` from any
 * `onError`/`catch`. It returns `true` (and opens the modal with the
 * matching variant) when the error matches the `PLAN_LIMIT_EXCEEDED` shape,
 * or `false` otherwise so the caller can fall back to its own error handling.
 *
 * @example
 * const { paywallVariant, handlePlanLimitError } = usePlanLimitErrorHandler();
 * mutate(payload, {
 *   onError: (error) => {
 *     if (!handlePlanLimitError(error, "trial_exhausted")) {
 *       // handle unrelated errors normally
 *     }
 *   },
 * });
 * return <PaywallModal variant={paywallVariant} />;
 */
export const usePlanLimitErrorHandler = () => {
  const [paywallVariant, setPaywallVariant] =
    useState<TPaywallVariant>("product_limit");

  const handlePlanLimitError = useCallback(
    (error: unknown, fallbackVariant: TPaywallVariant = "product_limit"): boolean => {
      const planLimitError = extractPlanLimitError(error);
      if (!planLimitError) return false;

      setPaywallVariant(planLimitError.context ?? fallbackVariant);
      shopify.modal.show(ID_MODAL_SHOPIFY.pricing.modalPaywall);
      return true;
    },
    [],
  );

  return { paywallVariant, handlePlanLimitError };
};
