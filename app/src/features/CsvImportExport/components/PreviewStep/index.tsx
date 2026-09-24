import Tabs, { type ITabItem } from "@/components/commonUIs/Tabs";
import PaywallModal from "@/components/pricing/PaywallModal";
import PreviewErrorsBanner from "@/features/CsvImportExport/components/PreviewErrorsBanner";
import PreviewOperationRow from "@/features/CsvImportExport/components/PreviewOperationRow";
import PreviewRunFooter from "@/features/CsvImportExport/components/PreviewRunFooter";
import PreviewZeroPriceBanner from "@/features/CsvImportExport/components/PreviewZeroPriceBanner";
import TrialQuotaReminderBanner from "@/features/CsvImportExport/components/TrialQuotaReminderBanner";
import { usePlanLimitErrorHandler } from "@/hooks/pricing/usePlanLimitErrorHandler";
import {
  csvImportQueries,
  ECsvImportQueryKeys,
  useRunImport,
  useUpdateImportConfiguration,
  useUpdatePreviewItemIgnored,
} from "@/queries/csvQueries";
import { EPricingQueryKeys } from "@/queries/pricingQueries";
import type {
  ICsvImportTaskRun,
  IImportPreviewOperation,
  TPreviewIgnoredFilter,
  TPreviewWarningFilter,
  TWarningPolicy,
} from "@/types/csv";
import { buildRowErrorMap } from "@/utils/csv";
import { returnFormatNumber } from "@/utils/funcFormat";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const CONFLICT_STATUS = 409;

const isConflictError = (error: unknown): boolean =>
  axios.isAxiosError(error) && error.response?.status === CONFLICT_STATUS;

interface IProps {
  taskRun: ICsvImportTaskRun;
  /** Called after the warning policy is saved, so the orchestrator can flip
   * back to `AWAITING_PREVIEW` and re-enter the polling path. */
  onPolicyChanged: () => void;
  /** Called after a successful run so the orchestrator can flip the wizard
   * into its running state and navigate away. */
  onRunStarted: () => void;
  /** Resets the wizard back to Step A, for the no-changes banner's
   * "return to file editing" action. */
  onStartOver: () => void;
}

const PreviewStep = ({
  taskRun,
  onPolicyChanged,
  onRunStarted,
  onStartOver,
}: IProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [warningFilter, setWarningFilter] = useState<
    TPreviewWarningFilter | undefined
  >(undefined);
  const [ignoredFilter, setIgnoredFilter] =
    useState<TPreviewIgnoredFilter>("exclude");
  const [conflictMessage, setConflictMessage] = useState<string | null>(null);
  const [hasHitPlanLimit, setHasHitPlanLimit] = useState(false);
  const { paywallVariant, handlePlanLimitError } = usePlanLimitErrorHandler();

  // const isBlocked = taskRun.preview?.valid === false;
  const isFiltering = warningFilter !== undefined;

  const {
    data: preview,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    ...csvImportQueries.preview(taskRun.id, page, {
      warning: warningFilter,
      ignored: ignoredFilter,
      changed: "only",
    }),
  });

  const { mutate: updateItemIgnored, isPending: isUpdatingItem } =
    useUpdatePreviewItemIgnored();
  const { mutate: updateConfiguration, isPending: isSavingPolicy } =
    useUpdateImportConfiguration();
  const { mutate: startRun, isPending: isRunning } = useRunImport();

  const invalidatePreview = () =>
    queryClient.invalidateQueries({
      queryKey: [ECsvImportQueryKeys.importPreview, taskRun.id],
    });

  const invalidateTaskRun = () =>
    queryClient.invalidateQueries({
      queryKey: [ECsvImportQueryKeys.importTaskRun, taskRun.id],
    });

  const handleToggleIgnored = (operation: IImportPreviewOperation) => {
    const nextIgnored = !operation.ignored;
    updateItemIgnored(
      { id: taskRun.id, itemId: operation.id, ignored: nextIgnored },
      {
        onSuccess: (result) => {
          shopify.toast.show(
            t(
              nextIgnored
                ? "csv_import.toast_record_ignored"
                : "csv_import.toast_record_restored",
              { count: result.affected_count },
            ),
          );
          invalidatePreview();
        },
        onError: (error) => {
          if (isConflictError(error)) {
            setConflictMessage(t("csv_import.banner_item_conflict"));
            invalidateTaskRun();
            return;
          }
          shopify.toast.show(t("csv_import.toast_record_update_error"), {
            isError: true,
          });
        },
      },
    );
  };

  const handleChangePolicy = (warningPolicy: TWarningPolicy) => {
    updateConfiguration(
      {
        id: taskRun.id,
        body: {
          config_version: taskRun.configuration.config_version,
          selected_headers: taskRun.configuration.selected_headers,
          // The PUT replaces the whole configuration object, so
          // selected_headers/field_mappings must be resent even though only
          // warning_policy changed. field_mappings echoes back
          // empty_cell_behavior too — omitting it would silently reset every
          // field's empty-cell behavior to the backend's "skip" default the
          // next time the merchant merely toggles the zero-price policy.
          field_mappings: taskRun.configuration.field_mappings.map(
            (mapping) => ({
              source_header: mapping.source_header,
              target_key: mapping.target_key,
              empty_cell_behavior: mapping.empty_cell_behavior,
            }),
          ),
          warning_policy: warningPolicy,
        },
      },
      {
        // The backend rebuilds the plan, so the run goes back through
        // `previewing` → `ready`. Handing control to the orchestrator keeps
        // that on one code path instead of two.
        onSuccess: () => {
          invalidateTaskRun();
          onPolicyChanged();
        },
        onError: () =>
          shopify.toast.show(t("csv_import.toast_policy_update_error"), {
            isError: true,
          }),
      },
    );
  };

  // const handleChangeWarningFilter = (
  //   value: TPreviewWarningFilter | undefined,
  // ) => {
  //   setWarningFilter(value);
  //   setPage(1);
  // };

  const handleChangeIgnoredFilter = (value: TPreviewIgnoredFilter) => {
    setIgnoredFilter(value);
    setPage(1);
  };

  const handleClearFilters = () => {
    setWarningFilter(undefined);
    setPage(1);
  };

  const handleRun = () => {
    if (!preview) return;
    startRun(
      // The preview's config_version identifies the exact plan the merchant
      // just reviewed and accepted — not taskRun.configuration.config_version,
      // which can have moved on since the preview was fetched.
      { id: taskRun.id, configVersion: preview.config_version },
      {
        onSuccess: () => {
          shopify.toast.show(t("csv_import.toast_run_started"));
          queryClient.invalidateQueries({
            queryKey: [EPricingQueryKeys.getSubscriptions],
          });
          onRunStarted();
        },
        onError: (error) => {
          if (handlePlanLimitError(error, "csv_feature")) {
            setHasHitPlanLimit(true);
            return;
          }
          if (isConflictError(error)) {
            setConflictMessage(t("csv_import.banner_run_conflict"));
            invalidatePreview();
            invalidateTaskRun();
            return;
          }
          shopify.toast.show(t("csv_import.banner_preview_fetch_error"), {
            isError: true,
          });
        },
      },
    );
  };

  if (isLoading) {
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
            accessibilityLabel={t("csv_import.label_building_preview")}
            size="large"
          />
          <s-text>{t("csv_import.label_building_preview")}</s-text>
        </s-stack>
      </s-box>
    );
  }

  if (isError || !preview) {
    return (
      <s-stack direction="block" gap="base">
        <s-banner tone="critical">
          {t("csv_import.banner_preview_fetch_error")}
        </s-banner>
        <s-button variant="secondary" onClick={() => refetch()}>
          {t("csv_import.button_retry")}
        </s-button>
      </s-stack>
    );
  }

  const operations = preview.operations.data;
  const hasNoResults = operations.length === 0;
  const rowErrorMap = buildRowErrorMap(preview.errors);

  // The query always sends `changed: "only"`, so an empty result set on the
  // default "Active" tab, with no additional warning filter narrowing it,
  // means every matched line already has the same after-value as before —
  // confirmed by BE as the sole cause of that combination (FIX #12).
  const isNoChangesDetected =
    hasNoResults &&
    !isFiltering &&
    ignoredFilter === "exclude" &&
    preview.summary.total_records > 0;

  const ignoredTabItems: ITabItem[] = [
    { value: "exclude", label: t("csv_import.tab_filter_active") },
    { value: "only", label: t("csv_import.tab_filter_ignored") },
  ];

  return (
    <s-stack direction="block" gap="base">
      {conflictMessage && (
        <s-banner tone="critical">{conflictMessage}</s-banner>
      )}

      {!preview.valid && (
        <PreviewErrorsBanner
          errors={preview.errors}
          summary={preview.summary}
        />
      )}

      {isNoChangesDetected && (
        <s-banner
          tone="warning"
          heading={t("csv_import.banner_no_changes_title")}
        >
          <s-stack direction="block" gap="small-200">
            <s-paragraph>
              {t("csv_import.banner_no_changes_description")}
            </s-paragraph>
            <s-button variant="secondary" onClick={onStartOver}>
              {t("csv_import.button_return_to_upload")}
            </s-button>
          </s-stack>
        </s-banner>
      )}

      <PreviewZeroPriceBanner
        operations={operations}
        policy={taskRun.configuration.warning_policy}
        isSaving={isSavingPolicy}
        onChangePolicy={handleChangePolicy}
      />

      <Tabs
        items={ignoredTabItems}
        value={ignoredFilter}
        onChange={(value) =>
          handleChangeIgnoredFilter(value as TPreviewIgnoredFilter)
        }
        accessibilityLabel={t("csv_import.label_filter_ignored")}
      />

      {/* <PreviewFilterBar
        warningFilter={warningFilter}
        onChangeWarningFilter={handleChangeWarningFilter}
      /> */}

      {isFiltering && (
        <s-text color="subdued">
          {t("csv_import.summary_records_filtered", {
            filtered: returnFormatNumber(preview.summary.filtered_records),
            total: returnFormatNumber(preview.summary.logical_records),
          })}
        </s-text>
      )}

      {hasNoResults ? (
        <s-stack minBlockSize="300px" direction="block" gap="base" alignItems="center" justifyContent="center">
          <s-text color="subdued">
            {t("csv_import.text_filter_empty_state")}
          </s-text>
          {isFiltering && (
            <s-button variant="secondary" onClick={handleClearFilters}>
              {t("csv_import.button_clear_filters")}
            </s-button>
          )}
        </s-stack>
      ) : (
        <>
          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-300">
                  <th scope="col" className="p-2 text-left font-medium">
                    {t("csv_import.table_column_row")}
                  </th>
                  <th scope="col" className="p-2 text-left font-medium">
                    {t("csv_import.table_column_record")}
                  </th>
                  <th scope="col" className="p-2 text-left font-medium">
                    {t("csv_import.table_column_field")}
                  </th>
                  <th scope="col" className="p-2 text-left font-medium">
                    {t("csv_import.table_column_before")}
                  </th>
                  <th scope="col" className="p-2 text-left font-medium">
                    {t("csv_import.table_column_after")}
                  </th>
                  <th scope="col" className="p-2 text-left font-medium">
                    {t("csv_import.table_column_actions")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {operations.map((operation, index) => (
                  <PreviewOperationRow
                    key={operation.id}
                    operation={operation}
                    groupIndex={index}
                    rowErrorMap={rowErrorMap}
                    isUpdating={isUpdatingItem}
                    onToggleIgnored={handleToggleIgnored}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <s-stack direction="inline" gap="base" alignItems="center">
            <s-button
              variant="secondary"
              disabled={preview.operations.current_page <= 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              {t("csv_import.button_pagination_previous")}
            </s-button>
            <s-button
              variant="secondary"
              disabled={
                preview.operations.current_page >= preview.operations.last_page
              }
              onClick={() => setPage((prev) => prev + 1)}
            >
              {t("csv_import.button_pagination_next")}
            </s-button>
          </s-stack>
        </>
      )}

      <TrialQuotaReminderBanner
        expectedProductCount={preview.summary.included_records}
      />

      <PreviewRunFooter
        summary={preview.summary}
        isRunning={isRunning}
        disabled={hasHitPlanLimit}
        forceConfirm={isNoChangesDetected}
        onRun={handleRun}
      />

      <PaywallModal variant={paywallVariant} pathReturn="/csv" />
    </s-stack>
  );
};

export default PreviewStep;
