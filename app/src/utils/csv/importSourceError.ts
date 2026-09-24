import type { IImportSourceError, TImportSourceErrorCode } from "@/types/csv";

const KNOWN_SOURCE_ERROR_CODES = new Set<TImportSourceErrorCode>([
  "csv_no_data_rows",
  "csv_empty_header",
  "csv_missing_required_headers",
  "csv_duplicate_headers",
  "csv_invalid_encoding",
  "csv_header_parse_failed",
  "csv_source_unavailable",
  "invalid_source",
]);

/** `key`/`values` for `t()` — kept separate from the actual translation call
 * so this stays a pure data mapping, matching the rest of `utils/csv`.
 * Unknown codes (a backend code this build doesn't know yet) fall back to
 * `error_invalid_source` per `sbfe_notice_20260818.md`. */
export const getImportSourceErrorContent = (
  error: IImportSourceError,
): { key: string; values?: Record<string, string> } => {
  const code = KNOWN_SOURCE_ERROR_CODES.has(error.code)
    ? error.code
    : "invalid_source";

  return {
    key: `csv_import.error_${code}`,
    values: {
      headers: error.meta.headers?.join(", ") ?? "",
      expectedEncoding: error.meta.expected_encoding ?? "",
    },
  };
};
