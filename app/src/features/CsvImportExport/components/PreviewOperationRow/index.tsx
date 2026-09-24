import type {
  IImportPreviewChange,
  IImportPreviewError,
  IImportPreviewOperation,
} from "@/types/csv";
import {
  formatPreviewValue,
  getChangedEntries,
  groupChangesByRow,
} from "@/utils/csv";
import { returnFormatNumber } from "@/utils/funcFormat";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const MAX_VISIBLE_CHANGES = 3;

const FieldColumn = ({ changes }: { changes: IImportPreviewChange[] }) => (
  <s-stack direction="block" gap="small-100">
    {changes.map((change) => (
      <s-text key={`${change.field}-${change.target_gid}`}>
        {change.header}
      </s-text>
    ))}
  </s-stack>
);

const BeforeColumn = ({ changes }: { changes: IImportPreviewChange[] }) => (
  <s-stack direction="block" gap="small-100">
    {changes.map((change) => (
      <s-text
        key={`${change.field}-${change.target_gid}`}
        type="redundant"
        color="subdued"
      >
        {formatPreviewValue(change.before)}
      </s-text>
    ))}
  </s-stack>
);

const AfterColumn = ({
  changes,
  isMuted,
}: {
  changes: IImportPreviewChange[];
  isMuted: boolean;
}) => (
  <s-stack direction="block" gap="small-100">
    {changes.map((change) => (
      <s-text
        key={`${change.field}-${change.target_gid}`}
        type="strong"
        tone={isMuted ? undefined : "success"}
      >
        {isMuted ? (
          <span className="font-medium">
            {formatPreviewValue(change.after)}
          </span>
        ) : (
          formatPreviewValue(change.after)
        )}
      </s-text>
    ))}
  </s-stack>
);

interface ISubRowProps {
  operation: IImportPreviewOperation;
  rowNumber: number;
  changes: IImportPreviewChange[];
  rowErrors: IImportPreviewError[];
  isAlternate: boolean;
  isLastInGroup: boolean;
  isUpdating: boolean;
  onToggleIgnored: (operation: IImportPreviewOperation) => void;
}

const PreviewOperationSubRow = ({
  operation,
  rowNumber,
  changes,
  rowErrors,
  isAlternate,
  isLastInGroup,
  isUpdating,
  onToggleIgnored,
}: ISubRowProps) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  const changedEntries = getChangedEntries(changes);
  const visibleEntries = isExpanded
    ? changedEntries
    : changedEntries.slice(0, MAX_VISIBLE_CHANGES);
  const hiddenCount = changedEntries.length - MAX_VISIBLE_CHANGES;

  const rowClassName = [
    "border-l-2 border-l-gray-300",
    isAlternate ? "bg-gray-50" : "bg-white",
    isLastInGroup ? "border-b-2 border-b-gray-300" : "border-b border-gray-200",
    operation.ignored ? "opacity-40" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <tr className={rowClassName}>
      <td className="p-2 align-top">
        <s-text>{returnFormatNumber(rowNumber)}</s-text>
      </td>

      <td className="p-2 align-top">
        <s-stack direction="block" gap="small-100">
          <s-text type="strong">{operation.group_key}</s-text>
          <s-badge tone="neutral">{operation.action}</s-badge>
        </s-stack>
      </td>

      <td className="p-2 align-top">
        <s-stack direction="block" gap="small-100">
          {operation.has_changes ? (
            <FieldColumn changes={visibleEntries} />
          ) : (
            <s-text color="subdued">{t("csv_import.text_no_changes")}</s-text>
          )}
          {hiddenCount > 0 && (
            <s-link onClick={() => setIsExpanded((prev) => !prev)}>
              {isExpanded
                ? t("csv_import.button_show_fewer_changes")
                : t("csv_import.button_show_more_changes", {
                    count: returnFormatNumber(hiddenCount),
                  })}
            </s-link>
          )}
        </s-stack>
      </td>

      <td className="p-2 align-top">
        <BeforeColumn changes={visibleEntries} />
      </td>

      <td className="p-2 align-top">
        <AfterColumn changes={visibleEntries} isMuted={operation.will_skip} />
      </td>

      <td className="p-2 align-top">
        <s-stack direction="block" gap="small-100">
          {rowErrors.length > 0 ? (
            <>
              <s-badge tone="critical">
                {t("csv_import.badge_will_skip_error")}
              </s-badge>
              {rowErrors.map((error) => (
                <s-text
                  key={`${error.code}-${error.row_number}-${error.header}`}
                  tone="critical"
                >
                  {error.message}
                </s-text>
              ))}
            </>
          ) : operation.ignored ? (
            <>
              <s-badge tone="neutral">{t("csv_import.badge_ignored")}</s-badge>
              <s-link onClick={() => !isUpdating && onToggleIgnored(operation)}>
                {t("csv_import.button_restore_record")}
              </s-link>
            </>
          ) : (
            <>
              {operation.will_skip && (
                <s-badge tone="warning">
                  {t("csv_import.badge_will_skip")}
                </s-badge>
              )}
              {operation.warnings.map((warning) => (
                <s-text
                  key={`${warning.code}-${warning.target_gid}`}
                  tone="caution"
                >
                  {warning.message}
                </s-text>
              ))}
              <s-link onClick={() => !isUpdating && onToggleIgnored(operation)}>
                {t("csv_import.button_ignore_record")}
              </s-link>
            </>
          )}
        </s-stack>
      </td>
    </tr>
  );
};

interface IProps {
  operation: IImportPreviewOperation;
  groupIndex: number;
  rowErrorMap: Map<number, IImportPreviewError[]>;
  isUpdating: boolean;
  onToggleIgnored: (operation: IImportPreviewOperation) => void;
}

const EMPTY_ROW_ERRORS: IImportPreviewError[] = [];

const PreviewOperationRow = ({
  operation,
  groupIndex,
  rowErrorMap,
  isUpdating,
  onToggleIgnored,
}: IProps) => {
  const rowGroups = groupChangesByRow(operation);

  return (
    <>
      {rowGroups.map((group, rowIndex) => (
        <PreviewOperationSubRow
          key={`${operation.id}-${group.rowNumber}`}
          operation={operation}
          rowNumber={group.rowNumber}
          changes={group.changes}
          rowErrors={rowErrorMap.get(group.rowNumber) ?? EMPTY_ROW_ERRORS}
          isAlternate={groupIndex % 2 === 1}
          isLastInGroup={rowIndex === rowGroups.length - 1}
          isUpdating={isUpdating}
          onToggleIgnored={onToggleIgnored}
        />
      ))}
    </>
  );
};

export default PreviewOperationRow;
