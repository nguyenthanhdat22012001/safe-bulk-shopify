export type TTrialStatus = "started" | "holding" | "ended" | "skipped";
export type TPlan = "free" | "growth" | "professional"

export interface ISubscriptionStatus {
  app_plan: TPlan;
  trial_days_remaining: number | null;
  trial_status: TTrialStatus | null;
  trial_days_offer: number;
  monthly_quota_used: number;
  monthly_quota_limit: number | null;
  monthly_resets_at?: string | null;
}

export interface ISubscriptionChangePayload {
  plan: TPlan;
  discount_code?: string;
  skip_trial?: boolean;
  path_return?: string;
}

export interface ISubscriptionChangeResult {
  confirmation_url?: string;
}

export type EPlanLimitContext =
  | "product_limit"
  | "csv_feature"
  | "undo_expired"
  | "staff_permissions";

export interface IPlanLimitError {
  error: "PLAN_LIMIT_EXCEEDED";
  message: string;
  context?: EPlanLimitContext;
}

export type TDiscountType = "percentage" | "fixed";

export interface IDiscountPlanPrice {
  original_price: number;
  discounted_price: number;
}

export interface IDiscountPreview {
  code: string;
  type: TDiscountType;
  value: number;
  duration_cycles: number | null;
  prices: {
    growth: IDiscountPlanPrice;
    professional: IDiscountPlanPrice;
  };
}
