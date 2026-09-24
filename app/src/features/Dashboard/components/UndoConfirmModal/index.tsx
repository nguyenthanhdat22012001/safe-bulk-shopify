import { ID_MODAL_SHOPIFY } from "@/constants/constantUnique";
import { useActionsCheckList } from "@/hooks/dashboard";
import { useUndoTaskRun } from "@/queries/taskRunQueries";
import { useTranslation } from "react-i18next";

interface IProps {
  run: { id: number } | null;
}

const UndoConfirmModal = ({ run }: IProps) => {
  const { t } = useTranslation();
  const { mutate: undo, isPending, error, reset } = useUndoTaskRun();

  const modalId = ID_MODAL_SHOPIFY.dashboard.modalUndoConfirm;

  const { onMarkTaskDoneBackground } = useActionsCheckList();

  const handleConfirm = () => {
    if (!run) return;
    undo(run.id, {
      onSuccess: () => {
        onMarkTaskDoneBackground("undo_used");
        shopify.modal.hide(modalId);
      },
    });
  };

  return (
    <s-modal
      id={modalId}
      heading={run ? t("dashboard.modal_undo_title", { id: run.id }) : ""}
    >
      <s-paragraph>{t("dashboard.modal_undo_description")}</s-paragraph>
      {error && (
        <s-banner tone="critical">
          {t("dashboard.toast_undo_not_allowed")}
        </s-banner>
      )}

      <s-button
        slot="primary-action"
        variant="primary"
        tone="critical"
        loading={isPending}
        onClick={handleConfirm}
      >
        {t("dashboard.modal_undo_button_confirm")}
      </s-button>
      <s-button
        slot="secondary-actions"
        variant="secondary"
        commandFor={modalId}
        command="--hide"
        onClick={reset}
      >
        {t("dashboard.modal_undo_button_cancel")}
      </s-button>
    </s-modal>
  );
};

export default UndoConfirmModal;
