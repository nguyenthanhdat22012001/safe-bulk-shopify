import type { TCsvPlanStatus } from "@/types/csv";

/** Shared with the backend — number of matched products above which Export
 * is expected to take noticeably longer. Every `POST /exports` call creates
 * a background task run regardless of count (there is no immediate
 * synchronous download path) — this constant is only surfaced in UI copy so
 * Merchants know what to expect before clicking Export. */
export const ASYNC_EXPORT_THRESHOLD = 3000;

/** Per-plan file size ceiling for CSV Import (FE-SPEC-CSV-PLAN-GATING.md §2.2).
 * `free` is never actually reached — Free is fully locked before file
 * selection (§2.1) — and `professional: null` means unlimited. Client-side
 * pre-check only: BE re-validates and is authoritative; this constant only
 * lets the Upload Zone reject an oversized file immediately, before any
 * network call. If BE changes a plan's limit, this constant must be updated
 * and the app redeployed — no auto-sync with BE. */
export const CSV_MAX_FILE_SIZE_MB: Record<TCsvPlanStatus, number | null> = {
  free: 0,
  trial: 10,
  growth: 10,
  professional: null,
};

/** `accept` value for the CSV Import `<s-drop-zone>` — restricts the native
 * file picker/drag-drop to `.csv` files. */
export const ACCEPTED_CSV_EXTENSIONS = ".csv";

/** Poll cadence while the backend is analyzing a file or building a preview.
 * Matches the interval already used for the `analyzing` state. */
export const IMPORT_POLL_INTERVAL_MS = 3000;

/** Poll cadence while a single task run (e.g. the CSV sample export kicked
 * off from UploadZone) is still in-flight. Same cadence as
 * IMPORT_POLL_INTERVAL_MS for the equivalent import-side polling. */
export const TASK_RUN_POLL_INTERVAL_MS = 3000;

/** How long to keep polling a task run stuck in `configuring` after the
 * merchant submitted a mapping. `configuring` with no error payload is
 * indistinguishable from "the backend has not started yet", so polling must
 * self-terminate rather than run forever. Spec §4: 30 attempts × 2s. */
export const PREVIEW_POLL_TIMEOUT_MS = 60_000;

/** The backend caps `preview.errors` at 100 entries and sets
 * `preview.summary.errors_truncated` when it truncates. Used only in the
 * "Showing the first N of M problems" copy. */
export const MAX_PREVIEW_ERRORS_RETURNED = 100;

/** Spec §2.1 — `GET /imports/{id}/errors/export` is requested but not yet
 * shipped by the backend. While this is `false` the "Download error rows"
 * button does not render, so nothing 404s. Flip to `true` once the backend
 * confirms the endpoint. */
export const IS_ERROR_EXPORT_AVAILABLE = false;

/** Appended to `shopInfo.onboarding_tasks` only by the FE, only via
 * `PATCH /api/shop` (`useUpdateShop`), the same way `ONBOARDING_DISMISSED_FLAG`
 * is — the backend never writes this one. Marks that the Import CSV intro
 * modal has already auto-shown once for this shop. */
export const CSV_IMPORT_INTRO_SEEN_FLAG = "csv_import_intro_seen";
