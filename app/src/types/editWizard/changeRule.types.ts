/**
 * `find_replace` is kept as a `field` value only because the source API schema
 * listed it there; the FE never sets `field: "find_replace"` — find/replace is
 * always sent as a `mode` against `field: "tags"`. See the design doc's
 * "Open questions for backend" section.
 */
export type TChangeField =
  | "price"
  | "compare_at_price"
  | "inventory_quantity"
  | "tags"
  | "status"
  | "find_replace";

export type TChangeMode =
  | "percent_increase"
  | "percent_decrease"
  | "fixed_increase"
  | "fixed_decrease"
  | "set_value"
  | "increase"
  | "decrease"
  | "add"
  | "remove"
  | "find_replace";

export type TRoundingRule =
  | "none"
  | "ending_99"
  | "ending_90"
  | "floor_integer"
  | "nearest_unit";

export interface IChangeRule {
  field: TChangeField;
  mode: TChangeMode;
  value?: string | number;
  amount?: string | number;
  tags?: string[];
  find?: string;
  replace?: string;
  rounding_mode?: TRoundingRule;
}
