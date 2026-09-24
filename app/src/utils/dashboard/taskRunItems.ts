import type {
  ITaskRunItem,
  TFieldChangeValue,
  TTaskRunItemStatus,
} from "@/types/editWizard";
import type { TBadgeTone } from "./taskRunStatus";

export interface IItemStatusBadge {
  tone: TBadgeTone;
  labelKey: string;
}

const ITEM_STATUS_BADGE_CONFIG: Record<TTaskRunItemStatus, IItemStatusBadge> = {
  success: { tone: "success", labelKey: "dashboard.badge_item_success" },
  error: { tone: "critical", labelKey: "dashboard.badge_item_error" },
  skipped: { tone: "warning", labelKey: "dashboard.badge_item_skipped" },
};

export const getTaskRunItemStatusBadge = (
  status: TTaskRunItemStatus,
): IItemStatusBadge => ITEM_STATUS_BADGE_CONFIG[status];

interface IParsedErrorEntry {
  field: string | null;
  message: string;
}

/**
 * error_message is either a plain string or a JSON-encoded array of
 * `{ field, message }` entries (seen from bulk variant validation errors).
 */
export const parseTaskRunItemErrorMessage = (
  message: string | null,
): IParsedErrorEntry[] => {
  if (!message) return [];

  try {
    const parsed: unknown = JSON.parse(message);
    if (Array.isArray(parsed)) {
      return parsed.map((entry: unknown) => {
        const record = entry as { field?: unknown; message?: unknown };
        return {
          field: Array.isArray(record.field) ? record.field.join(".") : null,
          message: typeof record.message === "string" ? record.message : message,
        };
      });
    }
  } catch {
    // Not JSON — treat as a plain message below.
  }

  return [{ field: null, message }];
};

export interface IFieldChangeEntry {
  field: string;
  old: TFieldChangeValue;
  new: TFieldChangeValue;
}

export const getChangedFields = (
  fieldChanges: ITaskRunItem["field_changes"],
): IFieldChangeEntry[] => {
  if (!fieldChanges) return [];

  return Object.entries(fieldChanges)
    .filter(([, { old, new: next }]) => JSON.stringify(old) !== JSON.stringify(next))
    .map(([field, { old, new: next }]) => ({ field, old, new: next }));
};

export const formatFieldChangeValue = (value: TFieldChangeValue): string => {
  if (value === null) return "--";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value
      .map((entry) =>
        typeof entry === "string" ? entry : Object.values(entry).join(" "),
      )
      .join(", ");
  }
  return Object.entries(value)
    .map(([key, entry]) => `${key}: ${formatFieldChangeValue(entry as TFieldChangeValue)}`)
    .join(", ");
};

export const getParentLabel = (parentGid: string, parentType: string): string => {
  const numericId = parentGid.split("/").pop() ?? parentGid;
  const typeLabel = parentType.charAt(0).toUpperCase() + parentType.slice(1);
  return `${typeLabel} #${numericId}`;
};
