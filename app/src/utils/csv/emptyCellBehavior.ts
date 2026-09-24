import type { IImportMappingTarget, TEmptyCellBehavior } from "@/types/csv";

/**
 * A target is only user-editable when the backend explicitly allows
 * `"clear"`. Falls back to locked (`false`) if `allowed_empty_cell_behaviors`
 * is missing from the response — never infer editability, never crash.
 */
export const isEmptyCellBehaviorEditable = (
  target: Pick<IImportMappingTarget, "allowed_empty_cell_behaviors">,
): boolean => target.allowed_empty_cell_behaviors?.includes("clear") ?? false;

/**
 * Same absent-data fallback as `isEmptyCellBehaviorEditable` — `"skip"` is
 * the universally safe default per CSV-SPEC-07 §2.2.
 */
export const resolveDefaultEmptyCellBehavior = (
  target: Pick<IImportMappingTarget, "default_empty_cell_behavior">,
): TEmptyCellBehavior => target.default_empty_cell_behavior ?? "skip";
