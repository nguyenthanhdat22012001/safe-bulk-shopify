import { queryOptions, useMutation } from "@tanstack/react-query";
import {
  createSubscription,
  getDiscountPreview,
  getSubscriptions,
} from "../services/shopService";
import type { ISubscriptionChangePayload } from "@/types/pricing";

/**
 * React Query Keys for Pricing
 *
 * Centralized query key definitions for consistent cache management
 * and query invalidation across the Pricing feature.
 */
export const EPricingQueryKeys = {
  getSubscriptions: "EPricingQueryKeys.getSubscriptions",
  getDiscountPreview: "EPricingQueryKeys.getDiscountPreview",
} as const;

/**
 * Get Subscriptions query
 *
 * Fetches current plan/trial/quota status with caching and error handling.
 */
export const pricingQueries = {
  getSubscriptions: queryOptions({
    queryKey: [EPricingQueryKeys.getSubscriptions],
    queryFn: async () => {
      const { status, data } = await getSubscriptions();
      if (!status) throw new Error("Failed to fetch Shop subscriptions");
      return data;
    },
  }),
  getDiscountPreview: (code: string) =>
    queryOptions({
      queryKey: [EPricingQueryKeys.getDiscountPreview, code],
      queryFn: async () => {
        const { status, data } = await getDiscountPreview(code);
        if (!status) throw new Error("Failed to fetch discount preview");
        return data;
      },
      // Default staleTime is 0, which would make fetchQuery() immediately refetch
      // even right after a prior successful fetch. A few minutes lets a caller's
      // own prefetch satisfy a later fetchQuery() call without a redundant round trip.
      staleTime: 5 * 60 * 1000,
    }),
};

/**
 * Create/change Subscription mutation
 *
 * Wraps `POST /subscriptions`. On success, performs a full top-level redirect
 * to the returned `confirmation_url` (must escape the App Bridge iframe via
 * `window.top`, per contracts/subscriptions-api.md). The next `GET /subscriptions`
 * call — triggered by the merchant landing back on `path_return` — is the sole
 * source of truth for whether the change succeeded (FR-009); this mutation never
 * calls a separate confirmation endpoint.
 *
 * Note: every current call site passes `path_return: "/pricing"` (the only
 * route that exists today and already refetches `pricingQueries.getSubscriptions`
 * on mount, satisfying FR-009). When an Account Settings route is introduced for
 * the downsell/downgrade flows (API doc §3.1), that route MUST also mount/refetch
 * `pricingQueries.getSubscriptions` on load so FR-009 continues to hold for every
 * `path_return` target, not just `/pricing` (see tasks.md T037).
 */
export const useCreateSubscription = () => {
  return useMutation({
    mutationFn: async (payload: ISubscriptionChangePayload) => {
      const { status, data } = await createSubscription({
        ...payload,
        path_return: payload.path_return
          ? payload.path_return
          : `${location.pathname}${location.search.length > 0 ? location.search : ""}`,
      });

      if (!status) {
        throw new Error("Failed to create Shop subscription");
      }
      return data;
    },
    onSuccess: (data) => {
      // window.top!.location.href = data.confirmation_url;
      if (data.confirmation_url) {
        open(data.confirmation_url, "_top");
      }
    },
  });
};
