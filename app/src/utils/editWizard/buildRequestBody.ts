import type {
  IChangeRule,
  IFilterEditPreviewRequestBody,
  IFilterEditRequestBody,
  IFilterState,
  TChangeMode,
  TPreviewStatusFilter,
  TSortBy,
} from "@/types/editWizard";

/**
 * Converts wizard filter state (array-based `tags` for the FE's TagComboField)
 * into the raw request shape the BE expects (comma-separated `tags` string).
 */
export const buildFilterEditRequestBody = (
  filters: IFilterState,
  options?: { limit?: number; sortBy?: TSortBy },
): IFilterEditRequestBody => ({
  collection_id: filters.collection_id,
  tags: filters.tags?.length ? filters.tags.join(",") : undefined,
  status: filters.status,
  price_min: filters.price_min,
  price_max: filters.price_max,
  inventory_min: filters.inventory_min,
  inventory_max: filters.inventory_max,
  limit: options?.limit,
  priority_order: options?.sortBy,
  resource_type: "product",
});

export const buildFilterEditPreviewRequestBody = (
  filters: IFilterState,
  changeRule: IChangeRule,
  after?: string,
  options?: {
    limit?: number;
    sortBy?: TSortBy;
    statusFilter?: TPreviewStatusFilter;
  },
): IFilterEditPreviewRequestBody => ({
  ...buildFilterEditRequestBody(filters, options),
  change_rules: [buildChangeRuleRequestBody(changeRule)],
  after,
  status_filter: options?.statusFilter,
});

export const buildChangeRuleRequestBody = (
  changeRule: IChangeRule,
): IChangeRule => {
  let newValue = changeRule.value;
  const changeModePrice: Array<TChangeMode> = [
    "percent_increase",
    "percent_decrease",
    "fixed_increase",
    "fixed_decrease",
  ];
  const isValueNumber = changeModePrice.includes(changeRule.mode);

  if (isValueNumber && newValue) newValue = Number(changeRule.value);
  return {
    ...changeRule,
    value: newValue,
    amount: newValue,
  };
};
