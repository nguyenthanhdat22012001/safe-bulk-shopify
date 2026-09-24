import {
  ONBOARDING_DISMISSED_FLAG,
  ONBOARDING_TASK_IDS,
} from "@/constants/dashboard";

export type TOnboardingTaskId = (typeof ONBOARDING_TASK_IDS)[number];

export interface IOnboardingTaskStatus {
  id: TOnboardingTaskId;
  completed: boolean;
}

export interface IOnboardingState {
  completedCount: number;
  totalCount: number;
  allCompleted: boolean;
  isDismissed: boolean;
  taskStatus: IOnboardingTaskStatus[];
}

/** Pure derivation of all checklist display state from the raw
 * `onboarding_tasks` array — mirrors `getOnboardingState` in
 * `app/docs/wizard/Onboarding Checklist (Dashboard) v4 UI-UX Spec.md` §2.
 * Unrecognized values in `onboardingTasks` are naturally ignored since this
 * only ever looks up the known task ids. */
export const getOnboardingState = (
  onboardingTasks: string[],
): IOnboardingState => {
  const taskStatus: IOnboardingTaskStatus[] = ONBOARDING_TASK_IDS.map(
    (id) => ({
      id,
      completed: onboardingTasks.includes(id),
    }),
  );
  const completedCount = taskStatus.filter((task) => task.completed).length;

  return {
    completedCount,
    totalCount: ONBOARDING_TASK_IDS.length,
    allCompleted: completedCount === ONBOARDING_TASK_IDS.length,
    isDismissed: onboardingTasks.includes(ONBOARDING_DISMISSED_FLAG),
    taskStatus,
  };
};

/** "Next incomplete task" is always defined as the earliest incomplete task in
 * fixed `ONBOARDING_TASK_IDS` order — not "next after a given id" — so the
 * same helper serves both the initial auto-expand and post-completion
 * auto-advance, and out-of-order manual completion still lands on a sane
 * task. */
export const getFirstIncompleteTaskId = (
  taskStatus: IOnboardingTaskStatus[],
): TOnboardingTaskId | null =>
  taskStatus.find((task) => !task.completed)?.id ?? null;
