import type {
  IImportHeader,
  IImportMappingTarget,
  IImportWarning,
  TEmptyCellBehavior,
  TMappingDraft,
} from "@/types/csv";
import { isEmptyCellBehaviorEditable } from "@/utils/csv";
import type { CallbackEvent } from "@shopify/polaris-types";
import { useTranslation } from "react-i18next";

interface IEmptyCellBehaviorCellProps {
  headerName: string;
  isHeaderLocked: boolean;
  target: IImportMappingTarget | undefined;
  value: TEmptyCellBehavior;
  onChange: (behavior: TEmptyCellBehavior) => void;
}

const EmptyCellBehaviorCell = ({
  headerName,
  isHeaderLocked,
  target,
  value,
  onChange,
}: IEmptyCellBehaviorCellProps) => {
  const { t } = useTranslation();

  if (!target || isHeaderLocked) {
    return <s-text color="subdued">—</s-text>;
  }

  if (!isEmptyCellBehaviorEditable(target)) {
    return (
      <s-stack direction="inline" gap="small-100" alignItems="center">
        <s-icon type="lock" color="subdued" />
        <s-text color="subdued">
          {t("csv_import.text_empty_behavior_locked")}
        </s-text>
      </s-stack>
    );
  }

  const handleChange = (event: CallbackEvent<"s-select">) => {
    const selected = event.currentTarget.value;
    if (selected === "skip" || selected === "clear") onChange(selected);
  };

  return (
    <s-select
      label={t("csv_import.choice_empty_behavior_label", {
        field: target.label,
      })}
      value={value}
      disabled={isHeaderLocked}
      onInput={handleChange}
      labelAccessibilityVisibility="exclusive"
      name={`empty-cell-behavior-${headerName}`}
    >
      <s-option value="skip">
        {t("csv_import.choice_keep_current", { field: target.label })}
      </s-option>
      <s-option value="clear">
        {t("csv_import.choice_clear_all", { field: target.label })}
      </s-option>
    </s-select>
  );
};

interface IProps {
  headers: IImportHeader[];
  draft: TMappingDraft;
  mappingTargets: IImportMappingTarget[];
  warningByHeader: Map<string, IImportWarning>;
  onChangeTarget: (headerName: string, targetKey: string) => void;
  onChangeEmptyCellBehavior: (
    headerName: string,
    behavior: TEmptyCellBehavior,
  ) => void;
}

const ColumnMappingTable = ({
  headers,
  draft,
  mappingTargets,
  warningByHeader,
  onChangeTarget,
  onChangeEmptyCellBehavior,
}: IProps) => {
  const { t } = useTranslation();

  if (headers.length === 0) {
    return (
      <s-stack direction="block" gap="base" alignItems="center">
        <s-text color="subdued">
          {t("csv_import.text_no_mapping_search_matches")}
        </s-text>
      </s-stack>
    );
  }

  return (
    <s-table>
      <s-table-header-row>
        <s-table-header>{t("csv_import.table_column_source")}</s-table-header>
        <s-table-header>
          {t("csv_import.table_column_classification")}
        </s-table-header>
        <s-table-header>{t("csv_import.table_column_target")}</s-table-header>
        <s-table-header>
          {t("csv_import.table_column_empty_behavior")}
        </s-table-header>
      </s-table-header-row>
      <s-table-body>
        {headers.map((header) => {
          const row = draft[header.header];
          const warning = warningByHeader.get(header.header);
          const tooltipId = `mapping-warning-${header.header}`;
          const target = mappingTargets.find(
            (candidate) => candidate.key === row.targetKey,
          );

          return (
            <s-table-row key={header.header}>
              <s-table-cell>
                <s-stack direction="inline" gap="small-200" alignItems="center">
                  <s-text>{header.header}</s-text>
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
              </s-table-cell>
              <s-table-cell>
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
              </s-table-cell>
              <s-table-cell>
                <s-select
                  value={row.targetKey ?? ""}
                  disabled={header.locked}
                  onInput={(event) =>
                    onChangeTarget(header.header, event.currentTarget.value)
                  }
                >
                  <s-option value="null">
                    {t("csv_import.option_dont_import")}
                  </s-option>
                  {mappingTargets.map((mappingTarget) => (
                    <s-option key={mappingTarget.key} value={mappingTarget.key}>
                      {mappingTarget.label}
                    </s-option>
                  ))}
                </s-select>
              </s-table-cell>
              <s-table-cell>
                <EmptyCellBehaviorCell
                  headerName={header.header}
                  isHeaderLocked={header.locked}
                  target={target}
                  value={row.emptyCellBehavior}
                  onChange={(behavior) =>
                    onChangeEmptyCellBehavior(header.header, behavior)
                  }
                />
              </s-table-cell>
            </s-table-row>
          );
        })}
      </s-table-body>
    </s-table>
  );
};

export default ColumnMappingTable;
