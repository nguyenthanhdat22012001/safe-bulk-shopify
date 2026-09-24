import ProgressBar from "@/components/commonUIs/ProgressBar";
import { ID_MODAL_SHOPIFY } from "@/constants/constantUnique";
import { DEFAULT_HISTORY_FILTERS, HISTORY_SEARCH_DEBOUNCE_MS } from "@/constants/dashboard";
import { useFormat } from "@/hooks/shopify";
import {
  taskRunQueries,
  useDownloadTaskRun,
  useRetryTaskRun,
} from "@/queries/taskRunQueries";
import type { IHistoryFilters } from "@/types/dashboard";
import type {
  ITaskRunListResource,
  TTaskRunStatus,
  TUndoLockedReason,
} from "@/types/editWizard";
import {
  APPLYING_STATUSES,
  formatObjectColumn,
  getRowAction,
  getStatusBadge,
  UNDO_LOCK_TOOLTIP_KEYS,
} from "@/utils/dashboard";
import { returnFormatNumber } from "@/utils/funcFormat";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDebounce } from "use-debounce";
import UndoConfirmModal from "../UndoConfirmModal";
import HistoryFilterBar from "../HistoryFilterBar";
import { useActionsCheckList } from "@/hooks/dashboard";

interface IProps {
  onCreateClick: () => void;
  onUndoLockedClick: (
    run: ITaskRunListResource,
    reason: NonNullable<TUndoLockedReason>,
  ) => void;
  onCancelClick: (run: ITaskRunListResource) => void;
  cancellingIds: Set<number>;
  onCancellingResolved: (ids: number[]) => void;
}

const STATUS_ACTIVE_DETAIL_HISTORY: Array<TTaskRunStatus> = [
  "completed",
  "completed_with_errors",
  "undone",
  "undone_with_errors",
  "failed",
];

const HistoryTable = ({
  onCreateClick,
  onUndoLockedClick,
  onCancelClick,
  cancellingIds,
  onCancellingResolved,
}: IProps) => {
  const { t } = useTranslation();
  const { returnFormatDate } = useFormat();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<IHistoryFilters>(DEFAULT_HISTORY_FILTERS);
  const [debouncedSearch] = useDebounce(filters.search, HISTORY_SEARCH_DEBOUNCE_MS);

  const hasActiveFilters =
    filters.search !== "" ||
    filters.status !== null ||
    filters.operation_type !== null ||
    filters.date_from !== "" ||
    filters.date_to !== "";

  const { data, isLoading } = useQuery(
    taskRunQueries.taskRuns({
      page,
      search: debouncedSearch || undefined,
      status: filters.status ?? undefined,
      operation_type: filters.operation_type ?? undefined,
      date_from: filters.date_from || undefined,
      date_to: filters.date_to || undefined,
    }),
  );

  const handleFilterChange = <K extends keyof IHistoryFilters>(
    key: K,
    value: IHistoryFilters[K],
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters(DEFAULT_HISTORY_FILTERS);
    setPage(1);
  };
  const { mutate: retryTaskRun } = useRetryTaskRun();
  const { mutate: downloadTaskRun } = useDownloadTaskRun();
  const navigate = useNavigate();
  const { onMarkTaskDoneBackground, allCompleted, isDismissed } =
    useActionsCheckList();

  const [undoRun, setUndoRun] = useState<ITaskRunListResource | null>(null);
  const [retryingIds, setRetryingIds] = useState<Set<number>>(new Set());
  const [downloadingIds, setDownloadingIds] = useState<Set<number>>(new Set());

  const handleRetryClick = (run: ITaskRunListResource) => {
    setRetryingIds((prev) => new Set(prev).add(run.id));
    retryTaskRun(run.id, {
      onSettled: () => {
        setRetryingIds((prev) => {
          const next = new Set(prev);
          next.delete(run.id);
          return next;
        });
      },
      onError: () => {
        shopify.toast.show(t("dashboard.toast_retry_error"), { isError: true });
      },
    });
  };

  const handleDownloadClick = (run: ITaskRunListResource) => {
    setDownloadingIds((prev) => new Set(prev).add(run.id));
    downloadTaskRun(run.id, {
      onSuccess: (taskRun) => {
        if (taskRun.download_url) {
          window.open(taskRun.download_url, "_blank", "noopener");
        } else {
          shopify.toast.show(t("dashboard.toast_download_error"), {
            isError: true,
          });
        }
      },
      onError: () => {
        shopify.toast.show(t("dashboard.toast_download_error"), {
          isError: true,
        });
      },
      onSettled: () => {
        setDownloadingIds((prev) => {
          const next = new Set(prev);
          next.delete(run.id);
          return next;
        });
      },
    });
  };

  // If the user has not completed all onboarding tasks and has not dismissed the checklist,
  // automatically mark the "job_applied" task as done when a run is detected in the history.
  useEffect(() => {
    if (!data || allCompleted || isDismissed) return;
    if (data.data.length) onMarkTaskDoneBackground("job_applied");
  }, [!!data?.data.length, allCompleted, isDismissed]);
  // Once polling confirms a run's real status has left the "applying" set
  // (e.g. the BE flipped it to `cancelled`), drop it from the locally-tracked
  // cancelling set so the badge/action reflect the BE-confirmed status
  // instead of getting stuck on the optimistic "Cancelling…" state.
  useEffect(() => {
    if (!data || cancellingIds.size === 0) return;
    const resolvedIds = data.data
      .filter(
        (run) =>
          cancellingIds.has(run.id) && !APPLYING_STATUSES.has(run.status),
      )
      .map((run) => run.id);
    if (resolvedIds.length > 0) onCancellingResolved(resolvedIds);
  }, [data, cancellingIds, onCancellingResolved]);

  const rows = data?.data ?? [];
  const total = data?.total ?? 0;

  const handleUndoClick = (run: ITaskRunListResource) => {
    setUndoRun(run);
    shopify.modal.show(ID_MODAL_SHOPIFY.dashboard.modalUndoConfirm);
  };

  const renderObject = (target: Record<string, number> | null) => {
    const { productCount, variantCount } = formatObjectColumn(target);
    return variantCount === null
      ? t("dashboard.object_products", {
          count: returnFormatNumber(productCount),
        })
      : t("dashboard.object_products_with_variants", {
          productCount: returnFormatNumber(productCount),
          variantCount: returnFormatNumber(variantCount),
        });
  };

  const renderPrimaryAction = (run: ITaskRunListResource) => {
    const isLocallyCancelling = cancellingIds.has(run.id);
    const action = getRowAction(run, isLocallyCancelling);

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
            onClick={() => onCancelClick(run)}
          >
            {t("dashboard.button_cancel_task")}
          </s-button>
        );
      case "undo":
        return (
          <s-stack direction="block" gap="small-100">
            <s-button
              interestFor={`undo-expires-tooltip-${run.id}`}
              variant="secondary"
              onClick={() => handleUndoClick(run)}
            >
              {t("dashboard.button_undo")}
            </s-button>
            {run.undo_window_expires_at && (
              <s-tooltip id={`undo-expires-tooltip-${run.id}`}>
                {t("dashboard.inline_undo_expires_at", {
                  date: returnFormatDate(run.undo_window_expires_at, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }),
                })}
              </s-tooltip>
            )}
          </s-stack>
        );
      case "undo_locked": {
        const tooltipId = `undo-lock-tooltip-${run.id}`;
        return (
          <>
            <s-button
              variant="secondary"
              icon="lock"
              interestFor={tooltipId}
              onClick={() => onUndoLockedClick(run, action.reason)}
            >
              {t("dashboard.button_undo")}
            </s-button>
            <s-tooltip id={tooltipId}>
              {t(UNDO_LOCK_TOOLTIP_KEYS[action.reason])}
            </s-tooltip>
          </>
        );
      }
      case "download": {
        const isThisRowDownloading = downloadingIds.has(run.id);
        return (
          <s-button
            variant="secondary"
            loading={isThisRowDownloading}
            disabled={isThisRowDownloading}
            onClick={() => handleDownloadClick(run)}
          >
            {t("dashboard.button_download")}
          </s-button>
        );
      }
      case "retry": {
        const isThisRowRetrying = retryingIds.has(run.id);
        return (
          <s-button
            variant="secondary"
            loading={isThisRowRetrying}
            disabled={isThisRowRetrying}
            onClick={() => handleRetryClick(run)}
          >
            {run.status === "expired"
              ? t("dashboard.button_recreate_file")
              : t("dashboard.button_retry")}
          </s-button>
        );
      }
      case "configure":
        return (
          <s-button
            variant="secondary"
            onClick={() =>
              navigate({
                to: "/csv",
                search: { mode: "import", taskRunId: run.id },
              })
            }
          >
            {t("dashboard.button_configure")}
          </s-button>
        );
      case "preview": {
        return (
          <s-button
            variant="secondary"
            onClick={() =>
              navigate({
                to: "/csv",
                search: { mode: "import", taskRunId: run.id },
              })
            }
          >
            {t("dashboard.button_preview")}
          </s-button>
        );
      }
      case "none":
        return <s-text color="subdued">—</s-text>;
    }
  };

  if (!isLoading && total === 0 && !hasActiveFilters) {
    return (
      <s-section heading={t("dashboard.table_history_title")}>
        <s-stack
          blockSize="540px"
          direction="block"
          gap="base"
          alignItems="center"
          justifyContent="center"
        >
          <s-paragraph>{t("dashboard.empty_history_title")}</s-paragraph>
          <s-button variant="primary" onClick={onCreateClick}>
            {t("dashboard.button_create_bulk_edit")}
          </s-button>
        </s-stack>
      </s-section>
    );
  }

  return (
    <s-section padding="none">
      <div className="p-3">
        <s-heading>
          {`${t("dashboard.table_history_title")} — ${t("dashboard.table_tasks_count", { count: returnFormatNumber(total) })}`}
        </s-heading>
      </div>
      <HistoryFilterBar
        filters={filters}
        onChange={handleFilterChange}
        onClear={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
      />
      {!isLoading && total === 0 && hasActiveFilters ? (
        <s-stack
          blockSize="320px"
          direction="block"
          gap="base"
          alignItems="center"
          justifyContent="center"
        >
          <s-paragraph>{t("dashboard.empty_filtered_history_title")}</s-paragraph>
          <s-button variant="secondary" onClick={handleClearFilters}>
            {t("dashboard.button_clear_filters")}
          </s-button>
        </s-stack>
      ) : (
      <div className="min-h-125">
        <s-table
          loading={isLoading}
          paginate
          hasPreviousPage={page > 1}
          hasNextPage={!!data && page < data.last_page}
          onPreviousPage={() => setPage((p) => Math.max(1, p - 1))}
          onNextPage={() =>
            setPage((p) => (data && p < data.last_page ? p + 1 : p))
          }
        >
          <s-table-header-row>
            <s-table-header>
              {t("dashboard.table_column_id_time")}
            </s-table-header>
            <s-table-header>
              {t("dashboard.table_column_action")}
            </s-table-header>
            <s-table-header>
              {t("dashboard.table_column_object")}
            </s-table-header>
            <s-table-header>
              {t("dashboard.table_column_status")}
            </s-table-header>
            <s-table-header>
              {t("dashboard.table_column_action")}
            </s-table-header>
          </s-table-header-row>
          <s-table-body>
            {rows.map((run) => {
              const isLocallyCancelling = cancellingIds.has(run.id);
              const badge = getStatusBadge(
                run.status,
                run.operation_type,
                isLocallyCancelling,
              );
              const isApplying = ["pending", "created", "running"].includes(
                run.status,
              );
              const isUndoing = run.status === "undoing";
              const isActiveDetailHistory =
                STATUS_ACTIVE_DETAIL_HISTORY.includes(run.status);

              return (
                <s-table-row key={run.id}>
                  <s-table-cell>
                    {`#${run.id} · ${returnFormatDate(run.created_at ?? "", { dateStyle: "medium" })}`}
                  </s-table-cell>
                  <s-table-cell>
                    {isActiveDetailHistory ? (
                      <s-link
                        onClick={() =>
                          navigate({
                            to: "/history/$id",
                            params: { id: String(run.id) },
                          })
                        }
                      >
                        {run.label || "--"}
                      </s-link>
                    ) : (
                      <span>{run.label || "--"}</span>
                    )}
                  </s-table-cell>
                  <s-table-cell>{renderObject(run.target)}</s-table-cell>
                  <s-table-cell>
                    <s-badge tone={badge.tone}>{t(badge.labelKey)}</s-badge>
                    {(isApplying || isUndoing || isLocallyCancelling) && (
                      <ProgressBar
                        percent={Number(run.progress_percent ?? "0")}
                        label={t(badge.labelKey)}
                        direction={isUndoing ? "reverse" : "forward"}
                      />
                    )}
                  </s-table-cell>
                  <s-table-cell>{renderPrimaryAction(run)}</s-table-cell>
                </s-table-row>
              );
            })}
          </s-table-body>
        </s-table>
      </div>
      )}
      <UndoConfirmModal run={undoRun} />
    </s-section>
  );
};

export default HistoryTable;
