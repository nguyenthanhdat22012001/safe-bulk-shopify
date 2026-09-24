export interface IChangeDetail {
  field: string;
  old: string | string[] | null; // arrays for tags changes, null when there's nothing to change (e.g. no existing compare-at-price)
  new: string | string[] | null;
  warning: string | null; // backend sends a plain string, not an object — no severity field on the wire
  warning_code: string | null; // sibling of `warning`, not nested inside it
  will_skip: boolean;
}

export type TProductPreviewStatus = "ACTIVE" | "DRAFT" | "ARCHIVED";

export interface IProductVariantPreview {
  id: string;
  title: string;
  sku: string | null;
  image: string | null;
  changes: IChangeDetail[];
  will_skip: boolean;
}

export interface IPreviewProduct {
  id: string;
  title: string;
  image: string | null;
  status: TProductPreviewStatus;
  sku: string | null;
  matched_variant_count: number;
  total_variant_count: number;
  /** Matched (changed) variants only, not the product's full variant list. */
  variants: IProductVariantPreview[];
  variants_page_info: {
    has_next_page: string | null;
    end_cursor: string | null;
  };
  changes: IChangeDetail[];
  will_skip: boolean;
}

export interface IFilterEditPreviewResponse {
  has_next_page: boolean;
  end_cursor: string | null;
  products: IPreviewProduct[];
}

export interface IProductPreviewDetails {
  id: string;
  title: string;
  image: string;
  status: TProductPreviewStatus;
  /**
   * ASSUMED as string[] to match IPreviewProduct.tags — no sample response
   * available for this endpoint at design time (see design doc).
   */
  tags: string[];
  variants: IProductVariantPreview[];
  variants_page_info: {
    has_next_page: string | null;
    end_cursor: string | null;
  };
}

export interface IProductPreviewDetailsResponse {
  product: IProductPreviewDetails;
}
