import type { TRatingSentiment, TReviewsApiCode } from "./feedback.types";

/** The 7 keys of the `feedback` Shop States namespace (spec 8.1). Bracket
 * notation on purpose — matches spec 8.2's own access pattern
 * (`shopStates.feedback["apply.success_count"]`). */
export interface IShopStatesFeedbackNamespace {
  "apply.success_count": number;
  "rating.dismissed_at": string | null;
  "rating.last_sentiment": TRatingSentiment | null;
  "rating.shown_count": number;
  "rating.last_reviews_api_code": TReviewsApiCode | null;
  "nps.last_shown_at": string | null;
  "prompt.last_active_shown_at": string | null;
}

export interface IShopStatesPatchBody {
  states: {
    feedback: Partial<IShopStatesFeedbackNamespace>;
  };
}
