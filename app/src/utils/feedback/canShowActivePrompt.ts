import type { IShopStatesFeedbackNamespace } from "@/types/feedback";

const DAY_MS = 24 * 60 * 60 * 1000;
const RATING_MIN_SUCCESS_COUNT = 2;
const RATING_MIN_PRODUCT_COUNT = 10;
const RATING_DISMISSED_COOLDOWN_DAYS = 30;
const NPS_MIN_INSTALLED_DAYS = 14;
const NPS_MIN_SUCCESS_COUNT = 3;
const NPS_COOLDOWN_DAYS = 90;
const ACTIVE_PROMPT_MIN_GAP_DAYS = 14;

export const isWithinDays = (
  isoTimestamp: string | null,
  days: number,
): boolean => {
  if (!isoTimestamp) return false;
  const elapsedMs = Date.now() - new Date(isoTimestamp).getTime();
  return elapsedMs < days * DAY_MS;
};

export interface ICanShowRatingPromptParams {
  feedback: IShopStatesFeedbackNamespace;
  /** object_count/target_count of the Apply that just completed — spec 1.2's
   * "≥10 products processed" condition is about this specific run. */
  applyProductCount: number;
}

/** Spec 1.2's 4 AND conditions, minus the "just finished a successful Apply"
 * part (that's the caller's responsibility — see ApplyCompletionWatcher). */
export const canShowRatingPrompt = ({
  feedback,
  applyProductCount,
}: ICanShowRatingPromptParams): boolean =>
  feedback["apply.success_count"] >= RATING_MIN_SUCCESS_COUNT &&
  applyProductCount >= RATING_MIN_PRODUCT_COUNT &&
  feedback["rating.last_reviews_api_code"] !== "already-reviewed" &&
  !isWithinDays(feedback["rating.dismissed_at"], RATING_DISMISSED_COOLDOWN_DAYS) &&
  !isWithinDays(
    feedback["prompt.last_active_shown_at"],
    ACTIVE_PROMPT_MIN_GAP_DAYS,
  );

export interface ICanShowNpsPromptParams {
  feedback: IShopStatesFeedbackNamespace;
  shopCreatedAt: string;
}

/** Spec 3.2's conditions. Per the technical design's resolution: uses the
 * cumulative `apply.success_count` (not a true 14-day window — shop_states
 * has no windowed counter), and does NOT check widget submissions (only
 * Rating/NPS count toward the 14-day active-ask gap). */
export const canShowNpsPrompt = ({
  feedback,
  shopCreatedAt,
}: ICanShowNpsPromptParams): boolean => {
  const installedDaysAgo =
    (Date.now() - new Date(shopCreatedAt).getTime()) / DAY_MS;

  return (
    installedDaysAgo >= NPS_MIN_INSTALLED_DAYS &&
    feedback["apply.success_count"] >= NPS_MIN_SUCCESS_COUNT &&
    !isWithinDays(feedback["nps.last_shown_at"], NPS_COOLDOWN_DAYS) &&
    !isWithinDays(
      feedback["prompt.last_active_shown_at"],
      ACTIVE_PROMPT_MIN_GAP_DAYS,
    )
  );
};
