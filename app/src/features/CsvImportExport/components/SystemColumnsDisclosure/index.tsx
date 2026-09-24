import type { IImportHeader, IImportWarning } from "@/types/csv";
import { returnFormatNumber } from "@/utils/funcFormat";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface IProps {
  headers: IImportHeader[];
  warningByHeader: Map<string, IImportWarning>;
}

const SystemColumnsDisclosure = ({ headers, warningByHeader }: IProps) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  if (headers.length === 0) return null;

  const warningCount = headers.filter((header) =>
    warningByHeader.has(header.header),
  ).length;

  const toggleLabel = isExpanded
    ? t("csv_import.button_hide_system_columns")
    : warningCount > 0
      ? t("csv_import.button_show_system_columns_with_warnings", {
          count: returnFormatNumber(headers.length),
          warningCount: returnFormatNumber(warningCount),
        })
      : t("csv_import.button_show_system_columns", { count: returnFormatNumber(headers.length) });

  return (
    <s-stack direction="block" gap="small-300">
      <s-link onClick={() => setIsExpanded((prev) => !prev)}>
        {toggleLabel}
      </s-link>

      {isExpanded && (
        <s-stack direction="block" gap="small-200">
          {headers.map((header) => {
            const warning = warningByHeader.get(header.header);
            const tooltipId = `system-column-warning-${header.header}`;

            return (
              <s-stack
                key={header.header}
                direction="inline"
                gap="small-200"
                alignItems="center"
              >
                <s-text color="subdued">{header.header}</s-text>
                <s-badge
                  tone={
                    header.classification === "required"
                      ? "critical"
                      : "neutral"
                  }
                >
                  {header.classification === "required"
                    ? t("csv_import.badge_required")
                    : header.classification}
                </s-badge>
                {warning && (
                  <>
                    <s-icon
                      type="alert-triangle"
                      tone="warning"
                      interestFor={tooltipId}
                    />
                    <s-tooltip id={tooltipId}>{warning.message}</s-tooltip>
                  </>
                )}
              </s-stack>
            );
          })}
        </s-stack>
      )}
    </s-stack>
  );
};

export default SystemColumnsDisclosure;
