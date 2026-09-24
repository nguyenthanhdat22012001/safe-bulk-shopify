import type { IImportPreviewSummary } from "@/types/csv";
import { returnFormatNumber } from "@/utils/funcFormat";
import { useTranslation } from "react-i18next";

interface IProps {
  summary: IImportPreviewSummary;
  isRunning: boolean;
  disabled?: boolean;
  /** True when the no-changes guardrail (FIX #12) is active — swaps the
   * button label to force an active confirmation instead of a silent Apply. */
  forceConfirm?: boolean;
  onRun: () => void;
}

const PreviewRunFooter = ({
  summary,
  isRunning,
  disabled,
  forceConfirm,
  onRun,
}: IProps) => {
  const { t } = useTranslation();

  const skippedCount = summary.will_skip_count ?? 0;

  return (
    <s-stack direction="block" gap="small-200">
      <s-stack direction="inline" gap="small-300" alignItems="center">
        <s-text type="strong">
          {t("csv_import.summary_records_included", {
            count: returnFormatNumber(summary.filtered_records),
          })}
        </s-text>
        {summary.ignored_records > 0 && (
          <s-text color="subdued">
            {t("csv_import.summary_records_ignored", {
              count: returnFormatNumber(summary.ignored_records),
            })}
          </s-text>
        )}
        {skippedCount > 0 && (
          <s-text color="subdued">
            {t("csv_import.summary_records_skipped", {
              count: returnFormatNumber(skippedCount),
            })}
          </s-text>
        )}
      </s-stack>

      <s-button
        variant="primary"
        loading={isRunning}
        disabled={disabled}
        onClick={onRun}
      >
        {t(
          forceConfirm
            ? "csv_import.button_continue_to_apply"
            : "csv_import.button_run_import",
        )}
      </s-button>
    </s-stack>
  );
};

export default PreviewRunFooter;
