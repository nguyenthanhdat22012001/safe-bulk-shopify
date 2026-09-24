import { taskRunQueries } from "@/queries/taskRunQueries";
import type { ITaskRunItem, ITaskRunItemGroup, TTaskRunItemPhase } from "@/types/editWizard";
import {
  formatFieldChangeValue,
  getChangedFields,
  getParentLabel,
  getTaskRunItemStatusBadge,
  parseTaskRunItemErrorMessage,
} from "@/utils/dashboard";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface IItemRowProps {
  item: ITaskRunItem;
}

const ItemRow = ({ item }: IItemRowProps) => {
  const { t } = useTranslation();
  const badge = getTaskRunItemStatusBadge(item.status);
  const changedFields = getChangedFields(item.field_changes);
  const errorEntries = item.status === "error" ? parseTaskRunItemErrorMessage(item.error_message) : [];
  const skippedReasons =
    item.status === "skipped"
      ? item.error_message
        ? parseTaskRunItemErrorMessage(item.error_message)
        : item.warnings.map((warning) => ({ field: warning.field, message: warning.message }))
      : [];

  return (
    <s-box padding="small-300" borderWidth="base" borderColor="subdued" borderRadius="base">
      <s-stack direction="block" gap="small-200">
        <s-stack direction="inline" gap="small-200" alignItems="center">
          <s-badge tone={badge.tone}>{t(badge.labelKey)}</s-badge>
          <s-text color="subdued">{item.client_identifier}</s-text>
        </s-stack>

        {errorEntries.map((entry, index) => (
          <s-text key={index} tone="critical">
            {entry.field
              ? t("dashboard.item_error_with_field", { field: entry.field, message: entry.message })
              : entry.message}
          </s-text>
        ))}

        {skippedReasons.map((entry, index) => (
          <s-text key={index} tone="caution">
            {entry.field
              ? t("dashboard.item_error_with_field", { field: entry.field, message: entry.message })
              : entry.message}
          </s-text>
        ))}

        {changedFields.length > 0 && (
          <s-stack direction="block" gap="small-100">
            {changedFields.map((change) => (
              <s-text key={change.field} color="subdued">
                {t("dashboard.item_field_change", {
                  field: change.field,
                  oldValue: formatFieldChangeValue(change.old),
                  newValue: formatFieldChangeValue(change.new),
                })}
              </s-text>
            ))}
          </s-stack>
        )}
      </s-stack>
    </s-box>
  );
};

interface IGroupRowProps {
  group: ITaskRunItemGroup;
}

const GroupRow = ({ group }: IGroupRowProps) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const label = getParentLabel(group.parent_gid, group.parent_type);
  const errorCount = group.items.filter((item) => item.status === "error").length;
  const skippedCount = group.items.filter((item) => item.status === "skipped").length;

  return (
    <s-stack direction="block" gap="small-200">
      <s-link onClick={() => setIsExpanded((prev) => !prev)}>
        {isExpanded
          ? t("dashboard.item_group_hide", { label })
          : t("dashboard.item_group_show", {
              label,
              count: group.items.length,
              errorCount,
              skippedCount,
            })}
      </s-link>

      {isExpanded && (
        <s-stack direction="block" gap="small-200">
          {group.items.map((item) => (
            <ItemRow key={item.id} item={item} />
          ))}
        </s-stack>
      )}
    </s-stack>
  );
};

interface IProps {
  taskRunId: number;
  phase: TTaskRunItemPhase;
}

const TaskRunItemGroupList = ({ taskRunId, phase }: IProps) => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery(
    taskRunQueries.taskRunItems(taskRunId, phase, page),
  );

  const groups = data?.data ?? [];

  return (
    <s-stack direction="block" gap="base">
      {isLoading && <s-spinner accessibilityLabel={t("common.loading")} />}
      {isError && <s-paragraph>{t("common.error_description")}</s-paragraph>}
      {!isLoading && !isError && groups.length === 0 && (
        <s-paragraph>{t("dashboard.modal_view_log_empty_page_note")}</s-paragraph>
      )}
      {groups.map((group) => (
        <GroupRow key={group.parent_gid} group={group} />
      ))}
      {data && data.last_page > 1 && (
        <s-stack direction="inline" gap="base">
          <s-button
            variant="secondary"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            {t("dashboard.button_previous_page")}
          </s-button>
          <s-button
            variant="secondary"
            disabled={page >= data.last_page}
            onClick={() => setPage((p) => p + 1)}
          >
            {t("dashboard.button_next_page")}
          </s-button>
        </s-stack>
      )}
    </s-stack>
  );
};

export default TaskRunItemGroupList;
