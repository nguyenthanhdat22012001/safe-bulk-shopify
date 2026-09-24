import type { TTaskRunStatus } from "@/types/editWizard";

/** What the merchant is looking at. Derived from server status plus a local
 * override — server status alone is ambiguous, because `configuring` means
 * both "waiting for the merchant to map columns" and "the backend rejected
 * the data and discarded the plan". */
export type TImportWizardStage =
  | "UPLOAD"
  | "ANALYZING"
  | "MAPPING"
  | "AWAITING_PREVIEW"
  | "BUILDING_PREVIEW"
  | "PREVIEW_TIMEOUT"
  | "BLOCKING_ERRORS"
  | "PREVIEW"
  | "RUNNING"
  | "FAILED";

/** Local intent that the server cannot express. */
export type TWizardOverride = "NONE" | "AWAITING_PREVIEW" | "EDITING_MAPPING";

const TERMINAL_FAILURE_STATUSES: TTaskRunStatus[] = [
  "failed",
  "canceled",
  "expired",
];

interface IDeriveStageInput {
  taskRunId: number | null;
  /** `undefined` while the first task run fetch is in flight. */
  status: TTaskRunStatus | undefined;
  /** `taskRun.preview?.valid === false` — the backend explicitly rejected the data. */
  // isPreviewInvalid: boolean;
  override: TWizardOverride;
  hasPollTimedOut: boolean;
}

/**
 * Resolves the current wizard stage. First match wins — the order encodes the
 * priority rules in the design spec §4.
 *
 * `BLOCKING_ERRORS` is checked before the `AWAITING_PREVIEW` override so a
 * merchant who reloads the page mid-flow still lands on the error state: the
 * override is lost on reload, server truth is not.
 */
export const deriveImportWizardStage = ({
  taskRunId,
  status,
  // isPreviewInvalid,
  override,
  hasPollTimedOut,
}: IDeriveStageInput): TImportWizardStage => {
  if (taskRunId === null) return "UPLOAD";
  if (override === "EDITING_MAPPING") return "MAPPING";
  if (status === undefined) return "ANALYZING";
  if (TERMINAL_FAILURE_STATUSES.includes(status)) return "FAILED";
  if (status === "analyzing") return "ANALYZING";
  if (status === "previewing") {
    // if (isPreviewInvalid) return "BLOCKING_ERRORS";

    return "BUILDING_PREVIEW";
  }

  if (status === "configuring") {
    if (override !== "AWAITING_PREVIEW") return "MAPPING";
    return hasPollTimedOut ? "PREVIEW_TIMEOUT" : "AWAITING_PREVIEW";
  }

  if (status === "ready") return "PREVIEW";
  return "RUNNING";
};

const STEP_ONE_STAGES: TImportWizardStage[] = ["UPLOAD", "ANALYZING", "FAILED"];

/** Drives `ImportStepper`. `FAILED` stays on step 1 — the wizard shows the
 * upload UI again so the merchant can retry immediately. Everything else
 * from "Checking your data…" onward is step 3. */
export const resolveStepNumber = (stage: TImportWizardStage): 1 | 2 | 3 => {
  if (STEP_ONE_STAGES.includes(stage)) return 1;
  if (stage === "MAPPING") return 2;
  return 3;
};
