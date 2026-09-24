import type { TChangeField, TChangeMode, TRoundingRule } from "@/types/editWizard";

export interface IAttributeOption {
  value: TChangeField;
  labelI18nKey: string;
}

export const ATTRIBUTE_OPTIONS: IAttributeOption[] = [
  { value: "price", labelI18nKey: "edit_wizard.attribute_price" },
  {
    value: "compare_at_price",
    labelI18nKey: "edit_wizard.attribute_compare_at_price",
  },
  { value: "tags", labelI18nKey: "edit_wizard.attribute_tags" },
  {
    value: "inventory_quantity",
    labelI18nKey: "edit_wizard.attribute_inventory_quantity",
  },
];

export interface IModeOption {
  value: TChangeMode;
  labelI18nKey: string;
}

/**
 * Dropdown 2 options per attribute. FE-SPEC-06 only defines these for
 * Price/Compare-at-Price and Tags; Inventory Quantity and Status are FE
 * assumptions pending product/BE confirmation (see design doc).
 */
export const MODE_OPTIONS_BY_FIELD: Record<TChangeField, IModeOption[]> = {
  price: [
    { value: "percent_increase", labelI18nKey: "edit_wizard.mode_percent_increase" },
    { value: "percent_decrease", labelI18nKey: "edit_wizard.mode_percent_decrease" },
    { value: "fixed_increase", labelI18nKey: "edit_wizard.mode_fixed_increase" },
    { value: "set_value", labelI18nKey: "edit_wizard.mode_set_value" },
  ],
  compare_at_price: [
    { value: "percent_increase", labelI18nKey: "edit_wizard.mode_percent_increase" },
    { value: "percent_decrease", labelI18nKey: "edit_wizard.mode_percent_decrease" },
    { value: "fixed_increase", labelI18nKey: "edit_wizard.mode_fixed_increase" },
    { value: "set_value", labelI18nKey: "edit_wizard.mode_set_value" },
  ],
  tags: [
    { value: "add", labelI18nKey: "edit_wizard.mode_add_tags" },
    { value: "remove", labelI18nKey: "edit_wizard.mode_remove_tags" },
    { value: "find_replace", labelI18nKey: "edit_wizard.mode_find_replace" },
  ],
  inventory_quantity: [
    { value: "increase", labelI18nKey: "edit_wizard.mode_increase_quantity" },
    { value: "decrease", labelI18nKey: "edit_wizard.mode_decrease_quantity" },
    { value: "set_value", labelI18nKey: "edit_wizard.mode_set_value" },
  ],
  status: [{ value: "set_value", labelI18nKey: "edit_wizard.mode_set_value" }],
  find_replace: [],
};

export const ROUNDING_RULE_OPTIONS: { value: TRoundingRule; labelI18nKey: string }[] = [
  { value: "none", labelI18nKey: "edit_wizard.rounding_none" },
  { value: "ending_99", labelI18nKey: "edit_wizard.rounding_99" },
  { value: "ending_90", labelI18nKey: "edit_wizard.rounding_90" },
  { value: "floor_integer", labelI18nKey: "edit_wizard.rounding_floor_integer" },
  { value: "nearest_unit", labelI18nKey: "edit_wizard.rounding_nearest_unit" },
];

export const FILTER_DEBOUNCE_MS = 500;
