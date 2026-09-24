export type TPlanStatus = "free" | "trial" | "paid";

export type TLimitReason =
  | "NONE"
  | "FREE_PER_EDIT"
  | "FREE_MONTHLY_LOW"
  | "FREE_MONTHLY_EXHAUSTED"
  | "TRIAL_LOW"
  | "TRIAL_EXHAUSTED";

export type TSortBy =
  | "recently_updated"
  | "price_high_to_low"
  | "price_low_to_high"
  | "name_az";

export interface IQuotaGating {
  plan_status: TPlanStatus;
  per_edit_limit: number | null; // null = unlimited (paid)
  monthly_used: number;
  monthly_limit: number | null; // null = unlimited (paid)
  monthly_remaining: number | null; // null = unlimited (paid)
  effective_limit_this_request: number | null; // null = no cap
  matched_count: number;
  limit_reason: TLimitReason;
}
