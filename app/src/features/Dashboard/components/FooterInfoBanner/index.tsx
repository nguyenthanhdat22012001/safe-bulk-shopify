import { IN_FLIGHT_STATUSES, taskRunQueries } from "@/queries/taskRunQueries";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

const FooterInfoBanner = () => {
  const { t } = useTranslation();
  const { data } = useQuery(taskRunQueries.taskRuns({ page: 1 }));

  const hasApplyingRow = (data?.data ?? []).some((run) =>
    IN_FLIGHT_STATUSES.has(run.status),
  );

  if (!hasApplyingRow) return null;

  return (
    <s-banner tone="info">{t("dashboard.banner_footer_processing")}</s-banner>
  );
};

export default FooterInfoBanner;
