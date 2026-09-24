import Collapsible from "@/components/commonUIs/Collapsible";
import ProgressBar from "@/components/commonUIs/ProgressBar";
import { useOnboardingChecklist } from "@/hooks/dashboard";
import type { TOnboardingTaskId } from "@/utils/dashboard";
import { useTranslation } from "react-i18next";

interface IProps {
  onUndoTaskClick: () => void;
}

const TASK_LABEL_KEYS: Record<TOnboardingTaskId, string> = {
  preview_viewed: "dashboard.onboarding_task_preview",
  job_applied: "dashboard.onboarding_task_apply",
  undo_used: "dashboard.onboarding_task_undo",
};

const TASK_DESCRIPTION_KEYS: Record<TOnboardingTaskId, string> = {
  preview_viewed: "dashboard.onboarding_task_preview_description",
  job_applied: "dashboard.onboarding_task_apply_description",
  undo_used: "dashboard.onboarding_task_undo_description",
};

const TASK_BUTTON_KEYS: Record<TOnboardingTaskId, string> = {
  preview_viewed: "dashboard.onboarding_task_preview_button",
  job_applied: "dashboard.onboarding_task_apply_button",
  undo_used: "dashboard.onboarding_task_undo_button",
};

const OnboardingChecklistCard = ({ onUndoTaskClick }: IProps) => {
  const { t } = useTranslation();
  const {
    visible,
    completedCount,
    totalCount,
    allCompleted,
    taskStatus,
    expandedTaskId,
    markingTaskId,
    onToggleExpand,
    onActionClick,
    onMarkTaskDone,
    onTempDismiss,
    onPermanentDismiss,
  } = useOnboardingChecklist(onUndoTaskClick);

  if (!visible || allCompleted) return null;

  return (
    <s-banner
      heading={t("dashboard.onboarding_title")}
      dismissible
      onDismiss={onTempDismiss}
    >
      <s-stack direction="block" gap="base">
        <ProgressBar
          percent={(completedCount / totalCount) * 100}
          label={t("dashboard.onboarding_progress", {
            completed: completedCount,
            total: totalCount,
          })}
        />
        <s-stack direction="block" gap="small-100">
          {taskStatus.map((task) => (
            <Collapsible
              key={task.id}
              isOpen={expandedTaskId === task.id}
              onToggle={() => onToggleExpand(task.id)}
              trigger={
                <s-stack direction="inline" gap="small-100" alignItems="center">
                  <button
                    className={` ${!task.completed ? "cursor-pointer hover:scale-105" : ""}`}
                    type="button"
                    aria-label={t("dashboard.onboarding_task_mark_done", {
                      task: t(TASK_LABEL_KEYS[task.id]),
                    })}
                    disabled={task.completed || markingTaskId === task.id}
                    onClick={(event) => {
                      event.stopPropagation();
                      onMarkTaskDone(task.id);
                    }}
                    onKeyDown={(event) => event.stopPropagation()}
                  >
                    {task.completed ? (
                      <s-icon type="check-circle" tone="success" />
                    ) : (
                      <s-icon type="circle" color="subdued" />
                    )}
                  </button>

                  <s-text color={task.completed ? "subdued" : undefined}>
                    {t(TASK_LABEL_KEYS[task.id])}
                  </s-text>
                </s-stack>
              }
            >
              <div className="pl-6 pt-1 pb-2 flex flex-col items-start gap-2">
                <s-text color="subdued">
                  {t(TASK_DESCRIPTION_KEYS[task.id])}
                </s-text>
                <s-button
                  variant="secondary"
                  onClick={() => onActionClick(task.id)}
                >
                  {t(TASK_BUTTON_KEYS[task.id])}
                </s-button>
              </div>
            </Collapsible>
          ))}
        </s-stack>
      </s-stack>
      <s-button
        slot="secondary-actions"
        variant="secondary"
        onClick={onPermanentDismiss}
      >
        {t("dashboard.onboarding_dismiss_button")}
      </s-button>
    </s-banner>
  );
};

export default OnboardingChecklistCard;
