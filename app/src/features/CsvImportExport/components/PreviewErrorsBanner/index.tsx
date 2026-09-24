import { MAX_PREVIEW_ERRORS_RETURNED } from "@/constants/csv";
import type { IImportPreviewError, IImportPreviewSummary } from "@/types/csv";
import { returnFormatNumber } from "@/utils/funcFormat";
import { useTranslation } from "react-i18next";

interface IProps {
  errors: IImportPreviewError[];
  summary: Pick<IImportPreviewSummary, "error_count" | "errors_truncated">;
}

const PreviewErrorsBanner = ({ errors, summary }: IProps) => {
  const { t } = useTranslation();

  const errorCount = summary.error_count ?? errors.length;

  return (
    <s-stack direction="block" gap="base">
      <s-banner
        tone="critical"
        heading={t("csv_import.banner_import_errors_title", {
          count: errorCount,
        })}
      >
        <s-paragraph>
          {t("csv_import.banner_import_errors_description")}
        </s-paragraph>
      </s-banner>

      {summary.errors_truncated && (
        <s-text color="subdued">
          {t("csv_import.text_errors_truncated", {
            shown: returnFormatNumber(MAX_PREVIEW_ERRORS_RETURNED),
            total: returnFormatNumber(errorCount),
          })}
        </s-text>
      )}
    </s-stack>
  );
};

export default PreviewErrorsBanner;
