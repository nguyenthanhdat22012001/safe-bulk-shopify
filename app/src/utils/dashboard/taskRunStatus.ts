import type {
  ITaskRunListResource,
  TTaskRunOperationType,
  TTaskRunStatus,
  TUndoLockedReason,
} from "@/types/editWizard";

export type TBadgeTone =
  "success" | "warning" | "critical" | "info" | "caution";

export interface IStatusBadge {
  tone: TBadgeTone;
  labelKey: string;
}

const STATUS_BADGE_CONFIG: Record<TTaskRunStatus, IStatusBadge> = {
  pending: { tone: "caution", labelKey: "dashboard.badge_applying" },
  created: { tone: "caution", labelKey: "dashboard.badge_applying" },
  running: { tone: "caution", labelKey: "dashboard.badge_applying" },
  completed: { tone: "success", labelKey: "dashboard.badge_completed" },
  completed_with_errors: {
    tone: "warning",
    labelKey: "dashboard.badge_completed_with_errors",
  },
  canceled: { tone: "info", labelKey: "dashboard.badge_cancelled" },
  failed: { tone: "critical", labelKey: "dashboard.badge_failed" },
  expired: { tone: "critical", labelKey: "dashboard.badge_expired" },
  undoing: { tone: "caution", labelKey: "dashboard.badge_undoing" },
  undone: { tone: "info", labelKey: "dashboard.badge_undone" },
  undone_with_errors: {
    tone: "warning",
    labelKey: "dashboard.badge_undone_with_errors",
  },
  undo_failed: { tone: "critical", labelKey: "dashboard.badge_undo_failed" },
  analyzing: { tone: "caution", labelKey: "dashboard.badge_applying" },
  configuring: { tone: "caution", labelKey: "dashboard.badge_applying" },
  previewing: { tone: "caution", labelKey: "dashboard.badge_applying" },
  ready: { tone: "info", labelKey: "dashboard.badge_ready_to_preview" },
};

export const getStatusLabelKey = (status: TTaskRunStatus): string =>
  STATUS_BADGE_CONFIG[status].labelKey;

const CSV_EXPORT_STATUS_BADGE_OVERRIDES: Partial<
  Record<TTaskRunStatus, IStatusBadge>
> = {
  pending: { tone: "caution", labelKey: "dashboard.badge_preparing_export" },
  created: { tone: "caution", labelKey: "dashboard.badge_preparing_export" },
  running: { tone: "caution", labelKey: "dashboard.badge_preparing_export" },
  completed: { tone: "success", labelKey: "dashboard.badge_ready_to_download" },
  failed: { tone: "critical", labelKey: "dashboard.badge_export_failed" },
};

export const UNDO_LOCK_TOOLTIP_KEYS: Record<NonNullable<TUndoLockedReason>, string> = {
  UNDO_WINDOW_EXPIRED: "dashboard.tooltip_undo_window_expired",
  JOB_ALREADY_UNDONE: "dashboard.tooltip_job_already_undone",
  JOB_FAILED: "dashboard.tooltip_job_failed",
  JOB_IN_PROGRESS: "dashboard.tooltip_job_in_progress",
  UNDO_NOT_SUPPORTED: "dashboard.tooltip_undo_not_supported",
  UNDO_ALREADY_COMPLETED: "dashboard.tooltip_undo_already_completed",
};

export const getStatusBadge = (
  status: TTaskRunStatus,
  operationType: ITaskRunListResource["operation_type"],
  isLocallyCancelling: boolean,
): IStatusBadge => {
  if (isLocallyCancelling) {
    return { tone: "caution", labelKey: "dashboard.badge_cancelling" };
  }
  if (operationType === "csv_export") {
    const override = CSV_EXPORT_STATUS_BADGE_OVERRIDES[status];
    if (override) return override;
  }
  return STATUS_BADGE_CONFIG[status];
};

export const APPLYING_STATUSES: ReadonlySet<TTaskRunStatus> = new Set([
  "pending",
  "created",
  "running",
  "analyzing",
  "previewing",
]);
const UNDOABLE_STATUSES: ReadonlySet<TTaskRunStatus> = new Set([
  "completed",
  "completed_with_errors",
  "undo_failed",
]);

export type TRowAction =
  | { type: "processing" }
  | { type: "cancel" }
  | { type: "undo" }
  | { type: "undo_locked"; reason: NonNullable<TUndoLockedReason> }
  | { type: "download" }
  | { type: "retry" }
  | { type: "configure" }
  | { type: "preview" }
  | { type: "none" };

export const getRowAction = (
  run: {
    status: TTaskRunStatus;
    action: { type: string; enabled: boolean };
    operation_type: TTaskRunOperationType;
    undo_locked_reason?: TUndoLockedReason;
  },
  isLocallyCancelling: boolean,
): TRowAction => {
  if (isLocallyCancelling) {
    return { type: "processing" };
  }

  if (APPLYING_STATUSES.has(run.status)) {
    return run.action.type === "cancel" && run.action.enabled
      ? { type: "cancel" }
      : { type: "processing" };
  }

  if (run.operation_type === "csv_export") {
    if (run.status === "completed") return { type: "download" };
    if (run.status === "failed" || run.status === "expired")
      return { type: "retry" };
    return { type: "none" };
  }

  if (run.operation_type === "csv_import") {
    if (run.status === "configuring") return { type: "configure" };
    if (run.status === "ready") return { type: "preview" };
    // return { type: "none" };
  }

  if (UNDOABLE_STATUSES.has(run.status)) {
    if (run.action.type === "undo" && run.action.enabled)
      return { type: "undo" };
    if (run.undo_locked_reason)
      return { type: "undo_locked", reason: run.undo_locked_reason };
    return { type: "none" };
  }

  return { type: "none" };
};

export interface IObjectColumnData {
  productCount: number;
  variantCount: number | null;
}

export const formatObjectColumn = (
  target: Record<string, number> | null,
): IObjectColumnData => {
  if (!target) return { productCount: 0, variantCount: null };
  const productCount = target.product ?? 0;
  const variantCount =
    target.variant && target.variant > 0 ? target.variant : null;
  return { productCount, variantCount };
};
