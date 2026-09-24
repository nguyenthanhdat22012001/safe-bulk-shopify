import { SHOP_STATES_FEEDBACK_KEYS } from "@/constants/feedback";
import { usePatchFeedbackState } from "@/queries/shopStatesQueries";
import { taskRunQueries, IN_FLIGHT_STATUSES } from "@/queries/taskRunQueries";
import { useApplyWatchStore } from "@/stores/applyWatchStore";
import { useFeedbackStateStore } from "@/stores/feedbackStateStore";
import { canShowRatingPrompt } from "@/utils/feedback";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import RatingPreScreenModal from "../RatingPreScreenModal";

const ApplyCompletionWatcher = () => {
  const pendingTaskRunId = useApplyWatchStore((state) => state.pendingTaskRunId);
  const setPendingTaskRunId = useApplyWatchStore(
    (state) => state.setPendingTaskRunId,
  );

  const feedbackState = useFeedbackStateStore((state) => state.feedbackState);
  const setFeedbackState = useFeedbackStateStore((state) => state.setFeedbackState);
  const isFeedbackStateLoaded = useFeedbackStateStore((state) => state.isLoaded);
  const { mutate: patchFeedbackState } = usePatchFeedbackState();

  const [ratingProductCount, setRatingProductCount] = useState(0);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);

  const { data: taskRun } = useQuery({
    ...taskRunQueries.taskRun(pendingTaskRunId),
    enabled: pendingTaskRunId !== null,
  });

  useEffect(() => {
    if (!taskRun) return;
    if (IN_FLIGHT_STATUSES.has(taskRun.status)) return;

    // Skip the success_count increment + trigger evaluation until the real
    // feedback shop-states have loaded — otherwise a PATCH here would derive
    // `nextSuccessCount` from the all-zero default and clobber the real
    // server-side count (Finding #5 of the final review). Task-run polling
    // still clears below regardless.
    if (
      isFeedbackStateLoaded &&
      taskRun.status === "completed" &&
      (taskRun.error_count ?? 0) === 0
    ) {
      const productCount = taskRun.object_count ?? taskRun.target_count ?? 0;
      const nextSuccessCount = feedbackState["apply.success_count"] + 1;

      const willShowRating = canShowRatingPrompt({
        feedback: { ...feedbackState, "apply.success_count": nextSuccessCount },
        applyProductCount: productCount,
      });

      // bundle apply.success_count with the "shown" fields into one PATCH
      // when both happen together (spec 8.3's bundling requirement)
      const partial = {
        [SHOP_STATES_FEEDBACK_KEYS.applySuccessCount]: nextSuccessCount,
        ...(willShowRating
          ? {
              [SHOP_STATES_FEEDBACK_KEYS.ratingShownCount]:
                feedbackState["rating.shown_count"] + 1,
              [SHOP_STATES_FEEDBACK_KEYS.promptLastActiveShownAt]:
                new Date().toISOString(),
            }
          : {}),
      };

      setFeedbackState(partial);
      patchFeedbackState(partial);

      if (willShowRating) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setRatingProductCount(productCount);
        setIsRatingModalOpen(true);
      }
    }

    setPendingTaskRunId(null);
  }, [
    taskRun,
    feedbackState,
    isFeedbackStateLoaded,
    setFeedbackState,
    patchFeedbackState,
    setPendingTaskRunId,
  ]);

  return (
    <RatingPreScreenModal
      productCount={ratingProductCount}
      isOpen={isRatingModalOpen}
      onClose={() => setIsRatingModalOpen(false)}
    />
  );
};

export default ApplyCompletionWatcher;
