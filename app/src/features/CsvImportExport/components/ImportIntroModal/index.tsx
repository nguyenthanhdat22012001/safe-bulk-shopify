import { ID_MODAL_SHOPIFY } from "@/constants/constantUnique";
import { useTranslation } from "react-i18next";

/**
 * Purely static help content — see `docs/superpowers/specs` FIX #14. Auto-shown
 * once by `UploadZone` (which also owns the "seen" flag) and reopenable at any
 * time via the `[? Instructions for use]` button, regardless of that flag.
 */
const ImportIntroModal = () => {
  const { t } = useTranslation();
  const modalId = ID_MODAL_SHOPIFY.csvImport.modalIntro;

  return (
    <s-modal id={modalId} heading={t("csv_import.modal_import_intro_title")}>
      <s-stack direction="block" gap="base">
        <s-paragraph>{t("csv_import.modal_import_intro_point_1")}</s-paragraph>
        <s-paragraph>{t("csv_import.modal_import_intro_point_2")}</s-paragraph>
        <s-paragraph>{t("csv_import.modal_import_intro_point_3")}</s-paragraph>
        <s-checkbox
          label={t("csv_import.modal_import_intro_checkbox_dont_show_again")}
          defaultChecked
        />
      </s-stack>

      <s-button
        slot="primary-action"
        variant="primary"
        commandFor={modalId}
        command="--hide"
      >
        {t("csv_import.modal_import_intro_button_got_it")}
      </s-button>
    </s-modal>
  );
};

export default ImportIntroModal;
