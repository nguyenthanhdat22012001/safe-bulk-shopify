import { useFeedbackWidgetStore } from "@/stores/feedbackWidgetStore";
import { useTranslation } from "react-i18next";

const FeedbackFAB = () => {
  const { t } = useTranslation();
  const isCompact = useFeedbackWidgetStore((state) => state.isCompact);
  const openPanel = useFeedbackWidgetStore((state) => state.openPanel);

  // Compact mode (e.g. Wizard Step 3) hides the FAB entirely rather than
  // nudging its position — that's the only change that guarantees it never
  // overlaps another primary action without a live browser session to verify
  // pixel-level clearance (Finding #7 of the final review).
  if (isCompact) return null;

  const tooltipText = t("feedback.tooltip_fab");

  return (
    <div className="fixed z-50 bottom-6 right-6">
      <div className="group relative flex items-center">
        <button
          type="button"
          aria-label={tooltipText}
          onClick={() => openPanel({ sourceTag: "widget" })}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-primary text-white shadow-lg shadow-brand-primary/30 transition-transform duration-200 ease-out hover:scale-105 hover:shadow-xl hover:shadow-brand-primary/40 active:scale-95 motion-reduce:hover:scale-100 motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-6 w-6">
            <path
              d="M4 4.5A2.5 2.5 0 0 1 6.5 2h11A2.5 2.5 0 0 1 20 4.5v9a2.5 2.5 0 0 1-2.5 2.5H10l-4.4 3.3a.75.75 0 0 1-1.2-.6V16h-.9A2.5 2.5 0 0 1 4 13.5v-9Z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <span
          role="tooltip"
          className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-md bg-gray-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-md transition-opacity duration-150 ease-out group-hover:opacity-100 group-focus-within:opacity-100"
        >
          {tooltipText}
        </span>
      </div>
    </div>
  );
};

export default FeedbackFAB;
