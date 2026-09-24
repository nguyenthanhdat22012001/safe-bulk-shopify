import PaywallModal from "@/components/pricing/PaywallModal";
import ColumnMappingTable from "@/features/CsvImportExport/components/ColumnMappingTable";
import SystemColumnsDisclosure from "@/features/CsvImportExport/components/SystemColumnsDisclosure";
import { usePlanLimitErrorHandler } from "@/hooks/pricing/usePlanLimitErrorHandler";
import {
  csvImportQueries,
  useUpdateImportConfiguration,
} from "@/queries/csvQueries";
import type {
  IImportAnalysis,
  IImportHeader,
  TEmptyCellBehavior,
  TMappingDraft,
} from "@/types/csv";
import type { IApiResponseBase } from "@/types/serviceType";
import { resolveDefaultEmptyCellBehavior } from "@/utils/csv";
import { returnFormatNumber } from "@/utils/funcFormat";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const buildInitialDraft = (analysis: IImportAnalysis): TMappingDraft => {
  const targetsByKey = new Map(
    analysis.mapping_targets.map((target) => [target.key, target]),
  );
  return Object.fromEntries(
    analysis.headers.map((header) => {
      const target = targetsByKey.get(header.key);
      return [
        header.header,
        {
          selected: Boolean(target) || header.selected_by_default,
          targetKey: target ? header.key : null,
          emptyCellBehavior: target
            ? resolveDefaultEmptyCellBehavior(target)
            : "skip",
        },
      ];
    }),
  );
};

const extractErrorMessage = (error: unknown, fallback: string): string => {
  if (!axios.isAxiosError(error)) return fallback;
  const body = error.response?.data as Partial<IApiResponseBase> | undefined;
  return body?.message || fallback;
};

interface IProps {
  taskRunId: number;
  onSubmitted: () => void;
}

const ColumnMappingStep = ({ taskRunId, onSubmitted }: IProps) => {
  const { t } = useTranslation();

  const { data: taskRun } = useQuery(csvImportQueries.taskRun(taskRunId));

  const [draft, setDraft] = useState<TMappingDraft | null>(
    taskRun && taskRun?.status === "configuring"
      ? buildInitialDraft(taskRun.analysis)
      : null,
  );
  const [searchQuery, setSearchQuery] = useState("");

  const {
    mutate: updateConfiguration,
    isPending: isSubmitting,
    isError: isSubmitError,
    error: submitError,
    reset: resetConfiguration,
  } = useUpdateImportConfiguration();

  const { paywallVariant, handlePlanLimitError } = usePlanLimitErrorHandler();

  if (taskRun?.status === "configuring" && draft === null) {
    setDraft(buildInitialDraft(taskRun.analysis));
  }

  const setHeaderTarget = (headerName: string, targetKey: string) => {
    const convertTargetKey = targetKey === "null" ? null : targetKey;
    const nextTarget =
      convertTargetKey !== null
        ? taskRun?.analysis.mapping_targets.find(
            (target) => target.key === convertTargetKey,
          )
        : null;
    setDraft((prev) =>
      prev
        ? {
            ...prev,
            [headerName]: {
              ...prev[headerName],
              selected: Boolean(convertTargetKey),
              targetKey: convertTargetKey,
              emptyCellBehavior: nextTarget
                ? resolveDefaultEmptyCellBehavior(nextTarget)
                : "skip",
            },
          }
        : prev,
    );
  };

  const setHeaderEmptyCellBehavior = (
    headerName: string,
    behavior: TEmptyCellBehavior,
  ) => {
    setDraft((prev) =>
      prev
        ? {
            ...prev,
            [headerName]: { ...prev[headerName], emptyCellBehavior: behavior },
          }
        : prev,
    );
  };

  const handleSubmit = () => {
    if (!taskRun || !draft) return;

    const selectedHeaders = taskRun.analysis.headers
      .filter((header) => draft[header.header].selected)
      .map((header) => header.header);

    const fieldMappings = taskRun.analysis.headers
      .filter(
        (header) =>
          isMappableHeader(header) &&
          draft[header.header].selected &&
          draft[header.header].targetKey,
      )
      .map((header) => ({
        source_header: header.header,
        target_key: draft[header.header].targetKey as string,
        empty_cell_behavior: draft[header.header].emptyCellBehavior,
      }));

    updateConfiguration(
      {
        id: taskRun.id,
        body: {
          config_version: taskRun.configuration.config_version,
          selected_headers: selectedHeaders,
          field_mappings: fieldMappings,
        },
      },
      {
        onSuccess: onSubmitted,
        onError: (error) => {
          if (handlePlanLimitError(error, "csv_feature")) {
            resetConfiguration();
          }
        },
      },
    );
  };

  if (!taskRun || taskRun.status === "analyzing" || !draft) {
    return (
      <s-box
        padding="large-200"
        borderWidth="base"
        borderColor="base"
        borderStyle="dashed"
        borderRadius="base"
      >
        <s-stack direction="block" gap="base" alignItems="center">
          <s-spinner
            accessibilityLabel={t("csv_import.label_analyzing_spinner")}
            size="large"
          />
          <s-text>{t("csv_import.label_analyzing_spinner")}</s-text>
        </s-stack>
      </s-box>
    );
  }

  const warningByHeader = new Map(
    taskRun.analysis.warnings.map((warning) => [warning.header, warning]),
  );

  const isMappableHeader = (header: IImportHeader) =>
    !header.locked && header.classification === "editable";

  const mappableHeaders = taskRun.analysis.headers.filter(isMappableHeader);
  const systemHeaders = taskRun.analysis.headers.filter(
    (h) => !isMappableHeader(h),
  );

  const visibleMappableHeaders = searchQuery
    ? mappableHeaders.filter((h) =>
        h.header.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : mappableHeaders;

  return (
    <s-stack direction="block" gap="base">
      <s-stack direction="block" gap="small-300">
        <s-text type="strong">{t("csv_import.mapping_heading")}</s-text>
        <s-text color="subdued">{t("csv_import.mapping_description")}</s-text>
      </s-stack>

      {taskRun.analysis.warnings.length > 0 && (
        <s-banner tone="warning">
          {t("csv_import.banner_warnings_title", {
            count: taskRun.analysis.warnings.length,
          })}
        </s-banner>
      )}

      <s-text color="subdued">
        {t("csv_import.text_mapping_summary", {
          actionable: returnFormatNumber(mappableHeaders.length),
          system: returnFormatNumber(systemHeaders.length),
        })}
      </s-text>

      {mappableHeaders.length > 0 && (
        <>
          <s-search-field
            label={t("csv_import.label_search_columns")}
            labelAccessibilityVisibility="exclusive"
            value={searchQuery}
            onInput={(event) => setSearchQuery(event.currentTarget.value)}
          />

          <ColumnMappingTable
            headers={visibleMappableHeaders}
            draft={draft}
            mappingTargets={taskRun.analysis.mapping_targets}
            warningByHeader={warningByHeader}
            onChangeTarget={setHeaderTarget}
            onChangeEmptyCellBehavior={setHeaderEmptyCellBehavior}
          />
        </>
      )}

      <SystemColumnsDisclosure
        headers={systemHeaders}
        warningByHeader={warningByHeader}
      />

      {isSubmitError && (
        <s-banner tone="critical">
          {extractErrorMessage(
            submitError,
            t("csv_import.toast_mapping_save_error"),
          )}
        </s-banner>
      )}

      <s-button variant="primary" loading={isSubmitting} onClick={handleSubmit}>
        {t("csv_import.button_save_mapping")}
      </s-button>

      <PaywallModal variant={paywallVariant} pathReturn="/csv" />
    </s-stack>
  );
};

export default ColumnMappingStep;
