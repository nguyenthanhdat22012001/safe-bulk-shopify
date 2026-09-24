import { CSV_MAX_FILE_SIZE_MB } from "@/constants/csv";
import type { IFileSizeCheck, TCsvPlanStatus } from "@/types/csv";
import { returnFormatNumber } from "@/utils/funcFormat";
import { useTranslation } from "react-i18next";

interface IProps {
  planStatus: Exclude<TCsvPlanStatus, "free">;
  sizeCheck?: IFileSizeCheck;
}

const UploadZoneCapacityBanner = ({ planStatus, sizeCheck }: IProps) => {
  const { t } = useTranslation();
  const limitMb = CSV_MAX_FILE_SIZE_MB[planStatus];

  if (sizeCheck?.blocked) {
    return (
      <s-banner tone="critical">
        {t("csv_import.inline_error_file_too_large_plan", {
          fileSizeMb: returnFormatNumber(Math.ceil(sizeCheck.fileSizeMb ?? 0)),
          limitMb: sizeCheck.limitMb,
        })}
      </s-banner>
    );
  }

  return (
    <s-banner tone="info">
      {limitMb === null
        ? t("csv_import.banner_max_file_size_unlimited")
        : t("csv_import.banner_max_file_size", { limitMb })}
    </s-banner>
  );
};

export default UploadZoneCapacityBanner;
