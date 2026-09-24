import { SHOP_STATES_FEEDBACK_KEYS } from "@/constants/feedback";
import { useRequestAppReview } from "@/hooks/feedback";
import { useSubmitFeedback } from "@/queries/feedbackQueries";
import { usePatchFeedbackState } from "@/queries/shopStatesQueries";
import { useFeedbackStateStore } from "@/stores/feedbackStateStore";
import { useFeedbackWidgetStore } from "@/stores/feedbackWidgetStore";
import type { TRatingSentiment, TReviewsApiCode } from "@/types/feedback";
import { returnFormatNumber } from "@/utils/funcFormat";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";

const POSITIVE_SENTIMENTS: TRatingSentiment[] = ["😄", "🤩"];

const SENTIMENTS: { value: TRatingSentiment; labelKey: string }[] = [
  { value: "😞", labelKey: "feedback.modal_rating_sentiment_1" },
  { value: "😐", labelKey: "feedback.modal_rating_sentiment_2" },
  { value: "🙂", labelKey: "feedback.modal_rating_sentiment_3" },
  { value: "😄", labelKey: "feedback.modal_rating_sentiment_4" },
  { value: "🤩", labelKey: "feedback.modal_rating_sentiment_5" },
];

// Exit is intentionally faster than enter (150ms vs 220ms) per the
// enter-slow/exit-fast motion guideline — this also bounds how long the
// dialog stays mounted after `isOpen` goes false.
const ENTER_DURATION_MS = 220;
const EXIT_DURATION_MS = 150;

interface IProps {
  productCount: number;
  isOpen: boolean;
  onClose: () => void;
}

const RatingPreScreenModal = ({ productCount, isOpen, onClose }: IProps) => {
  const { t } = useTranslation();
  const titleId = useId();
  const openPanel = useFeedbackWidgetStore((state) => state.openPanel);
  const { isRequesting, requestAppReview } = useRequestAppReview();

  const setFeedbackState = useFeedbackStateStore((state) => state.setFeedbackState);
  const { mutate: patchFeedbackState } = usePatchFeedbackState();
  const { mutate: submitFeedback } = useSubmitFeedback();

  const [isMounted, setIsMounted] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(false);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Mount synchronously the moment `isOpen` flips true, during render rather
  // than in an effect, so there's no extra commit before the dialog appears
  // in the DOM (see https://react.dev/learn/you-might-not-need-an-effect).
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setIsMounted(true);
    } else {
      setIsVisible(false);
    }
  }

  // Flip `isVisible` on the next frame so the enter transition actually
  // animates from its initial state. On close, keep the dialog mounted just
  // long enough to play the exit transition before unmounting it.
  useEffect(() => {
    if (isOpen) {
      const raf = requestAnimationFrame(() => setIsVisible(true));
      return () => cancelAnimationFrame(raf);
    }

    const timeout = setTimeout(() => setIsMounted(false), EXIT_DURATION_MS);
    return () => clearTimeout(timeout);
  }, [isOpen]);

  const recordRatingEvent = (
    sentiment: TRatingSentiment,
    reviewsApiCode: TReviewsApiCode | null,
  ) => {
    submitFeedback({
      category: "rating",
      content: "",
      metadata: { sentiment, reviews_api_code: reviewsApiCode },
    });
  };

  /** Patches only interaction-derived fields — rating.shown_count and
   * prompt.last_active_shown_at are already patched at show time by
   * ApplyCompletionWatcher (Task 15), per spec checklist 5.1. Reviews-API
   * outcome bookkeeping (rating.last_reviews_api_code + conditionally
   * rating.dismissed_at) is handled by `useRequestAppReview` itself. */
  const patchOnInteraction = (
    extra: Record<string, unknown>,
    setDismissed: boolean,
  ) => {
    const partial = {
      ...(setDismissed
        ? { [SHOP_STATES_FEEDBACK_KEYS.ratingDismissedAt]: new Date().toISOString() }
        : {}),
      ...extra,
    };
    setFeedbackState(partial);
    patchFeedbackState(partial);
  };

  const handleDismiss = () => {
    patchOnInteraction({}, true);
    onClose();
  };

  const handlePositiveSentiment = async (sentiment: TRatingSentiment) => {
    const code = await requestAppReview();
    recordRatingEvent(sentiment, code);
    patchOnInteraction(
      { [SHOP_STATES_FEEDBACK_KEYS.ratingLastSentiment]: sentiment },
      false,
    );
    onClose();
  };

  const handleNegativeSentiment = (sentiment: TRatingSentiment) => {
    recordRatingEvent(sentiment, null);
    patchOnInteraction(
      { [SHOP_STATES_FEEDBACK_KEYS.ratingLastSentiment]: sentiment },
      true,
    );
    onClose();
    openPanel({ sourceTag: "post_apply_prompt", defaultCategory: "general" });
  };

  const handleSentimentClick = (sentiment: TRatingSentiment) => {
    if (POSITIVE_SENTIMENTS.includes(sentiment)) {
      void handlePositiveSentiment(sentiment);
      return;
    }
    handleNegativeSentiment(sentiment);
  };

  // Focus management, Escape-to-dismiss, a manual focus trap (Tab cycling
  // stays inside the dialog), and a background scroll lock — all the things
  // `s-modal` gave us for free and a bare Tailwind overlay does not.
  useEffect(() => {
    if (!isMounted) return;

    closeButtonRef.current?.focus();

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        handleDismiss();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not(:disabled), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted]);

  if (!isMounted) return null;

  return createPortal(
    <div
      role="presentation"
      onClick={handleDismiss}
      className={`fixed inset-0 z-[70] flex items-end justify-center bg-black/50 p-4 pb-6 backdrop-blur-sm sm:pb-8 motion-safe:transition-opacity motion-safe:ease-out ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      style={{
        transitionDuration: `${isVisible ? ENTER_DURATION_MS : EXIT_DURATION_MS}ms`,
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
        className={`w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-black/5 motion-safe:transition-all motion-safe:ease-out ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
        }`}
        style={{
          transitionDuration: `${isVisible ? ENTER_DURATION_MS : EXIT_DURATION_MS}ms`,
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id={titleId} className="text-lg font-semibold text-gray-900">
            {t("feedback.modal_rating_title", { count: returnFormatNumber(productCount) })}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            aria-label={t("common.buttons_close")}
            onClick={handleDismiss}
            className="-m-1.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors duration-150 hover:bg-surface-muted hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
          >
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-5 w-5">
              <path
                d="M5 5l10 10M15 5 5 15"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <p className="mt-2 text-sm text-text-subdued">
          {t("feedback.modal_rating_question")}
        </p>

        <div className="mt-5 flex items-center justify-between gap-2">
          {SENTIMENTS.map(({ value, labelKey }) => (
            <button
              key={value}
              type="button"
              aria-label={t(labelKey)}
              disabled={isRequesting}
              onClick={() => handleSentimentClick(value)}
              className="flex h-12 flex-1 items-center justify-center rounded-2xl text-2xl leading-none transition-transform duration-150 ease-out hover:scale-110 hover:bg-surface-muted active:scale-95 disabled:pointer-events-none disabled:opacity-40 motion-reduce:hover:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
            >
              {value}
            </button>
          ))}
        </div>

        {isRequesting && (
          <p
            role="status"
            className="mt-3 flex items-center justify-center gap-2 text-xs text-text-subdued"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              className="h-3.5 w-3.5 animate-spin"
            >
              <circle
                cx="12"
                cy="12"
                r="9"
                stroke="currentColor"
                strokeWidth="3"
                className="opacity-25"
              />
              <path
                d="M21 12a9 9 0 0 0-9-9"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                className="opacity-75"
              />
            </svg>
            {t("common.loading")}
          </p>
        )}

        <button
          type="button"
          onClick={handleDismiss}
          className="mt-5 w-full rounded-xl py-2.5 text-sm font-medium text-text-subdued transition-colors duration-150 hover:bg-surface-muted hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
        >
          {t("feedback.modal_rating_button_not_now")}
        </button>
      </div>
    </div>,
    document.body,
  );
};

export default RatingPreScreenModal;
