import { ID_MODAL_SHOPIFY } from "@/constants/constantUnique";
import { returnFormatNumber } from "@/utils/funcFormat";
import { useTranslation } from "react-i18next";

interface IProps {
  errorCount: number;
  validCount: number;
  onConfirm: () => void;
}

/**
 * FE-SPEC-10: Primary action is "Cancel & Review Again" (the safe choice),
 * Secondary is the risky confirm — a deliberate inversion of the usual
 * primary/danger convention, per the source spec.
 */
const CriticalGuardModal = ({ errorCount, validCount, onConfirm }: IProps) => {
  const { t } = useTranslation();

  return (
    <s-modal
      id={ID_MODAL_SHOPIFY.editWizard.modalGuard}
      heading={t("edit_wizard.modal_guard_title")}
    >
      <s-banner tone="critical">
        {t("edit_wizard.modal_guard_description", {
          errorCount: returnFormatNumber(errorCount),
          validCount: returnFormatNumber(validCount),
        })}
      </s-banner>

      <s-button
        slot="primary-action"
        variant="primary"
        commandFor={ID_MODAL_SHOPIFY.editWizard.modalGuard}
        command="--hide"
      >
        {t("edit_wizard.modal_guard_button_cancel")}
      </s-button>
      <s-button
        slot="secondary-actions"
        variant="secondary"
        onClick={() => {
          onConfirm();
          shopify.modal.hide(ID_MODAL_SHOPIFY.editWizard.modalGuard);
        }}
      >
        {t("edit_wizard.modal_guard_button_confirm", {
          validCount: returnFormatNumber(validCount),
        })}
      </s-button>
    </s-modal>
  );
};

export default CriticalGuardModal;
