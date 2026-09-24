import { SHOP_STATES_FEEDBACK_KEYS } from "@/constants/feedback";
import { useRequestAppReview } from "@/hooks/feedback";
import { useSubmitFeedback } from "@/queries/feedbackQueries";
import { usePatchFeedbackState } from "@/queries/shopStatesQueries";
import { useFeedbackStateStore } from "@/stores/feedbackStateStore";
import { useShopStore } from "@/stores/shopStore";
import { canShowNpsPrompt } from "@/utils/feedback";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

type TSegment = "detractor" | "passive" | "promoter";

const scoreToSegment = (score: number): TSegment => {
  if (score <= 6) return "detractor";
  if (score <= 8) return "passive";
  return "promoter";
};

const SEGMENT_TITLE_KEY: Record<TSegment, string> = {
  detractor: "feedback.banner_nps_detractor_title",
  passive: "feedback.banner_nps_passive_title",
  promoter: "feedback.banner_nps_promoter_title",
};

const SCORES = Array.from({ length: 11 }, (_, index) => index);

interface IProps {
  onCompleted: () => void;
}

const NpsBanner = ({ onCompleted }: IProps) => {
  const { t } = useTranslation();
  const { mutate: submitFeedback } = useSubmitFeedback();
  const { isRequesting, requestAppReview } = useRequestAppReview();

  const [score, setScore] = useState<number | null>(null);
  const [comment, setComment] = useState("");

  const shopInfo = useShopStore((state) => state.shopInfo);
  const feedbackState = useFeedbackStateStore((state) => state.feedbackState);
  const setFeedbackState = useFeedbackStateStore((state) => state.setFeedbackState);
  const isFeedbackStateLoaded = useFeedbackStateStore((state) => state.isLoaded);
  const { mutate: patchFeedbackState } = usePatchFeedbackState();

  const eligible =
    isFeedbackStateLoaded &&
    canShowNpsPrompt({
      feedback: feedbackState,
      shopCreatedAt: shopInfo.created_at,
    });

  // `hasPatchedRef` still guards against a legitimate double-fire once
  // `isFeedbackStateLoaded` flips to `true` and `eligible` re-evaluates.
  const hasPatchedRef = useRef(false);

  /** Every interaction that resulted in a score being clicked must produce
   * exactly one `/api/feedback` record — never zero, never two (Finding #1
   * of the final review). This guard makes that true across all 3 exit
   * paths: promoter (submits immediately, no comment step), detractor/passive
   * comment submit, and dismiss/skip without commenting. Declared above the
   * `!eligible` early return so hook call order stays stable across renders. */
  const hasSubmittedRef = useRef(false);

  useEffect(() => {
    if (!eligible || hasPatchedRef.current) return;
    hasPatchedRef.current = true;
    const now = new Date().toISOString();
    const partial = {
      [SHOP_STATES_FEEDBACK_KEYS.npsLastShownAt]: now,
      [SHOP_STATES_FEEDBACK_KEYS.promptLastActiveShownAt]: now,
    };
    setFeedbackState(partial);
    patchFeedbackState(partial);
  }, [eligible, setFeedbackState, patchFeedbackState]);

  if (!eligible) return null;

  const segment = score !== null ? scoreToSegment(score) : null;

  const submitScore = (value: number, content: string) => {
    if (hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;
    submitFeedback(
      { category: "nps", content, metadata: { score: value } },
      {
        onError: () => {
          shopify.toast.show(t("feedback.toast_widget_submit_error"), {
            isError: true,
          });
        },
      },
    );
  };

  const handleScoreSelected = (value: number) => {
    setScore(value);
    // Promoters have no comment step, so their score is the final word —
    // submit right away instead of waiting for an action that never comes.
    if (scoreToSegment(value) === "promoter") {
      submitScore(value, "");
    }
  };

  const handleCommentSubmit = () => {
    if (score === null) return;
    submitScore(score, comment);
    onCompleted();
  };

  /** Dismissing/skipping after a score was picked but before a comment was
   * submitted still records that score, with empty content. If a score was
   * already submitted (promoter path), `submitScore`'s guard makes this a
   * no-op. */
  const handleDismiss = () => {
    if (score !== null) submitScore(score, "");
    onCompleted();
  };

  const handlePromoterReview = async () => {
    await requestAppReview();
    onCompleted();
  };

  if (segment === null) {
    return (
      <s-banner tone="info" dismissible onDismiss={handleDismiss}>
        <s-stack direction="block" gap="small">
          <s-text>{t("feedback.banner_nps_question")}</s-text>
          <s-stack direction="inline" gap="small-400">
            {SCORES.map((value) => (
              <s-button
                key={value}
                variant="tertiary"
                onClick={() => handleScoreSelected(value)}
              >
                {value}
              </s-button>
            ))}
          </s-stack>
        </s-stack>
      </s-banner>
    );
  }

  if (segment === "promoter") {
    return (
      <s-banner tone="success" dismissible onDismiss={handleDismiss}>
        <s-stack direction="block" gap="small">
          <s-text>{t(SEGMENT_TITLE_KEY.promoter)}</s-text>
          <s-stack direction="inline" gap="small-400">
            <s-button
              variant="primary"
              disabled={isRequesting}
              onClick={() => void handlePromoterReview()}
            >
              {t("feedback.banner_nps_button_leave_review")}
            </s-button>
            <s-button variant="tertiary" onClick={handleDismiss}>
              {t("feedback.banner_nps_button_skip")}
            </s-button>
          </s-stack>
        </s-stack>
      </s-banner>
    );
  }

  return (
    <s-banner tone="info" dismissible onDismiss={handleDismiss}>
      <s-stack direction="block" gap="small">
        <s-text>{t(SEGMENT_TITLE_KEY[segment])}</s-text>
        <s-text-area
          label={t(SEGMENT_TITLE_KEY[segment])}
          labelAccessibilityVisibility="exclusive"
          value={comment}
          onChange={(event) => setComment(event.currentTarget.value)}
        />
        <s-button variant="primary" onClick={handleCommentSubmit}>
          {t("feedback.banner_nps_button_submit")}
        </s-button>
      </s-stack>
    </s-banner>
  );
};

export default NpsBanner;
