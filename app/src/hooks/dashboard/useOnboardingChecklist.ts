import { ONBOARDING_DISMISSED_FLAG } from "@/constants/dashboard";
import { useUpdateShop } from "@/queries/shopQueries";
import { useShopStore } from "@/stores/shopStore";
import {
  getFirstIncompleteTaskId,
  getOnboardingState,
  type IOnboardingTaskStatus,
  type TOnboardingTaskId,
} from "@/utils/dashboard";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export const useOnboardingChecklist = (onUndoTaskClick: () => void) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const onboardingTasks = useShopStore(
    (state) => state.shopInfo.onboarding_tasks,
  );

  const [tempDismissed, setTempDismissed] = useState(false);
  const [optimisticCompletedIds, setOptimisticCompletedIds] = useState<
    Set<TOnboardingTaskId>
  >(new Set());
  const [markingTaskId, setMarkingTaskId] = useState<TOnboardingTaskId | null>(
    null,
  );
  const [expandedTaskId, setExpandedTaskId] =
    useState<TOnboardingTaskId | null>(() =>
      getFirstIncompleteTaskId(getOnboardingState(onboardingTasks).taskStatus),
    );

  const { mutate: mutateShop, isPending: isDismissing } = useUpdateShop();

  const baseState = getOnboardingState(onboardingTasks);
  const taskStatus: IOnboardingTaskStatus[] = baseState.taskStatus.map(
    (task) =>
      !task.completed && optimisticCompletedIds.has(task.id)
        ? { ...task, completed: true }
        : task,
  );
  const completedCount = taskStatus.filter((task) => task.completed).length;
  const allCompleted = completedCount === baseState.totalCount;

  const visible = baseState.allCompleted
    ? !baseState.isDismissed
    : !baseState.isDismissed && !tempDismissed;

  const onToggleExpand = (taskId: TOnboardingTaskId) => {
    setExpandedTaskId((prev) => (prev === taskId ? null : taskId));
  };

  const onActionClick = (taskId: TOnboardingTaskId) => {
    if (taskId === "undo_used") {
      onUndoTaskClick();
      return;
    }
    navigate({ to: "/edit-wizard" });
  };

  const onMarkTaskDone = (taskId: TOnboardingTaskId) => {
    if (markingTaskId) return;

    setOptimisticCompletedIds((prev) => new Set(prev).add(taskId));
    setMarkingTaskId(taskId);

    mutateShop(
      { onboarding_tasks: [...onboardingTasks, taskId] },
      {
        onSuccess: () => setMarkingTaskId(null),
        onError: () => {
          setMarkingTaskId(null);
          setOptimisticCompletedIds((prev) => {
            const next = new Set(prev);
            next.delete(taskId);
            return next;
          });
          shopify.toast.show(t("dashboard.toast_onboarding_mark_done_error"), {
            isError: true,
          });
        },
      },
    );
  };

  const onTempDismiss = () => setTempDismissed(true);

  const onPermanentDismiss = async () => {
    if (isDismissing) return;

    mutateShop(
      {
        onboarding_tasks: [...onboardingTasks, ONBOARDING_DISMISSED_FLAG],
      },
      {
        onError: () => {
          shopify.toast.show(t("dashboard.toast_onboarding_dismiss_error"), {
            isError: true,
          });
        },
      },
    );
  };

  return {
    visible,
    completedCount,
    totalCount: baseState.totalCount,
    allCompleted,
    taskStatus,
    expandedTaskId,
    markingTaskId,
    onToggleExpand,
    onActionClick,
    onMarkTaskDone,
    onTempDismiss,
    onPermanentDismiss,
  };
};

export const useActionsCheckList = () => {
  const onboardingTasks = useShopStore(
    (state) => state.shopInfo.onboarding_tasks,
  );

  const { mutate: mutateShop } = useUpdateShop();

  const { isDismissed, allCompleted } = getOnboardingState(onboardingTasks);

  const onMarkTaskDoneBackground = (taskId: TOnboardingTaskId) => {
    const isDoneTaskBefor = onboardingTasks.includes(taskId);
    const isDismissed = onboardingTasks.includes(ONBOARDING_DISMISSED_FLAG);
    if (isDoneTaskBefor || isDismissed || allCompleted) return;

    mutateShop({ onboarding_tasks: [...onboardingTasks, taskId] });
  };

  return {
    isDismissed,
    allCompleted,
    onMarkTaskDoneBackground,
  };
};
