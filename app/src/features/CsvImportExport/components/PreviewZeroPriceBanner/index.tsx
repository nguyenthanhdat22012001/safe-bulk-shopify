import type { IImportPreviewOperation, TWarningPolicy } from "@/types/csv";
import { returnFormatNumber } from "@/utils/funcFormat";
import type { CallbackEvent } from "@shopify/polaris-types";
import { useTranslation } from "react-i18next";

const ZERO_PRICE_CODE = "zero_price";

interface IProps {
  /** Current page only — this banner counts `zero_price` warnings on the
   * loaded page, since the backend's `summary.warning_count` spans every
   * warning code and can't be narrowed to `zero_price` alone. */
  operations: IImportPreviewOperation[];
  policy: TWarningPolicy;
  isSaving: boolean;
  onChangePolicy: (policy: TWarningPolicy) => void;
}

const PreviewZeroPriceBanner = ({
  operations,
  policy,
  isSaving,
  onChangePolicy,
}: IProps) => {
  const { t } = useTranslation();

  const warningCount = operations.filter((operation) =>
    operation.warnings.some((warning) => warning.code === ZERO_PRICE_CODE),
  ).length;

  if (warningCount === 0) return null;

  const handleChange = (event: CallbackEvent<"s-choice-list">) => {
    const [selected] = event.currentTarget.values;
    if (selected === "include" || selected === "skip") onChangePolicy(selected);
  };

  return (
    <s-banner
      tone="warning"
      heading={t("csv_import.banner_zero_price_title_page", {
        count: returnFormatNumber(warningCount),
      })}
    >
      <s-stack direction="block" gap="small-200">
        <s-paragraph>
          {t("csv_import.banner_zero_price_description")}
        </s-paragraph>
        <s-choice-list
          label={t("csv_import.choice_zero_price_label")}
          name="csv-import-warning-policy"
          values={[policy]}
          disabled={isSaving}
          onInput={handleChange}
        >
          <s-choice value="include">
            {t("csv_import.choice_zero_price_include")}
          </s-choice>
          <s-choice value="skip">
            {t("csv_import.choice_zero_price_skip")}
          </s-choice>
        </s-choice-list>
      </s-stack>
    </s-banner>
  );
};

export default PreviewZeroPriceBanner;
