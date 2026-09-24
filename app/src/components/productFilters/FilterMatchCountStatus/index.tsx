import { returnFormatNumber } from "@/utils/funcFormat";
import { useTranslation } from "react-i18next";

interface IProps {
  isFetching: boolean;
  isError: boolean;
  count: number;
}

const FilterMatchCountStatus = ({ isFetching, isError, count }: IProps) => {
  const { t } = useTranslation();

  const countResultIcon = isError
    ? "alert-triangle"
    : count > 0
      ? "check-circle"
      : "alert-circle";

  const countResultTone = isError
    ? "critical"
    : count > 0
      ? "success"
      : "neutral";

  return (
    <s-stack direction="inline" gap="small-200" alignItems="center">
      {isFetching ? (
        <s-spinner size="base" />
      ) : (
        <s-icon type={countResultIcon} tone={countResultTone} />
      )}
      <s-text tone={isFetching ? undefined : countResultTone}>
        {isFetching
          ? t("common.loading")
          : isError
            ? t("common.error_description")
            : count > 0
              ? t("edit_wizard.step1_matches_count", {
                  count: returnFormatNumber(count),
                })
              : t("edit_wizard.step1_matches_count_zero")}
      </s-text>
    </s-stack>
  );
};

export default FilterMatchCountStatus;
