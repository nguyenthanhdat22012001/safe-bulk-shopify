export type TCsvPlanStatus = "free" | "trial" | "growth" | "professional";

export interface IFileSizeCheck {
  blocked: boolean;
  limitMb?: number | null;
  fileSizeMb?: number;
}

export interface ITrialQuotaReminder {
  used: number;
  limit: number;
  remaining: number;
}
