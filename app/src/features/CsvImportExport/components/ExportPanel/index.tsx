import PaywallModal from "@/components/pricing/PaywallModal";
import FilterMatchCountStatus from "@/components/productFilters/FilterMatchCountStatus";
import ProductFilterFields from "@/components/productFilters/ProductFilterFields";
import { ASYNC_EXPORT_THRESHOLD } from "@/constants/csv";
import { ID_MODAL_SHOPIFY } from "@/constants/constantUnique";
import { usePlanLimitErrorHandler } from "@/hooks/pricing/usePlanLimitErrorHandler";
import { useFilterMatchCount } from "@/hooks/productFilters";
import { useExportCsv } from "@/queries/csvQueries";
import { queriesShopify } from "@/queries/queriesShopify";
import { ETaskRunQueryKeys } from "@/queries/taskRunQueries";
import type { IFilterState } from "@/types/editWizard";
import { buildFilterEditRequestBody } from "@/utils/editWizard";
import { returnFormatNumber } from "@/utils/funcFormat";
import { deriveCsvPlanStatus, getExportTriggerGateState } from "@/utils/csv";
import { useShopStore } from "@/stores/shopStore";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const ExportPanel = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [localFilters, setLocalFilters] = useState<IFilterState>({});

  const { data: collections } = useQuery(
    queriesShopify.getCollectionsFromShopify,
  );

  const { debouncedFilters, matchedCount, isCountFetching, isCountError } =
    useFilterMatchCount(localFilters);

  const { mutate: exportCsv, isPending: isExporting } = useExportCsv();
  const { paywallVariant, handlePlanLimitError } = usePlanLimitErrorHandler();

  const shopInfo = useShopStore((state) => state.shopInfo);
  const planStatus = deriveCsvPlanStatus(shopInfo);
  const exportGate = getExportTriggerGateState(planStatus);

  const updateFilter = <K extends keyof IFilterState>(
    key: K,
    value: IFilterState[K],
  ) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleExportClick = () => {
    if (exportGate.locked) {
      shopify.modal.show(ID_MODAL_SHOPIFY.pricing.modalPaywall);
      return;
    }

    exportCsv(buildFilterEditRequestBody(debouncedFilters), {
      onSuccess: () => {
        shopify.toast.show(t("csv_import.toast_export_processing"));
        queryClient.invalidateQueries({ queryKey: [ETaskRunQueryKeys.taskRuns] });
      },
      onError: (error) => {
        if (handlePlanLimitError(error, "csv_feature")) return;
        shopify.toast.show(t("csv_import.toast_export_error"), { isError: true });
      },
    });
  };

  return (
    <s-stack direction="block" gap="base">
      <s-stack direction="block" gap="small-300">
        <s-stack direction="inline" gap="small-300" alignItems="center">
          <s-icon type="export" tone="info" />
          <s-text type="strong">{t("csv_import.export_heading")}</s-text>
        </s-stack>
        <s-text color="subdued">{t("csv_import.export_description")}</s-text>
      </s-stack>

      <ProductFilterFields
        filters={localFilters}
        collections={collections}
        onChange={updateFilter}
      />

      <s-divider />

      <s-stack
        direction="inline"
        gap="base"
        alignItems="center"
        justifyContent="space-between"
      >
        <FilterMatchCountStatus
          isFetching={isCountFetching}
          isError={isCountError}
          count={matchedCount}
        />

        <s-button
          variant="primary"
          disabled={matchedCount === 0 || isExporting}
          loading={isExporting}
          interestFor="export-csv-tooltip"
          onClick={handleExportClick}
        >
          {t("csv_import.button_export")}
        </s-button>
        <s-tooltip id="export-csv-tooltip">
          {t("edit_wizard.tooltip_export_async_threshold", {
            count: returnFormatNumber(ASYNC_EXPORT_THRESHOLD),
          })}
        </s-tooltip>
      </s-stack>

      <PaywallModal
        variant={exportGate.locked ? "csv_feature" : paywallVariant}
        pathReturn="/csv"
      />
    </s-stack>
  );
};

export default ExportPanel;
