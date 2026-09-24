import type { TSortBy } from "@/types/editWizard";

/** free=50, trial=50 (confirmed with product); paid plans are unlimited and never
 *  reach this map — `plan_status === "paid"` short-circuits gating entirely. */
export const PER_EDIT_LIMIT: Record<"free" | "trial", number> = {
  free: 50,
  trial: 50,
};

/** Shared with the backend — below this, quota is treated as fully exhausted
 * rather than merely low. */
export const MINIMUM_THRESHOLD = 10;

export interface ISortByOption {
  value: TSortBy;
  labelI18nKey: string;
}

export const SORT_BY_OPTIONS: ISortByOption[] = [
  { value: "recently_updated", labelI18nKey: "edit_wizard.sort_by_recently_updated" },
  { value: "price_high_to_low", labelI18nKey: "edit_wizard.sort_by_price_desc" },
  { value: "price_low_to_high", labelI18nKey: "edit_wizard.sort_by_price_asc" },
  { value: "name_az", labelI18nKey: "edit_wizard.sort_by_name_asc" },
];
