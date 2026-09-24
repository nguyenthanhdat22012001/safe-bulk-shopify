import { ID_MODAL_SHOPIFY } from "@/constants/constantUnique";
import { useCancelTaskRun } from "@/queries/taskRunQueries";
import { useTranslation } from "react-i18next";

interface IProps {
  run: { id: number } | null;
  onCancelled: (id: number) => void;
}

const CancelConfirmModal = ({ run, onCancelled }: IProps) => {
  const { t } = useTranslation();
  const { mutate: cancel, isPending } = useCancelTaskRun();

  const modalId = ID_MODAL_SHOPIFY.dashboard.modalCancelConfirm;

  const handleConfirm = () => {
    if (!run) return;
    cancel(run.id, {
      onSuccess: () => {
        onCancelled(run.id);
        shopify.modal.hide(modalId);
      },
    });
  };

  return (
    <s-modal id={modalId} heading={run ? t("dashboard.modal_cancel_title", { id: run.id }) : ""}>
      <s-paragraph>{t("dashboard.modal_cancel_description")}</s-paragraph>

      <s-button
        slot="primary-action"
        variant="primary"
        tone="critical"
        loading={isPending}
        onClick={handleConfirm}
      >
        {t("dashboard.modal_cancel_button_confirm")}
      </s-button>
      <s-button
        slot="secondary-actions"
        variant="secondary"
        commandFor={modalId}
        command="--hide"
      >
        {t("dashboard.modal_cancel_button_cancel")}
      </s-button>
    </s-modal>
  );
};

export default CancelConfirmModal;
