import type { IChangeRule } from "./changeRule.types";
import type { TSortBy } from "./gating.types";

export type TResourceType = "product";
export interface IFilterEditRequestBody {
  title?: string;
  sku?: string;
  tags?: string;
  status?: string;
  inventory_min?: number;
  inventory_max?: number;
  price_min?: number;
  price_max?: number;
  collection_id?: string;
  label?: string;
  change_rules?: IChangeRule[];
  priority_order?: TSortBy;
  limit?: number;
  exclude_product_ids?: Array<string>;
  resource_type: TResourceType;
  columns?: {
    base: {
      include: boolean;
      columns: Array<string>;
    };
    variants: {
      include: boolean;
      columns: Array<string>;
    };
  };
}

/** FE-SPEC-09 — which bucket of Step 3's preview to return (the Valid/Error tabs). */
export type TPreviewStatusFilter = "VALID" | "ERROR";

export interface IFilterEditPreviewRequestBody extends IFilterEditRequestBody {
  change_rules: IChangeRule[];
  /**
   * ASSUMED — the given API schema has no pagination parameter for this
   * endpoint despite its response returning `end_cursor`. See the design
   * doc's "Open questions for backend" section.
   */
  after?: string;
  /** FE-SPEC-09 — filters the preview to only valid or only error rows. */
  status_filter?: TPreviewStatusFilter;
}

export interface IProductPreviewDetailsRequestBody extends IFilterEditPreviewRequestBody {
  product_id: string;
  variant_limit?: number;
  /**
   * Typed as `string` (a cursor), not `number` as given in the source
   * schema — see the design doc's flagged inconsistency.
   */
  variant_after?: string;
}
