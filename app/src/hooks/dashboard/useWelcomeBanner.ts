import { useShopStore } from "@/stores/shopStore";
import {
  dismissWelcomeBanner,
  isWelcomeBannerDismissed,
} from "@/utils/dashboard";
import { useState } from "react";

export interface IWelcomeBanner {
  visible: boolean;
  dismiss: () => void;
}

export const useWelcomeBanner = (): IWelcomeBanner => {
  const shopInfo = useShopStore((state) => state.shopInfo);
  const [welcomeDismissed, setWelcomeDismissed] = useState(() =>
    isWelcomeBannerDismissed(shopInfo.id),
  );
  // const { data, isLoading } = useQuery(taskRunQueries.taskRuns({ page: 1 }));

  // const historyCount = data?.total ?? 0;

  return {
    visible: !welcomeDismissed,
    // visible: welcomeDismissed ? false : !isLoading && historyCount === 0,
    dismiss: () => {
      dismissWelcomeBanner(shopInfo.id);
      setWelcomeDismissed(true);
    },
  };
};
