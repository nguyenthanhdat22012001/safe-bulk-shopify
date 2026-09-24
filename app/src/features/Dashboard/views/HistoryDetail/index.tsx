import Tabs, { type ITabItem } from "@/components/commonUIs/Tabs";
import PaywallModal, {
  type TPaywallVariant,
} from "@/components/pricing/PaywallModal";
import { ID_MODAL_SHOPIFY } from "@/constants/constantUnique";
import UndoConfirmModal from "@/features/Dashboard/components/UndoConfirmModal";
import CancelConfirmModal from "@/features/Dashboard/components/CancelConfirmModal";
import TaskRunItemGroupList from "@/features/Dashboard/components/TaskRunItemGroupList";
import HistoryDetailSkeleton from "@/features/Dashboard/components/HistoryDetailSkeleton";
import { useFormat } from "@/hooks/shopify";
import { csvImportQueries } from "@/queries/csvQueries";
import {
  taskRunQueries,
  useRetryTaskRun,
  useDownloadTaskRun,
} from "@/queries/taskRunQueries";
import { useShopStore } from "@/stores/shopStore";
import type { IImportSourceError } from "@/types/csv";
import { getImportSourceErrorContent } from "@/utils/csv";
import {
  APPLYING_STATUSES,
  formatObjectColumn,
  getRowAction,
  getStatusBadge,
  UNDO_LOCK_TOOLTIP_KEYS,
} from "@/utils/dashboard";
import { returnFormatNumber } from "@/utils/funcFormat";
import { useQuery } from "@tanstack/react-query";
import { Route } from "@/routes/history.$id";
import { useNavigate } from "@tanstack/react-router";
import { AxiosError } from "axios";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import type { TTaskRunItemPhase, TUndoLockedReason } from "@/types/editWizard";

const HistoryDetailView = () => {
  const { t } = useTranslation();
  const { returnFormatDate } = useFormat();
  const navigate = useNavigate();
  const { id } = Route.useParams();
  const taskRunId = Number(id);
  const isValidId = !Number.isNaN(taskRunId);

  const {
    data: taskRun,
    isLoading,
    isError,
    error,
  } = useQuery({
    ...taskRunQueries.taskRun(isValidId ? taskRunId : null),
    enabled: isValidId,
  });

  const isCsvImport = taskRun?.operation_type === "csv_import";
  const isCsvExport = taskRun?.operation_type === "csv_export";

  const { data: importTaskRun } = useQuery({
    ...csvImportQueries.taskRun(taskRun?.id ?? 0),
    enabled: isCsvImport,
  });

  const shopInfo = useShopStore((state) => state.shopInfo);
  const [undoRun, setUndoRun] = useState<{ id: number } | null>(null);
  const [cancelRun, setCancelRun] = useState<{ id: number } | null>(null);
  const [isLocallyCancelling, setIsLocallyCancelling] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [paywallVariant, setPaywallVariant] =
    useState<TPaywallVariant>("undo_expired");
  const [activePhase, setActivePhase] = useState<TTaskRunItemPhase>("apply");
  const { mutate: retryTaskRun } = useRetryTaskRun();
  const { mutate: downloadTaskRun } = useDownloadTaskRun();

  useEffect(() => {
    if (!taskRun || !isLocallyCancelling) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!APPLYING_STATUSES.has(taskRun.status)) setIsLocallyCancelling(false);
  }, [taskRun, isLocallyCancelling]);

  const openPaywall = (variant: TPaywallVariant) => {
    setPaywallVariant(variant);
    shopify.modal.show(ID_MODAL_SHOPIFY.pricing.modalPaywall);
  };

  const handleUndoLockedClick = (reason: NonNullable<TUndoLockedReason>) => {
    if (
      reason === "UNDO_WINDOW_EXPIRED" &&
      shopInfo.app_plan !== "professional"
    ) {
      openPaywall("undo_expired");
    }
  };

  const handleUndoClick = () => {
    if (!taskRun) return;
    setUndoRun({ id: taskRun.id });
    shopify.modal.show(ID_MODAL_SHOPIFY.dashboard.modalUndoConfirm);
  };

  const handleCancelClick = () => {
    if (!taskRun) return;
    setCancelRun({ id: taskRun.id });
    shopify.modal.show(ID_MODAL_SHOPIFY.dashboard.modalCancelConfirm);
  };

  const handleCancelled = () => setIsLocallyCancelling(true);

  const handleRetryClick = () => {
    if (!taskRun) return;
    setIsRetrying(true);
    retryTaskRun(taskRun.id, {
      onSettled: () => setIsRetrying(false),
      onError: () =>
        shopify.toast.show(t("dashboard.toast_retry_error"), { isError: true }),
    });
  };

  const handleDownloadClick = () => {
    if (!taskRun) return;
    setIsDownloading(true);
    downloadTaskRun(taskRun.id, {
      onSuccess: (downloaded) => {
        if (downloaded.download_url) {
          window.open(downloaded.download_url, "_blank", "noopener");
        } else {
          shopify.toast.show(t("dashboard.toast_download_error"), {
            isError: true,
          });
        }
      },
      onError: () =>
        shopify.toast.show(t("dashboard.toast_download_error"), {
          isError: true,
        }),
      onSettled: () => setIsDownloading(false),
    });
  };

  const renderAction = () => {
    if (!taskRun) return null;
    const action = getRowAction(taskRun, isLocallyCancelling);

    switch (action.type) {
      case "processing":
        return (
          <s-text color="subdued">{t("dashboard.button_processing")}</s-text>
        );
      case "cancel":
        return (
          <s-button
            variant="secondary"
            tone="critical"
            onClick={handleCancelClick}
          >
            {t("dashboard.button_cancel_task")}
          </s-button>
        );
      case "undo":
        return (
          <s-stack direction="block" gap="small-100">
            <s-button
              interestFor="detail-undo-expires-tooltip"
              variant="secondary"
              onClick={handleUndoClick}
            >
              {t("dashboard.button_undo")}
            </s-button>
            {taskRun.undo_window_expires_at && (
              <s-tooltip id="detail-undo-expires-tooltip">
                {t("dashboard.inline_undo_expires_at", {
                  date: returnFormatDate(taskRun.undo_window_expires_at, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }),
                })}
              </s-tooltip>
            )}
          </s-stack>
        );
      case "undo_locked":
        return (
          <>
            <s-button
              variant="secondary"
              icon="lock"
              interestFor="detail-undo-lock-tooltip"
              onClick={() => handleUndoLockedClick(action.reason)}
            >
              {t("dashboard.button_undo")}
            </s-button>
            <s-tooltip id="detail-undo-lock-tooltip">
              {t(UNDO_LOCK_TOOLTIP_KEYS[action.reason])}
            </s-tooltip>
          </>
        );
      case "download":
        return (
          <s-button
            variant="secondary"
            loading={isDownloading}
            disabled={isDownloading}
            onClick={handleDownloadClick}
          >
            {t("dashboard.button_download")}
          </s-button>
        );
      case "retry":
        return (
          <s-button
            variant="secondary"
            loading={isRetrying}
            disabled={isRetrying}
            onClick={handleRetryClick}
          >
            {taskRun.status === "expired"
              ? t("dashboard.button_recreate_file")
              : t("dashboard.button_retry")}
          </s-button>
        );
      case "configure":
      case "preview":
        return (
          <s-button
            variant="secondary"
            onClick={() =>
              navigate({
                to: "/csv",
                search: { mode: "import", taskRunId: taskRun.id },
              })
            }
          >
            {t(
              action.type === "configure"
                ? "dashboard.button_configure"
                : "dashboard.button_preview",
            )}
          </s-button>
        );
      case "none":
        return <s-text color="subdued">—</s-text>;
    }
  };

  const isNotFound =
    !isValidId ||
    (error instanceof AxiosError && error.response?.status === 404);

  const goToDashboard = () => navigate({ to: "/" });

  if (isLoading) {
    return (
      <s-page heading={t("dashboard.history_detail_title", { id })}>
        <s-button slot="secondary-actions" onClick={goToDashboard}>
          {t("dashboard.button_back_to_dashboard")}
        </s-button>
        <HistoryDetailSkeleton />
      </s-page>
    );
  }

  if (isNotFound) {
    return (
      <s-page heading={t("dashboard.empty_history_detail_not_found_title")}>
        <s-section>
          <s-stack direction="block" gap="base" alignItems="center">
            <s-paragraph>
              {t("dashboard.empty_history_detail_not_found_description")}
            </s-paragraph>
            <s-button variant="primary" onClick={goToDashboard}>
              {t("dashboard.button_back_to_dashboard")}
            </s-button>
          </s-stack>
        </s-section>
      </s-page>
    );
  }

  if (isError || !taskRun) {
    return (
      <s-page heading={t("common.error")}>
        <s-section>
          <s-stack direction="block" gap="base" alignItems="center">
            <s-paragraph>{t("common.error_description")}</s-paragraph>
            <s-button
              variant="primary"
              onClick={() => window.location.reload()}
            >
              {t("common.buttons_retry")}
            </s-button>
          </s-stack>
        </s-section>
      </s-page>
    );
  }

  const badge = getStatusBadge(taskRun.status, taskRun.operation_type, false);
  const { productCount, variantCount } = formatObjectColumn(
    taskRun.summary_counts,
  );

  const isFailedCsvImport = isCsvImport && taskRun.status === "failed";
  const sourceErrors = (importTaskRun?.preview?.errors ?? []).filter(
    (error): error is IImportSourceError => error.row_number === null,
  );

  const itemsTabItems: ITabItem[] = [
    {
      value: "apply",
      label: t("dashboard.history_detail_subsection_items_apply"),
    },
    ...(taskRun.undo
      ? [
          {
            value: "undo",
            label: t("dashboard.history_detail_subsection_items_undo"),
          },
        ]
      : []),
  ];

  return (
    <s-page heading={t("dashboard.history_detail_title", { id: taskRun.id })}>
      <s-button slot="secondary-actions" onClick={goToDashboard}>
        {t("dashboard.button_back_to_dashboard")}
      </s-button>

      <div className="flex flex-col gap-6">
        <s-section heading={t("dashboard.history_detail_section_summary")}>
          <s-grid gridTemplateColumns="1fr 1fr" gap="base">
            <s-stack direction="block" gap="small-100">
              <s-text color="subdued">
                {t("dashboard.table_column_status")}
              </s-text>
              <s-badge tone={badge.tone}>{t(badge.labelKey)}</s-badge>
            </s-stack>

            <s-stack direction="block" gap="small-100">
              <s-text color="subdued">
                {t("dashboard.table_column_label")}
              </s-text>
              <s-text>{taskRun.label || "--"}</s-text>
            </s-stack>

            <s-stack direction="block" gap="small-100">
              <s-text color="subdued">
                {t("dashboard.history_detail_label_operation_type")}
              </s-text>
              <s-text>{taskRun.operation_type}</s-text>
            </s-stack>

            <s-stack direction="block" gap="small-100">
              <s-text color="subdued">
                {t("dashboard.table_column_object")}
              </s-text>
              <s-text>
                {variantCount === null
                  ? t("dashboard.object_products", {
                      count: returnFormatNumber(productCount),
                    })
                  : t("dashboard.object_products_with_variants", {
                      productCount: returnFormatNumber(productCount),
                      variantCount: returnFormatNumber(variantCount),
                    })}
              </s-text>
            </s-stack>

            {taskRun.target_count != null && (
              <s-stack direction="block" gap="small-100">
                <s-text color="subdued">
                  {t("dashboard.history_detail_label_target_count")}
                </s-text>
                <s-text>{returnFormatNumber(taskRun.target_count)}</s-text>
              </s-stack>
            )}

            {taskRun.error_count != null && (
              <s-stack direction="block" gap="small-100">
                <s-text color="subdued">
                  {t("dashboard.history_detail_label_error_count")}
                </s-text>
                <s-text>{returnFormatNumber(taskRun.error_count)}</s-text>
              </s-stack>
            )}

            {taskRun.skipped_count != null && (
              <s-stack direction="block" gap="small-100">
                <s-text color="subdued">
                  {t("dashboard.history_detail_label_skipped_count")}
                </s-text>
                <s-text>{returnFormatNumber(taskRun.skipped_count)}</s-text>
              </s-stack>
            )}

            <s-stack direction="block" gap="small-100">
              <s-text color="subdued">
                {t("dashboard.table_column_performed_by")}
              </s-text>
              <s-text>
                {taskRun.actor?.name ??
                  t("dashboard.inline_performed_by_system")}
              </s-text>
            </s-stack>

            {taskRun.started_at && (
              <s-stack direction="block" gap="small-100">
                <s-text color="subdued">
                  {t("dashboard.history_detail_label_started_at")}
                </s-text>
                <s-text>
                  {returnFormatDate(taskRun.started_at, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </s-text>
              </s-stack>
            )}

            {taskRun.completed_at && (
              <s-stack direction="block" gap="small-100">
                <s-text color="subdued">
                  {t("dashboard.history_detail_label_completed_at")}
                </s-text>
                <s-text>
                  {returnFormatDate(taskRun.completed_at, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </s-text>
              </s-stack>
            )}

            {taskRun.undone_at && (
              <s-stack direction="block" gap="small-100">
                <s-text color="subdued">
                  {t("dashboard.history_detail_label_undone_at")}
                </s-text>
                <s-text>
                  {returnFormatDate(taskRun.undone_at, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </s-text>
              </s-stack>
            )}

            <s-stack direction="block" gap="small-100">
              <s-text color="subdued">
                {t("dashboard.table_column_action")}
              </s-text>
              {renderAction()}
            </s-stack>
          </s-grid>
        </s-section>

        {isFailedCsvImport && (
          <s-section padding="none">
            <s-banner
              tone="critical"
              heading={t("csv_import.banner_import_failed_title")}
            >
              <s-stack direction="block" gap="small-200">
                {sourceErrors.length > 0 ? (
                  sourceErrors.map((error, index) => {
                    const { key, values } = getImportSourceErrorContent(error);
                    return (
                      <s-paragraph key={`${error.code}-${index}`}>
                        {t(key, values)}
                      </s-paragraph>
                    );
                  })
                ) : (
                  <s-paragraph>
                    {t("csv_import.banner_import_failed_description_generic")}
                  </s-paragraph>
                )}
              </s-stack>
            </s-banner>
          </s-section>
        )}

        {taskRun.undo && (
          <s-section heading={t("dashboard.history_detail_section_undo")}>
            <s-grid gridTemplateColumns="1fr 1fr" gap="base">
              <s-stack direction="block" gap="small-100">
                <s-text color="subdued">
                  {t("dashboard.table_column_status")}
                </s-text>
                <s-badge
                  tone={
                    getStatusBadge(
                      taskRun.undo.status,
                      taskRun.operation_type,
                      false,
                    ).tone
                  }
                >
                  {t(
                    getStatusBadge(
                      taskRun.undo.status,
                      taskRun.operation_type,
                      false,
                    ).labelKey,
                  )}
                </s-badge>
              </s-stack>

              <s-stack direction="block" gap="small-100">
                <s-text color="subdued">
                  {t("dashboard.history_detail_label_undo_attempt")}
                </s-text>
                <s-text>{returnFormatNumber(taskRun.undo.attempt)}</s-text>
              </s-stack>

              <s-stack direction="block" gap="small-100">
                <s-text color="subdued">
                  {t("dashboard.history_detail_label_success_count")}
                </s-text>
                <s-text>
                  {returnFormatNumber(taskRun.undo.success_count)}
                </s-text>
              </s-stack>

              <s-stack direction="block" gap="small-100">
                <s-text color="subdued">
                  {t("dashboard.history_detail_label_error_count")}
                </s-text>
                <s-text>{returnFormatNumber(taskRun.undo.error_count)}</s-text>
              </s-stack>

              <s-stack direction="block" gap="small-100">
                <s-text color="subdued">
                  {t("dashboard.history_detail_label_object_count")}
                </s-text>
                <s-text>{returnFormatNumber(taskRun.undo.object_count)}</s-text>
              </s-stack>

              <s-stack direction="block" gap="small-100">
                <s-text color="subdued">
                  {t("dashboard.history_detail_label_target_count")}
                </s-text>
                <s-text>{returnFormatNumber(taskRun.undo.target_count)}</s-text>
              </s-stack>

              {taskRun.undo.skipped_count != null && (
                <s-stack direction="block" gap="small-100">
                  <s-text color="subdued">
                    {t("dashboard.history_detail_label_skipped_count")}
                  </s-text>
                  <s-text>
                    {returnFormatNumber(taskRun.undo.skipped_count)}
                  </s-text>
                </s-stack>
              )}

              {taskRun.undo.error_message && (
                <s-stack direction="block" gap="small-100">
                  <s-text color="subdued">
                    {t("dashboard.history_detail_label_error_message")}
                  </s-text>
                  <s-text>{taskRun.undo.error_message}</s-text>
                </s-stack>
              )}
            </s-grid>
          </s-section>
        )}

        {!isFailedCsvImport && !isCsvExport && (
          <s-section heading={t("dashboard.history_detail_section_items")}>
            <s-stack direction="block" gap="large">
              <Tabs
                items={itemsTabItems}
                value={activePhase}
                onChange={(value) => setActivePhase(value as TTaskRunItemPhase)}
                accessibilityLabel={t("dashboard.history_detail_section_items")}
              />
              <TaskRunItemGroupList
                taskRunId={taskRun.id}
                phase={activePhase}
              />
            </s-stack>
          </s-section>
        )}
      </div>

      <UndoConfirmModal run={undoRun} />
      <CancelConfirmModal run={cancelRun} onCancelled={handleCancelled} />
      <PaywallModal variant={paywallVariant} pathReturn={`/history/${id}`} />
    </s-page>
  );
};

export default HistoryDetailView;
