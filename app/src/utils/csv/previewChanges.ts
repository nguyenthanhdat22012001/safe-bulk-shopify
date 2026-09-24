import type {
  IImportPreviewChange,
  IImportPreviewError,
  IImportPreviewOperation,
} from "@/types/csv";

/** Only entries the import will actually alter. `changed: null` means the
 * field had no prior value, which is not an edit worth surfacing by default. */
export const getChangedEntries = (
  changes: IImportPreviewChange[],
): IImportPreviewChange[] => changes.filter((change) => change.changed === true);

export const getUnchangedEntries = (
  changes: IImportPreviewChange[],
): IImportPreviewChange[] => changes.filter((change) => change.changed !== true);

const EMPTY_VALUE_LABEL = "—";

/**
 * Renders a wire value as display text. The backend sends strings, string
 * arrays, booleans and nulls in `before`/`after`, so this narrows `unknown`
 * rather than casting it.
 */
export const formatPreviewValue = (value: unknown): string => {
  if (value === null || value === undefined || value === "") {
    return EMPTY_VALUE_LABEL;
  }
  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(", ") : EMPTY_VALUE_LABEL;
  }
  if (typeof value === "boolean") return String(value);
  if (typeof value === "number") return String(value);
  if (typeof value === "string") return value;
  return JSON.stringify(value);
};

export interface IPreviewRowGroup {
  rowNumber: number;
  changes: IImportPreviewChange[];
}

/** Always one group, since each operation now carries exactly one
 * `source_row_number`. Kept as an array (rather than returning the group
 * directly) so `PreviewOperationRow`'s existing per-group rendering needs no
 * changes. */
export const groupChangesByRow = (
  operation: IImportPreviewOperation,
): IPreviewRowGroup[] => [
  {
    rowNumber: operation.source_row_number,
    changes: operation.changes.filter(
      (change) => change.row_number === operation.source_row_number,
    ),
  },
];

/** Operations never carry their own `errors` — blocking errors are only
 * reported once, file-wide, on `IImportPreviewResult.errors`, keyed by
 * `row_number`. This groups them for O(1) lookup by row so each operation
 * row can tell whether it was auto-skipped for an error. */
export const buildRowErrorMap = (
  errors: IImportPreviewError[],
): Map<number, IImportPreviewError[]> => {
  const map = new Map<number, IImportPreviewError[]>();
  for (const error of errors) {
    const existing = map.get(error.row_number);
    if (existing) {
      existing.push(error);
    } else {
      map.set(error.row_number, [error]);
    }
  }
  return map;
};
