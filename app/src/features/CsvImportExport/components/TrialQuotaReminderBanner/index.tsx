import { useShopStore } from "@/stores/shopStore";
import { deriveCsvPlanStatus, getTrialQuotaReminder } from "@/utils/csv";
import { returnFormatNumber } from "@/utils/funcFormat";
import { useTranslation } from "react-i18next";

interface IProps {
  expectedProductCount: number;
}

const TrialQuotaReminderBanner = ({ expectedProductCount }: IProps) => {
  const { t } = useTranslation();
  const shopInfo = useShopStore((state) => state.shopInfo);
  const planStatus = deriveCsvPlanStatus(shopInfo);

  if (planStatus !== "trial") return null;

  const reminder = getTrialQuotaReminder(shopInfo);
  if (!reminder) return null;

  return (
    <s-banner tone="info">
      {t("csv_import.banner_trial_quota_reminder", {
        productCount: returnFormatNumber(expectedProductCount),
        quotaRemaining: returnFormatNumber(reminder.remaining),
        quotaUsed: returnFormatNumber(reminder.used),
        quotaLimit: returnFormatNumber(reminder.limit),
      })}
    </s-banner>
  );
};

export default TrialQuotaReminderBanner;
