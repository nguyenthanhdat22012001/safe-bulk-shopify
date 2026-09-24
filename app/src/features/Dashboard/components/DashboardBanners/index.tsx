import TrialBanner from "@/components/pricing/TrialBanner";
import FreeQuotaBanner from "@/features/Dashboard/components/FreeQuotaBanner";
import { usePlanBanner, useWelcomeBanner } from "@/hooks/dashboard";
import type { TShopStoreInfo } from "@/stores/shopStore";

interface IProps {
  trialSubscription: TShopStoreInfo;
  onTrialQuotaExhausted: () => void;
}

const DashboardBanners = ({
  trialSubscription,
  onTrialQuotaExhausted,
}: IProps) => {
  const welcome = useWelcomeBanner();
  const plan = usePlanBanner();

  if (!welcome.visible && plan.type === "none") {
    return null;
  }

  return (
    <s-stack gap="base">

      {plan.type === "trial" && (
        <TrialBanner
          subscription={trialSubscription}
          onQuotaExhausted={onTrialQuotaExhausted}
        />
      )}
      {plan.type === "free_quota_warning" && (
        <FreeQuotaBanner
          variant="warning"
          quotaUsed={trialSubscription.monthly_quota_used}
          quotaLimit={trialSubscription.monthly_quota_limit ?? 0}
          resetsAt={trialSubscription.monthly_resets_at ?? null}
        />
      )}

      {plan.type === "free_quota_exhausted" && (
        <FreeQuotaBanner
          variant="exhausted"
          quotaUsed={trialSubscription.monthly_quota_used}
          quotaLimit={trialSubscription.monthly_quota_limit ?? 0}
          resetsAt={trialSubscription.monthly_resets_at ?? null}
        />
      )}
    </s-stack>
  );
};

export default DashboardBanners;
