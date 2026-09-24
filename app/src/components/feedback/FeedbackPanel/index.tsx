import { ID_MODAL_SHOPIFY } from "@/constants/constantUnique";
import { useSubmitFeedback } from "@/queries/feedbackQueries";
import { useApplyWatchStore } from "@/stores/applyWatchStore";
import { useFeedbackWidgetStore } from "@/stores/feedbackWidgetStore";
import { useShopStore } from "@/stores/shopStore";
import type {
  IFeedbackContext,
  TFeedbackCategory,
  TFeedbackSourceTag,
  TFeedbackSubmitBody,
} from "@/types/feedback";
import type { CallbackEvent } from "@shopify/polaris-types";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface IDraft {
  category: Exclude<TFeedbackCategory, "rating" | "nps">;
  content: string;
  includeContext: boolean;
  contactEmail: string;
  sourceTag: TFeedbackSourceTag;
}

const draftStorageKey = (shopDomain: string) => `feedback-draft-${shopDomain}`;

/**
 * Singleton send-feedback modal. Takes no props — `sourceTag`/`defaultCategory`
 * come entirely from `useFeedbackWidgetStore`, set by `openPanel` right before
 * `shopify.modal.show` is called. This lets other flows (e.g. `RatingPreScreenModal`,
 * Task 14) reuse this exact instance instead of mounting a second `<s-modal>`
 * with the same fixed DOM id.
 */
const FeedbackPanel = () => {
  const { t } = useTranslation();
  const modalId = ID_MODAL_SHOPIFY.feedback.modalWidget;

  const shopInfo = useShopStore((state) => state.shopInfo);
  const lastTaskRunId = useApplyWatchStore((state) => state.lastTaskRunId);
  const panelSourceTag = useFeedbackWidgetStore((state) => state.panelSourceTag);
  const panelDefaultCategory = useFeedbackWidgetStore(
    (state) => state.panelDefaultCategory,
  );

  const { mutate: submitFeedback, isPending } = useSubmitFeedback();

  const [category, setCategory] =
    useState<Exclude<TFeedbackCategory, "rating" | "nps">>(panelDefaultCategory);
  const [content, setContent] = useState("");
  const [includeContext, setIncludeContext] = useState(panelDefaultCategory === "bug");
  const [contactEmail, setContactEmail] = useState(shopInfo.email);

  // Source `category`/`includeContext` from the store during a render keyed
  // on `panelDefaultCategory` itself, not from the modal's `onShow` event —
  // `openPanel` updates the store then calls `shopify.modal.show` in the same
  // tick, so an `onShow`-driven copy can race a not-yet-committed re-render
  // and read the previous panel's category (Finding #6 of the final review).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCategory(panelDefaultCategory);
    setIncludeContext(panelDefaultCategory === "bug");
  }, [panelDefaultCategory]);

  const buildMetadata = (): TFeedbackSubmitBody => {
    const context: IFeedbackContext | null = includeContext
      ? {
          route: window.location.pathname,
          last_bulk_job_id: lastTaskRunId,
          plan_status: shopInfo.app_plan,
        }
      : null;

    if (category === "bug") {
      return {
        category: "bug" as const,
        content,
        metadata: {
          source_tag: panelSourceTag,
          attachments: [],
          context,
          contact_email: contactEmail,
        },
      };
    }
    if (category === "feature_request") {
      return {
        category: "feature_request" as const,
        content,
        metadata: { source_tag: panelSourceTag, attachments: [] },
      };
    }
    return {
      category: "general" as const,
      content,
      metadata: { source_tag: panelSourceTag },
    };
  };

  const saveDraft = () => {
    if (!shopInfo.shopify_domain) return;
    const draft: IDraft = {
      category,
      content,
      includeContext,
      contactEmail,
      sourceTag: panelSourceTag,
    };
    localStorage.setItem(
      draftStorageKey(shopInfo.shopify_domain),
      JSON.stringify(draft),
    );
  };

  const clearDraft = () => {
    if (!shopInfo.shopify_domain) return;
    localStorage.removeItem(draftStorageKey(shopInfo.shopify_domain));
  };

  const handleSubmit = () => {
    const body: TFeedbackSubmitBody = buildMetadata();

    if (!navigator.onLine) {
      saveDraft();
      shopify.toast.show(t("feedback.toast_widget_saved_offline"));
      shopify.modal.hide(modalId);
      return;
    }

    submitFeedback(body, {
      onSuccess: () => {
        clearDraft();
        shopify.toast.show(
          category === "bug"
            ? t("feedback.toast_widget_submit_success_bug")
            : t("feedback.toast_widget_submit_success"),
        );
        setContent("");
        shopify.modal.hide(modalId);
      },
      onError: () => {
        shopify.toast.show(t("feedback.toast_widget_submit_error"), {
          isError: true,
        });
      },
    });
  };

  // resend a saved draft once the browser comes back online
  useEffect(() => {
    const handleOnline = () => {
      if (!shopInfo.shopify_domain) return;
      const storageKey = draftStorageKey(shopInfo.shopify_domain);
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;

      // A corrupt or legacy-shaped draft must not permanently block resends —
      // drop it and give up silently instead of throwing inside the event
      // handler (Finding #13 of the final review).
      try {
        const draft: IDraft = JSON.parse(raw);
        const context: IFeedbackContext | null = draft.includeContext
          ? {
              route: window.location.pathname,
              last_bulk_job_id: lastTaskRunId,
              plan_status: shopInfo.app_plan,
            }
          : null;

        const body: TFeedbackSubmitBody =
          draft.category === "bug"
            ? {
                category: "bug",
                content: draft.content,
                metadata: {
                  source_tag: draft.sourceTag,
                  attachments: [],
                  context,
                  contact_email: draft.contactEmail,
                },
              }
            : draft.category === "feature_request"
              ? {
                  category: "feature_request",
                  content: draft.content,
                  metadata: { source_tag: draft.sourceTag, attachments: [] },
                }
              : {
                  category: "general",
                  content: draft.content,
                  metadata: { source_tag: draft.sourceTag },
                };

        submitFeedback(body, { onSuccess: clearDraft });
      } catch {
        localStorage.removeItem(storageKey);
      }
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [shopInfo.shopify_domain, shopInfo.app_plan, lastTaskRunId, submitFeedback]);

  const descriptionPlaceholder =
    category === "bug"
      ? t("feedback.modal_widget_description_placeholder_bug")
      : t("feedback.modal_widget_description_placeholder_default");

  return (
    <s-modal
      id={modalId}
      heading={t("feedback.modal_widget_title")}
      onShow={() => {
        // `category`/`includeContext` are sourced from the store via the
        // `panelDefaultCategory`-keyed effect above, not here — see Finding #6.
        setContent("");
        setContactEmail(shopInfo.email);
      }}
    >
      <s-stack direction="block" gap="base">
        <s-choice-list
          label={t("feedback.modal_widget_title")}
          name="feedback-category"
          values={[category]}
          onInput={(event: CallbackEvent<"s-choice-list">) => {
            const [selected] = event.currentTarget.values;
            if (selected) {
              setCategory(selected as typeof category);
              setIncludeContext(selected === "bug");
            }
          }}
        >
          <s-choice value="bug">{t("feedback.modal_widget_type_bug")}</s-choice>
          <s-choice value="feature_request">
            {t("feedback.modal_widget_type_feature")}
          </s-choice>
          <s-choice value="general">
            {t("feedback.modal_widget_type_general")}
          </s-choice>
        </s-choice-list>

        <s-text-area
          label={t("feedback.modal_widget_description_label")}
          placeholder={descriptionPlaceholder}
          value={content}
          onChange={(event: CallbackEvent<"s-text-area">) =>
            setContent(event.currentTarget.value)
          }
        />

        <s-checkbox
          label={t("feedback.modal_widget_checkbox_technical_context")}
          checked={includeContext}
          onChange={(event: CallbackEvent<"s-checkbox">) =>
            setIncludeContext(event.currentTarget.checked)
          }
        />

        {category === "bug" && (
          <s-email-field
            label={t("feedback.modal_widget_email_label")}
            value={contactEmail}
            onChange={(event: CallbackEvent<"s-email-field">) =>
              setContactEmail(event.currentTarget.value)
            }
          />
        )}

        {category === "feature_request" && (
          <s-text color="subdued">
            {t("feedback.modal_widget_hint_feature_board")}
          </s-text>
        )}
      </s-stack>

      <s-button
        slot="primary-action"
        variant="primary"
        loading={isPending}
        disabled={content.trim().length === 0}
        onClick={handleSubmit}
      >
        {t("feedback.modal_widget_button_submit")}
      </s-button>
      <s-button
        slot="secondary-actions"
        variant="secondary"
        commandFor={modalId}
        command="--hide"
      >
        {t("feedback.modal_widget_button_cancel")}
      </s-button>
    </s-modal>
  );
};

export default FeedbackPanel;
