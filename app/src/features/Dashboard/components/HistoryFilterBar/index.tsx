import DatePicker from "@/components/commonUIs/DatePicker";
import type { IHistoryFilters } from "@/types/dashboard";
import type { TTaskRunOperationType, TTaskRunStatus } from "@/types/editWizard";
import { getStatusLabelKey } from "@/utils/dashboard";
import { useTranslation } from "react-i18next";

interface IProps {
  filters: IHistoryFilters;
  onChange: <K extends keyof IHistoryFilters>(
    key: K,
    value: IHistoryFilters[K],
  ) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
}

const STATUS_OPTIONS: TTaskRunStatus[] = [
  "completed",
  "completed_with_errors",
  "failed",
  "canceled",
  "expired",
  "undone",
  "undone_with_errors",
  "undo_failed",
];

const OPERATION_TYPE_OPTIONS: {
  value: TTaskRunOperationType;
  labelKey: string;
}[] = [
  {
    value: "manual_edit",
    labelKey: "dashboard.inline_filter_operation_type_manual_edit",
  },
  {
    value: "filter_edit",
    labelKey: "dashboard.inline_filter_operation_type_filter_edit",
  },
  {
    value: "csv_import",
    labelKey: "dashboard.inline_filter_operation_type_csv_import",
  },
  {
    value: "csv_export",
    labelKey: "dashboard.inline_filter_operation_type_csv_export",
  },
];

const HistoryFilterBar = ({
  filters,
  onChange,
  onClear,
  hasActiveFilters,
}: IProps) => {
  const { t } = useTranslation();

  return (
    <div className="p-3 pt-0">
      <s-grid
        gridTemplateColumns="repeat(5, 1fr)"
        gap="small"
        justifyContent="center"
        alignItems="end"
      >
        <s-grid-item gridColumn="span 3">
          <s-search-field
            label={t("dashboard.inline_search_label")}
            placeholder={t("dashboard.inline_search_placeholder")}
            value={filters.search}
            onInput={(e) => onChange("search", e.currentTarget.value)}
          />
        </s-grid-item>
        <s-grid-item gridColumn="span 1">
          <s-select
            label={t("dashboard.inline_filter_status_label")}
            value={filters.status ?? "any"}
            onInput={(e) =>
              onChange(
                "status",
                e.currentTarget.value === "any"
                  ? null
                  : (e.currentTarget.value as TTaskRunStatus),
              )
            }
          >
            <s-option value="any">{t("common.txt_any")}</s-option>
            {STATUS_OPTIONS.map((status) => (
              <s-option key={status} value={status}>
                {t(getStatusLabelKey(status))}
              </s-option>
            ))}
          </s-select>
        </s-grid-item>
        <s-grid-item gridColumn="span 1">
          <s-select
            label={t("dashboard.inline_filter_operation_type_label")}
            value={filters.operation_type ?? "any"}
            onInput={(e) =>
              onChange(
                "operation_type",
                e.currentTarget.value === "any"
                  ? null
                  : (e.currentTarget.value as TTaskRunOperationType),
              )
            }
          >
            <s-option value="any">{t("common.txt_any")}</s-option>
            {OPERATION_TYPE_OPTIONS.map((option) => (
              <s-option key={option.value} value={option.value}>
                {t(option.labelKey)}
              </s-option>
            ))}
          </s-select>
        </s-grid-item>

        <s-grid-item gridColumn="span 2">
          <DatePicker
            label={t("dashboard.inline_filter_date_from_label")}
            value={filters.date_from}
            onChange={(value) => onChange("date_from", value)}
          />
        </s-grid-item>
        <s-grid-item gridColumn="span 2">
          <DatePicker
            label={t("dashboard.inline_filter_date_to_label")}
            value={filters.date_to}
            onChange={(value) => onChange("date_to", value)}
          />
        </s-grid-item>
        {hasActiveFilters && (
          <s-grid-item gridColumn="auto">
            <s-button variant="tertiary" onClick={onClear}>
              {t("dashboard.button_clear_filters")}
            </s-button>
          </s-grid-item>
        )}
      </s-grid>
    </div>
  );
};

export default HistoryFilterBar;
