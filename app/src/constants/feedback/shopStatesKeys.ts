/** The 7 keys of the `feedback` Shop States namespace (spec 8.1). Use these
 * constants everywhere instead of hardcoding the string keys. */
export const SHOP_STATES_FEEDBACK_KEYS = {
  applySuccessCount: "apply.success_count",
  ratingDismissedAt: "rating.dismissed_at",
  ratingLastSentiment: "rating.last_sentiment",
  ratingShownCount: "rating.shown_count",
  ratingLastReviewsApiCode: "rating.last_reviews_api_code",
  npsLastShownAt: "nps.last_shown_at",
  promptLastActiveShownAt: "prompt.last_active_shown_at",
} as const;
