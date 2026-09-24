export type TFeedbackCategory =
  | "bug"
  | "feature_request"
  | "general"
  | "rating"
  | "nps";

export type TRatingSentiment = "😞" | "😐" | "🙂" | "😄" | "🤩";

/** The 8 codes documented in spec 1.5, plus 2 more ("already-open",
 * "open-in-progress") present in the installed `@shopify/app-bridge-types`'
 * `ReviewRequestDeclinedCode` union but not in the spec's table — a real
 * spec/SDK version-skew. Both are client-side concurrency artifacts (another
 * `request()` call already in flight / a review modal already open), not
 * merchant decisions — see `SILENT_NO_DISMISS_CODES` in
 * `RatingPreScreenModal/index.tsx`. */
export type TReviewsApiCode =
  | "success"
  | "already-reviewed"
  | "cooldown-period"
  | "annual-limit-reached"
  | "recently-installed"
  | "merchant-ineligible"
  | "mobile-app"
  | "cancelled"
  | "already-open"
  | "open-in-progress";

export type TFeedbackSourceTag = "widget" | "post_apply_prompt" | "downgrade_survey";

/** Matches the literal JSON contract in spec 2.5/7 — no shop_domain/user_agent
 * fields, despite spec 2.2's prose mentioning them; the JSON schema wins. */
export interface IFeedbackContext {
  route: string;
  last_bulk_job_id: number | null;
  plan_status: string;
}

export interface IFeedbackMetadataBug {
  source_tag: TFeedbackSourceTag;
  attachments: string[];
  context: IFeedbackContext | null;
  contact_email: string;
}

export interface IFeedbackMetadataFeatureRequest {
  source_tag: TFeedbackSourceTag;
  attachments: string[];
}

export interface IFeedbackMetadataGeneral {
  source_tag: TFeedbackSourceTag;
}

export interface IFeedbackMetadataRating {
  sentiment: TRatingSentiment;
  reviews_api_code: TReviewsApiCode | null;
}

export interface IFeedbackMetadataNps {
  score: number;
}

export type TFeedbackSubmitBody =
  | { category: "bug"; content: string; metadata: IFeedbackMetadataBug }
  | {
      category: "feature_request";
      content: string;
      metadata: IFeedbackMetadataFeatureRequest;
    }
  | { category: "general"; content: string; metadata: IFeedbackMetadataGeneral }
  | { category: "rating"; content: string; metadata: IFeedbackMetadataRating }
  | { category: "nps"; content: string; metadata: IFeedbackMetadataNps };

export interface IFeedbackSubmitResponse {
  feedback_id: string;
}
