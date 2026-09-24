import type { TResourceType, TTaskRunStatus } from "@/types/editWizard";
import type { IImportPreviewError, IImportSourceError } from "./preview.types";

export interface IImportHeader {
  header: string;
  key: string;
  selected_by_default: boolean;
  locked: boolean;
  classification: "required" | "editable" | "read_only" | "unsupported";
}

export type TEmptyCellBehavior = "skip" | "clear";

export interface IImportMappingTarget {
  key: string;
  header: string;
  label: string;
  default_empty_cell_behavior: TEmptyCellBehavior;
  allowed_empty_cell_behaviors: TEmptyCellBehavior[];
}

export type TMappingDraft = Record<
  string,
  {
    selected: boolean;
    targetKey: string | null;
    emptyCellBehavior: TEmptyCellBehavior;
  }
>;

export interface IImportWarning {
  header: string;
  code: string;
  message: string;
}

export interface IImportAnalysis {
  headers: IImportHeader[];
  physical_rows: number;
  logical_records: number;
  mapping_targets: IImportMappingTarget[];
  warnings: IImportWarning[];
}

export interface IImportFieldMapping {
  source_header: string;
  target_key: string;
  target_header: string;
  empty_cell_behavior: TEmptyCellBehavior;
}

export type TWarningPolicy = "include" | "skip";

export interface IImportConfiguration {
  selected_headers: string[];
  field_mappings: IImportFieldMapping[];
  config_version: number;
  warning_policy: TWarningPolicy;
}

export interface IImportPreview {
  plan_version: number | null;
  valid: boolean;
  /** `null` when the task run status is `failed` — see `sbfe_notice_20260818.md`. */
  summary: {
    valid: boolean;
    error_count?: number;
    errors_truncated?: boolean;
  } | null;
  /** `IImportSourceError` entries appear when the task run status is
   * `failed` (file-wide parsing errors); `IImportPreviewError` entries
   * appear for row-level blocking errors on an otherwise-built plan. */
  errors: (IImportPreviewError | IImportSourceError)[];
}

export interface ICsvImportTaskRun {
  id: number;
  resource_type: TResourceType;
  operation_type: "csv_import";
  label: string;
  status: TTaskRunStatus;
  file: { name: string; size: number };
  analysis: IImportAnalysis;
  configuration: IImportConfiguration;
  preview: IImportPreview | null;
  created_at: string;
  updated_at: string;
}

export interface IImportConfigurationRequestBody {
  config_version: number;
  selected_headers: string[];
  field_mappings: Array<{
    source_header: string;
    target_key: string;
    empty_cell_behavior: TEmptyCellBehavior;
  }>;
  warning_policy?: TWarningPolicy;
}
