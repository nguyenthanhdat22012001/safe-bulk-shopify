import type { TResourceType } from "./request.types";

export type TTaskRunStatus =
  | "pending"
  | "created"
  | "running"
  | "completed"
  | "completed_with_errors"
  | "failed"
  | "expired"
  | "undone"
  | "undoing"
  | "undone_with_errors"
  | "undo_failed"
  | "canceled"
  /** CSV */
  // CSV source is being inspected and its headers are being classified.
  | "analyzing"
  // CSV analysis succeeded and the merchant may choose import fields.
  | "configuring"
  // CSV import is being previewed and its changes are being validated.
  | "previewing"
  // CSV import configuration was saved; task is ready for the merchant to preview/confirm.
  // Not in BE's api-task_run.md contract doc either — evidenced only by a live sample
  // response (2026-08-02). See docs/superpowers/specs/2026-08-02-taskrun-list-contract-fix-design.md.
  | "ready";

export type TTaskRunOperationType =
  "csv_import" | "csv_export" | "manual_edit" | "filter_edit";

export type TUndoLockedReason =
  | "UNDO_WINDOW_EXPIRED"
  | "JOB_ALREADY_UNDONE"
  | "JOB_FAILED"
  | "JOB_IN_PROGRESS"
  | "UNDO_NOT_SUPPORTED"
  | "UNDO_ALREADY_COMPLETED"
  | null;

export interface ITaskRunUndo {
  attempt: number;
  status: TTaskRunStatus;
  object_count: number;
  target_count: number;
  success_count: number;
  error_count: number;
  skipped_count: number | null;
  retryable: boolean;
  error_message: string | null;
  started_at: string | null;
  completed_at: string;
}

export interface ITaskRunActor {
  id: string;
  name: string;
  email: string | null;
}

export interface ITaskRun {
  id: number;
  resource_type: TResourceType;
  operation_type: TTaskRunOperationType;
  label: string;
  status: TTaskRunStatus;
  object_count: number | null;
  target_count: number | null;
  summary_counts: Record<string, number> | null;
  error_count: number | null;
  skipped_count: number | null;
  export_format: string | null;
  download_url: string | null;
  started_at: string | null;
  completed_at: string | null;
  undone_at: string | null;
  /** Not guaranteed exhaustive — only `"cancel"` evidenced so far by a live
   * `POST /exports` sample response (2026-08-05). Tighten with more real
   * samples before branching UI logic on specific values. */
  action: { type: string; enabled: boolean };
  undo: ITaskRunUndo | null;
  actor?: ITaskRunActor | null;
  undo_locked_reason: TUndoLockedReason;
  undo_window_expires_at: string | null;
}

export interface IPaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

export interface IPaginatedData<T> {
  current_page: number;
  data: T[];
  first_page_url: string | null;
  from: number | null;
  last_page_url: string | null;
  last_page: number;
  links: IPaginationLink[];
  next_page_url: string | null;
  path: string | null;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
}

export interface ITaskRunListResource {
  id: number;
  resource_type: TResourceType | null;
  operation_type: TTaskRunOperationType;
  label: string | null;
  created_at: string | null;
  target: Record<string, number> | null;
  progress_percent: string | null;
  status: TTaskRunStatus;
  action: {
    enabled: boolean;
    /** Not guaranteed exhaustive — BE's own api-task_run.md types this as a bare
     * `string`. These are the only 5 values evidenced by a real sample response. */
    type: "preview" | "configure" | "view_log" | "undo" | "none" | "cancel";
  };
  undo: ITaskRunUndo | null;
  undo_locked_reason?: TUndoLockedReason;
  undo_window_expires_at?: string | null;
}

export interface ITaskRunListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: TTaskRunStatus;
  operation_type?: TTaskRunOperationType;
  date_from?: string;
  date_to?: string;
}

export type TTaskRunItemStatus = "success" | "error" | "skipped";
export type TTaskRunItemPhase = "apply" | "undo";

export interface ITaskRunItemWarning {
  code: string;
  message: string;
  skippable: boolean;
  field: string;
  row_number: number;
  target_gid: string | null;
}

export type TFieldChangeValue =
  | string
  | number
  | boolean
  | null
  | string[]
  | Record<string, unknown>
  | Record<string, unknown>[];

export interface ITaskRunItem {
  id: number;
  phase: TTaskRunItemPhase;
  shopify_gid: string | null;
  parent_gid: string;
  client_identifier: string;
  status: TTaskRunItemStatus;
  error_message: string | null;
  error_code: string | null;
  warnings: ITaskRunItemWarning[];
  field_changes: Record<string, { old: TFieldChangeValue; new: TFieldChangeValue }> | null;
}

export interface ITaskRunItemGroup {
  parent_gid: string;
  parent_type: string;
  items: ITaskRunItem[];
}
