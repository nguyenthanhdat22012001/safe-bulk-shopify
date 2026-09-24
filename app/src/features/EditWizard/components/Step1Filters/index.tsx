import PaywallModal from "@/components/pricing/PaywallModal";
import FilterMatchCountStatus from "@/components/productFilters/FilterMatchCountStatus";
import ProductFilterFields from "@/components/productFilters/ProductFilterFields";
import { ID_MODAL_SHOPIFY } from "@/constants/constantUnique";
import { ASYNC_EXPORT_THRESHOLD } from "@/constants/csv";
import PaywallBanner from "@/features/EditWizard/components/PaywallBanner";
import WizardStepper from "@/features/EditWizard/components/WizardStepper";
import { useEditWizardContext } from "@/hooks/editWizard";
import { usePlanLimitErrorHandler } from "@/hooks/pricing";
import { useFilterMatchCount } from "@/hooks/productFilters";
import { useExportCsv } from "@/queries/csvQueries";
import { queriesShopify } from "@/queries/queriesShopify";
import { ETaskRunQueryKeys } from "@/queries/taskRunQueries";
import { useShopStore } from "@/stores/shopStore";
import type { IFilterState, TSortBy } from "@/types/editWizard";
import { deriveCsvPlanStatus, getExportTriggerGateState } from "@/utils/csv";
import {
  buildFilterEditRequestBody,
  computeQuotaGating,
} from "@/utils/editWizard";
import { returnFormatNumber } from "@/utils/funcFormat";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const Step1Filters = () => {
  const { t } = useTranslation();
  const { state, dispatch } = useEditWizardContext();
  const queryClient = useQueryClient();
  const shopInfo = useShopStore((storeState) => storeState.shopInfo);
  const [localFilters, setLocalFilters] = useState<IFilterState>(state.filters);
  const [sortBy, setSortBy] = useState<TSortBy>(state.sortBy);

  const { data: collections } = useQuery(
    queriesShopify.getCollectionsFromShopify,
  );

  const {
    debouncedFilters,
    matchedCount,
    isCountFetching,
    isCountError,
  } = useFilterMatchCount(localFilters);

  const { mutate: exportCsv, isPending: isExporting } = useExportCsv();

  const gating = computeQuotaGating(matchedCount, shopInfo);

  const { paywallVariant, handlePlanLimitError } = usePlanLimitErrorHandler();

  const planStatus = deriveCsvPlanStatus(shopInfo);
  const exportGate = getExportTriggerGateState(planStatus);

  const updateFilter = <K extends keyof IFilterState>(
    key: K,
    value: IFilterState[K],
  ) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    dispatch({ type: "SET_FILTERS", payload: localFilters });
    dispatch({ type: "GO_TO_STEP", payload: 2 });
  };

  const handleProcessFirstN = () => {
    if (gating.effective_limit_this_request === null) return;
    dispatch({ type: "SET_FILTERS", payload: localFilters });
    dispatch({
      type: "SET_PARTIAL_LIMIT",
      payload: {
        limit: gating.effective_limit_this_request,
        sortBy,
        matchedCount,
      },
    });
  };

  const handleExportClick = () => {
    if (exportGate.locked) {
      shopify.modal.show(ID_MODAL_SHOPIFY.pricing.modalPaywall);
      return;
    }

    exportCsv(buildFilterEditRequestBody(debouncedFilters), {
      onSuccess: () => {
        shopify.toast.show(
          t("edit_wizard.toast_export_processing", {
            count: returnFormatNumber(matchedCount),
          }),
        );
        queryClient.invalidateQueries({
          queryKey: [ETaskRunQueryKeys.taskRuns],
        });
      },
      onError: (error) => {
        if (handlePlanLimitError(error, "csv_feature")) return;
        shopify.toast.show(t("edit_wizard.toast_export_error"), {
          isError: true,
        });
      },
    });
  };

  const isNextDisabled = matchedCount === 0 || gating.limit_reason !== "NONE";

  return (
    <s-page heading={t("edit_wizard.step1_heading")}>
      <div className="flex flex-col gap-5">
        <WizardStepper currentStep={1} />
        <PaywallBanner
          gating={gating}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          onProcessFirstN={handleProcessFirstN}
          monthlyResetsAt={shopInfo.monthly_resets_at ?? null}
        />
        <s-section heading={t("edit_wizard.step1_filters_heading")}>
          <ProductFilterFields
            filters={localFilters}
            collections={collections}
            onChange={updateFilter}
          />

          <s-divider />

          <FilterMatchCountStatus
            isFetching={isCountFetching}
            isError={isCountError}
            count={matchedCount}
          />
        </s-section>
      </div>

      <s-button
        slot="primary-action"
        variant="primary"
        disabled={isNextDisabled}
        onClick={handleNext}
      >
        {t("edit_wizard.button_next_configure")}
      </s-button>
      <s-button
        slot="secondary-actions"
        variant="secondary"
        disabled={matchedCount === 0 || isExporting}
        loading={isExporting}
        interestFor="export-csv-tooltip"
        onClick={handleExportClick}
      >
        {t("edit_wizard.button_export_csv")}
      </s-button>
      <s-tooltip id="export-csv-tooltip">
        {t("edit_wizard.tooltip_export_async_threshold", {
          count: returnFormatNumber(ASYNC_EXPORT_THRESHOLD),
        })}
      </s-tooltip>

      <PaywallModal
        variant={exportGate.locked ? "csv_feature" : paywallVariant}
        pathReturn="/csv"
      />
    </s-page>
  );
};

export default Step1Filters;
