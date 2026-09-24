/**
 * FE-SPEC-08 — priority/merge resolver for Step 3's page-level banners.
 * Critical Guard Warning always outranks the Partial Processing Notice; when
 * both apply they render as one merged banner rather than stacking two.
 */
export type TStep3TopBanner =
  | { kind: "NONE" }
  | { kind: "CRITICAL_ONLY"; remainingErrorCount: number }
  | { kind: "PARTIAL_ONLY"; batchSize: number; totalMatched: number; sortLabel: string }
  | {
      kind: "MERGED";
      remainingErrorCount: number;
      batchSize: number;
      totalMatched: number;
      sortLabel: string;
    };

export const resolveStep3Banner = (
  remainingErrorCount: number,
  partialBatchInfo: { batchSize: number; totalMatched: number; sortLabel: string } | null,
): TStep3TopBanner => {
  const hasCritical = remainingErrorCount > 0;

  if (hasCritical && partialBatchInfo) {
    return { kind: "MERGED", remainingErrorCount, ...partialBatchInfo };
  }
  if (hasCritical) {
    return { kind: "CRITICAL_ONLY", remainingErrorCount };
  }
  if (partialBatchInfo) {
    return { kind: "PARTIAL_ONLY", ...partialBatchInfo };
  }
  return { kind: "NONE" };
};
