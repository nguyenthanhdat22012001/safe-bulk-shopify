import type { IHistoryFilters } from "@/types/dashboard";

/** Shared FE/BE contract for the Dashboard onboarding checklist
 * (`app/docs/wizard/Onboarding Checklist (Dashboard) v4 UI-UX Spec.md` §1).
 * Fixed display order — the checklist always renders these 3 tasks in this
 * sequence regardless of the order the Merchant actually completes them in.
 * The backend appends these directly inside the Preview/Apply/Undo flows;
 * the FE never writes them. */
export const ONBOARDING_TASK_IDS = [
  "preview_viewed",
  "job_applied",
  "undo_used",
] as const;

/** Appended to `onboarding_tasks` only by the FE, only via `PATCH /api/shop`,
 * when the Merchant permanently dismisses the completed checklist card
 * (spec §1, §4.2). Doesn't count toward `completed_count`. */
export const ONBOARDING_DISMISSED_FLAG = "dismissed";

/** Debounce for the History search field before it's included in the task-runs query. */
export const HISTORY_SEARCH_DEBOUNCE_MS = 500;

export const DEFAULT_HISTORY_FILTERS: IHistoryFilters = {
  search: "",
  status: null,
  operation_type: null,
  date_from: "",
  date_to: "",
};
