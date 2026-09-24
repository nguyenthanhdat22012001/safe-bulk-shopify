import type { IPaginatedData } from "@/types/editWizard";

/** Blocking validation codes. The backend still builds a plan when these are
 * present, but automatically skips the affected rows during the run. */
export type TImportErrorCode =
  | "invalid_price"
  | "invalid_boolean"
  | "invalid_inventory_quantity"
  | "duplicate_variant_row";

/** Non-blocking codes. The plan is still built; the merchant decides.
 * The `before_*_unavailable` family are record-level warnings (no
 * `field`/`row_number` on the wire) rather than field-level like `zero_price`
 * — see `IImportPreviewWarning`. */
export type TImportWarningCode =
  | "zero_price"
  | "before_product_unavailable"
  | "before_variant_unavailable"
  | "before_customer_unavailable"
  | "before_collection_unavailable"
  | "before_image_unavailable"
  | "before_address_unavailable"
  | "before_inventory_unavailable"
  | "before_metafield_unavailable";

export interface IImportPreviewError {
  row_number: number;
  header: string;
  code: TImportErrorCode;
  message: string;
  /** Present on `duplicate_variant_row` — every row in the duplicate group. */
  related_row_numbers?: number[];
}

/** File-wide CSV parsing codes. Returned instead of `IImportPreviewError`
 * when the task run status is `failed` — see `sbfe_notice_20260818.md`.
 * Unlike row-level errors, `row_number`/`header` are always `null`. */
export type TImportSourceErrorCode =
  | "csv_no_data_rows"
  | "csv_empty_header"
  | "csv_missing_required_headers"
  | "csv_duplicate_headers"
  | "csv_invalid_encoding"
  | "csv_header_parse_failed"
  | "csv_source_unavailable"
  | "invalid_source";

export interface IImportSourceError {
  row_number: null;
  header: null;
  code: TImportSourceErrorCode;
  /** Fallback/debug text only — never parsed or used as a translation key. */
  message: string;
  meta: {
    headers?: string[];
    expected_encoding?: string;
  };
}

export interface IImportPreviewChange {
  header: string;
  field: string;
  /** The backend sends strings, string arrays and booleans in this field.
   * Narrow at the render site — never widen this to `any`. */
  before: unknown;
  after: unknown;
  /** `null` means the field had no prior value (`before_status: "unavailable"`). */
  changed: boolean | null;
  action: string;
  row_number: number;
  target_gid: string;
  before_status: "available" | "unavailable";
}

export interface IImportPreviewWarning {
  code: TImportWarningCode;
  message: string;
  skippable: boolean;
  /** Present only on field-level warnings (e.g. `zero_price`). Absent on
   * record-level warnings (`before_product_unavailable`,
   * `before_variant_unavailable`). */
  field?: string;
  row_number?: number;
  target_gid: string;
}

export interface IImportPreviewOperation {
  id: number;
  sequence: number;
  /** Identifies the logical record. Ignoring one item ignores every item
   * sharing this key. */
  group_key: string;
  operation_family: string;
  action: "create" | "update" | "delete";
  resource_type: string;
  resource_gid: string;
  parent_gid: string;
  source_row_number: number;
  /** True when at least one entry in `changes` has `changed: true`. Drives
   * the row-level "no changes" empty state — it has no per-field
   * granularity, so `getChangedEntries` still does field-level filtering. */
  has_changes: boolean;
  ignored: boolean;
  changes: IImportPreviewChange[];
  warnings: IImportPreviewWarning[];
  will_skip: boolean;
  before_fetched_at: string;
}

/** `filter[warning]` on `GET /imports/{taskRun}/preview`. Omitting the field
 * (i.e. `undefined` here) returns every logical record, matching the
 * backend's unfiltered default. */
export type TPreviewWarningFilter = "any" | "none" | "skippable" | "will_skip";

/** `filter[ignored]` on the same endpoint. Omitting the field defaults to the
 * backend's `include` behavior — both ignored and active records returned. */
export type TPreviewIgnoredFilter = "include" | "exclude" | "only";

export interface IImportPreviewFilters {
  warning?: TPreviewWarningFilter;
  ignored?: TPreviewIgnoredFilter;
  changed?: "only" | "exclude";
}

export interface IImportPreviewSummary {
  logical_records: number;
  planned_operations: number;
  create: number;
  update: number;
  delete: number;
  total_records: number;
  included_records: number;
  ignored_records: number;
  /** Always present on the current API version; kept optional for
   * resilience against older/cached responses. */
  warning_count?: number;
  will_skip_count?: number;
  /** Total count of individual warning entries across all logical records —
   * distinct from `warning_count`, which counts records with at least one
   * warning. */
  warning_detail_count?: number;
  /** Count of individual blocking-error entries across the file — not
   * distinct records, since a `duplicate_variant_row` error can name
   * several `related_row_numbers`. Optional for the same resilience reason
   * as `warning_count`. */
  error_count?: number;
  /** True when the top-level `errors` array (on IImportPreviewResult) was
   * capped at MAX_PREVIEW_ERRORS_RETURNED. Optional for the same reason. */
  errors_truncated?: boolean;
  /** Count of logical records after the active filter is applied. Equal to
   * `total_records` when no filter is set. */
  filtered_records: number;
}

export interface IImportPreviewResult {
  ready: boolean;
  valid: boolean;
  config_version: number;
  /** File-wide blocking errors, capped at MAX_PREVIEW_ERRORS_RETURNED and
   * independent of `operations`' pagination. */
  errors: IImportPreviewError[];
  summary: IImportPreviewSummary;
  operations: IPaginatedData<IImportPreviewOperation>;
}

export interface IPreviewItemIgnoreResult {
  group_key: string;
  ignored: boolean;
  affected_item_ids: string;
  affected_count: number;
}
