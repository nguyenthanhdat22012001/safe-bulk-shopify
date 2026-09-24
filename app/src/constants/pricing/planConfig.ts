export interface IPlanConfig {
  csv_enabled: boolean;
  staff_permissions_enabled: boolean;
  undo_window_hours?: number;
  undo_window_days?: number;
  undo_lifetime?: boolean;
}

export const PLAN_CONFIG: Record<"free" | "growth" | "professional", IPlanConfig> = {
  free: {
    undo_window_hours: 48,
    csv_enabled: false,
    staff_permissions_enabled: false,
  },
  growth: {
    undo_window_days: 30,
    csv_enabled: true,
    staff_permissions_enabled: false,
  },
  professional: {
    undo_lifetime: true,
    csv_enabled: true,
    staff_permissions_enabled: true,
  },
};

/**
 * Normalizes a raw `app_plan` value from the API into a known `PLAN_CONFIG` key.
 * Unrecognized values fall back to `"free"`-equivalent gating (FR-018).
 */
export const normalizePlan = (
  appPlan: string | undefined,
): keyof typeof PLAN_CONFIG => {
  const normalized = appPlan?.toLowerCase().trim();
  if (normalized === "free" || normalized === "growth" || normalized === "professional") {
    return normalized;
  }
  return "free";
};

export const TRIAL_DAYS_OFFER = 7;

/** Free Quota Banner (Dashboard) shows the "Warning" state once monthly usage
 *  crosses this fraction of the plan's monthly_quota_limit. */
export const FREE_QUOTA_WARNING_THRESHOLD = 0.8;