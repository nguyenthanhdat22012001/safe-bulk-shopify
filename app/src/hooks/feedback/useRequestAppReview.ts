import { SHOP_STATES_FEEDBACK_KEYS } from "@/constants/feedback";
import { usePatchFeedbackState } from "@/queries/shopStatesQueries";
import { useFeedbackStateStore } from "@/stores/feedbackStateStore";
import type { TReviewsApiCode } from "@/types/feedback";
import { useState } from "react";

/** Codes that mean "the merchant never actually saw anything" — must NOT set
 * rating.dismissed_at, per spec 8.3's worked example. "already-open" and
 * "open-in-progress" are client-side concurrency artifacts (another
 * `request()` call already in flight / a review modal already open), not a
 * merchant decision, so they belong here too. */
export const SILENT_NO_DISMISS_CODES: TReviewsApiCode[] = [
  "cooldown-period",
  "annual-limit-reached",
  "recently-installed",
  "merchant-ineligible",
  "mobile-app",
  "already-open",
  "open-in-progress",
];

export interface IUseRequestAppReviewResult {
  /** True while a `shopify.reviews.request()` call is outstanding — disable
   * the triggering button while this is true to avoid firing two concurrent
   * requests (App Bridge review requests aren't idempotent). */
  isRequesting: boolean;
  /**
   * Calls `shopify.reviews.request()`, resolves the response into a
   * `TReviewsApiCode`, and bundle-PATCHes `rating.last_reviews_api_code`
   * (+ conditionally `rating.dismissed_at`, per spec 8.3) into shop-states.
   * Never throws — returns `null` if the request itself rejects.
   */
  requestAppReview: () => Promise<TReviewsApiCode | null>;
}

/**
 * Shared Reviews API request logic (spec 1.5 / 3.3). Both `RatingPreScreenModal`'s
 * positive-sentiment branch and `NpsBanner`'s promoter branch call this instead
 * of invoking `shopify.reviews.request()` directly, so the response-code
 * handling and shop-states bookkeeping stay in one place. Callers still do
 * their own additional bookkeeping on top (e.g. submitting their own
 * `category:"rating"` feedback record with the picked sentiment).
 */
export const useRequestAppReview = (): IUseRequestAppReviewResult => {
  const [isRequesting, setIsRequesting] = useState(false);

  const setFeedbackState = useFeedbackStateStore((state) => state.setFeedbackState);
  const { mutate: patchFeedbackState } = usePatchFeedbackState();

  const requestAppReview = async (): Promise<TReviewsApiCode | null> => {
    if (isRequesting) return null;
    setIsRequesting(true);
    try {
      const result = await shopify.reviews.request();
      const code: TReviewsApiCode = result.code;

      const setDismissed = !SILENT_NO_DISMISS_CODES.includes(code);
      const partial = {
        [SHOP_STATES_FEEDBACK_KEYS.ratingLastReviewsApiCode]: code,
        ...(setDismissed
          ? { [SHOP_STATES_FEEDBACK_KEYS.ratingDismissedAt]: new Date().toISOString() }
          : {}),
      };
      setFeedbackState(partial);
      patchFeedbackState(partial);

      return code;
    } catch {
      return null;
    } finally {
      setIsRequesting(false);
    }
  };

  return { isRequesting, requestAppReview };
};
