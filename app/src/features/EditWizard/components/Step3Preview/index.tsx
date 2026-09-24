import PaywallModal from "@/components/pricing/PaywallModal";
import { ID_MODAL_SHOPIFY } from "@/constants/constantUnique";
import { ATTRIBUTE_OPTIONS, SORT_BY_OPTIONS } from "@/constants/editWizard";
import CriticalGuardModal from "@/features/EditWizard/components/CriticalGuardModal";
import WizardStepper from "@/features/EditWizard/components/WizardStepper";
import { useActionsCheckList } from "@/hooks/dashboard";
import { useEditWizardContext } from "@/hooks/editWizard";
import { usePlanLimitErrorHandler } from "@/hooks/pricing";
import {
  EEditWizardQueries,
  EEditWizardQueryKeys,
  useSubmitFilterEdit,
} from "@/queries/editWizardQueries";
import { EPricingQueryKeys } from "@/queries/pricingQueries";
import { useApplyWatchStore } from "@/stores/applyWatchStore";
import { useFeedbackWidgetStore } from "@/stores/feedbackWidgetStore";
import type {
  IChangeDetail,
  IPreviewProduct,
  IProductVariantPreview,
  TProductPreviewStatus,
} from "@/types/editWizard";
import {
  buildFilterEditPreviewRequestBody,
  resolveStep3Banner,
} from "@/utils/editWizard";
import type { TStep3TopBanner } from "@/utils/editWizard";
import { returnFormatNumber } from "@/utils/funcFormat";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Fragment, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const STATUS_BADGE_CONFIG: Record<
  TProductPreviewStatus,
  { tone: "success" | "info" | "neutral"; labelKey: string }
> = {
  ACTIVE: { tone: "success", labelKey: "edit_wizard.filter_status_active" },
  DRAFT: { tone: "info", labelKey: "edit_wizard.filter_status_draft" },
  ARCHIVED: { tone: "neutral", labelKey: "edit_wizard.filter_status_archived" },
};

const PreviewSkeletonRow = () => (
  <s-table-row>
    <s-table-cell>
      <div className="h-4 w-32 rounded bg-gray-200 animate-pulse" />
    </s-table-cell>
    <s-table-cell>
      <div className="h-4 w-20 rounded bg-gray-200 animate-pulse" />
    </s-table-cell>
    <s-table-cell>
      <div className="h-4 w-16 rounded bg-gray-200 animate-pulse" />
    </s-table-cell>
    <s-table-cell>
      <div className="h-4 w-16 rounded bg-gray-200 animate-pulse" />
    </s-table-cell>
  </s-table-row>
);

const ProductCell = ({
  product,
  onToggleExpand,
}: {
  product: IPreviewProduct;
  onToggleExpand: () => void;
}) => {
  const { t } = useTranslation();
  const statusConfig = STATUS_BADGE_CONFIG[product.status] ?? {
    tone: "neutral" as const,
    labelKey: "edit_wizard.filter_status_active",
  };

  return (
    <s-stack direction="inline" gap="small-200">
      <s-thumbnail src={product.image ?? ""} alt={product.title} size="small" />
      <s-stack direction="block" gap="small-100">
        <s-button variant="tertiary" onClick={onToggleExpand}>
          {product.title}
        </s-button>
        <s-badge tone={statusConfig.tone}>{t(statusConfig.labelKey)}</s-badge>
      </s-stack>
    </s-stack>
  );
};

interface IChangeCellsProps {
  changes: IChangeDetail[];
  attributeSuffix?: React.ReactNode;
}

const ChangeValue = ({
  value,
  variant,
}: {
  value: string | string[] | null;
  variant: "old" | "new";
}) => {
  if (value === null) {
    return (
      <s-text type={variant === "old" ? "redundant" : "strong"} color="subdued">
        —
      </s-text>
    );
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return null;
    return (
      <s-stack direction="inline" gap="small-100">
        {value.map((tag) => (
          <s-chip key={tag}>{tag}</s-chip>
        ))}
      </s-stack>
    );
  }
  return variant === "old" ? (
    <s-text type="redundant" color="subdued">
      {value}
    </s-text>
  ) : (
    <s-text type="strong" tone="success">
      <span className="font-medium">{value}</span>
    </s-text>
  );
};

const ChangeCells = ({ changes, attributeSuffix }: IChangeCellsProps) => {
  const { t } = useTranslation();

  const getAttributeLabel = (field: string): string => {
    const option = ATTRIBUTE_OPTIONS.find((opt) => opt.value === field);
    return option ? t(option.labelI18nKey) : field;
  };

  return (
    <>
      <s-table-cell>
        <s-stack direction="block" gap="small-100">
          {changes.map((change) => (
            <div key={change.field}>{getAttributeLabel(change.field)}</div>
          ))}
        </s-stack>
        {attributeSuffix}
      </s-table-cell>
      <s-table-cell>
        <s-stack direction="block" gap="small-100">
          {changes.map((change, idx) => (
            <ChangeValue
              key={`${change.field}-${idx}`}
              value={change.old}
              variant="old"
            />
          ))}
        </s-stack>
      </s-table-cell>
      <s-table-cell>
        <s-stack direction="block" gap="small-100">
          {changes.map((change, idx) => (
            <ChangeValue
              key={`${change.field}-${idx}`}
              value={change.new}
              variant="new"
            />
          ))}
        </s-stack>
      </s-table-cell>
    </>
  );
};

type TRowSeverity = "ERROR" | "WARNING" | "VALID";

/** A row is ERROR if the backend will skip it, WARNING if it has an informational
 * warning but will still apply, VALID otherwise. Severity is structural (from
 * `will_skip`), never inferred from the warning text itself. */
const getRowSeverity = (
  willSkip: boolean,
  changes: IChangeDetail[],
): TRowSeverity => {
  if (willSkip) return "ERROR";
  if (changes.some((change) => change.warning !== null)) return "WARNING";
  return "VALID";
};

/** Every non-null warning message on a row's changes — shown for both ERROR and WARNING severity. */
const getWarningMessages = (changes: IChangeDetail[]): string[] =>
  changes
    .map((change) => change.warning)
    .filter((warning): warning is string => warning !== null);

const WarningCauseText = ({
  messages,
  tone,
}: {
  messages: string[];
  tone: "critical" | "caution";
}) => {
  if (messages.length === 0) return null;
  return (
    <s-stack direction="block" gap="small-100">
      {messages.map((message, idx) => (
        <s-text key={`cause-${idx}`} tone={tone}>
          {message}
        </s-text>
      ))}
    </s-stack>
  );
};

const SeverityBadge = ({ severity }: { severity: TRowSeverity }) => {
  const { t } = useTranslation();
  if (severity === "ERROR") {
    return <s-badge tone="critical">{t("edit_wizard.badge_error")}</s-badge>;
  }
  if (severity === "WARNING") {
    return <s-badge tone="warning">{t("edit_wizard.badge_warning")}</s-badge>;
  }
  return null;
};

/**
 * The page-level, tab-independent Critical Guard / Partial Processing banner.
 * The critical half has no CTA — with rows now rendering inline in one list
 * (no separate Error view to jump to), there's nothing left to link to.
 */
const Step3TopBanner = ({ banner }: { banner: TStep3TopBanner }) => {
  const { t } = useTranslation();

  if (banner.kind === "NONE") return null;

  if (banner.kind === "PARTIAL_ONLY") {
    return (
      <s-banner tone="info">
        {t("edit_wizard.step3_partial_banner", {
          batchSize: returnFormatNumber(banner.batchSize),
          totalMatched: returnFormatNumber(banner.totalMatched),
          sortLabel: banner.sortLabel,
        })}
      </s-banner>
    );
  }

  const criticalText =
    banner.kind === "MERGED"
      ? t("edit_wizard.banner_critical_guard_merged_title", {
          count: returnFormatNumber(banner.remainingErrorCount),
          batchSize: returnFormatNumber(banner.batchSize),
          totalMatched: returnFormatNumber(banner.totalMatched),
        })
      : t("edit_wizard.banner_error_title", {
          count: returnFormatNumber(banner.remainingErrorCount),
        });

  return (
    <s-banner tone="critical">
      <s-stack direction="block" gap="small-200">
        <s-text>{criticalText}</s-text>
        {banner.kind === "MERGED" && (
          <s-text>
            {t("edit_wizard.step3_partial_banner", {
              batchSize: returnFormatNumber(banner.batchSize),
              totalMatched: returnFormatNumber(banner.totalMatched),
              sortLabel: banner.sortLabel,
            })}
          </s-text>
        )}
      </s-stack>
    </s-banner>
  );
};

const Step3Preview = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { state, dispatch } = useEditWizardContext();
  const queryClient = useQueryClient();
  const [cursorHistory, setCursorHistory] = useState<(string | undefined)[]>([
    undefined,
  ]);
  const [expandedProductId, setExpandedProductId] = useState<string | null>(
    null,
  );
  const [extraVariants, setExtraVariants] = useState<IProductVariantPreview[]>(
    [],
  );
  const [variantsHasNextPage, setVariantsHasNextPage] = useState<string | null>(
    null,
  );
  const [variantsEndCursor, setVariantsEndCursor] = useState<string | null>(
    null,
  );
  const [variantAfterToFetch, setVariantAfterToFetch] = useState<
    string | undefined
  >(undefined);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [hasHitPlanLimit, setHasHitPlanLimit] = useState(false);
  const { paywallVariant, handlePlanLimitError } = usePlanLimitErrorHandler();

  const setIsCompact = useFeedbackWidgetStore((state) => state.setIsCompact);

  useEffect(() => {
    setIsCompact(true);
    return () => setIsCompact(false);
  }, [setIsCompact]);

  const cursor = cursorHistory[cursorHistory.length - 1];

  const previewRequestBody = buildFilterEditPreviewRequestBody(
    state.filters,
    state.changeRule!,
    cursor,
    {
      limit: state.limit,
      sortBy: state.limit ? state.sortBy : undefined,
    },
  );

  const submitBody = buildFilterEditPreviewRequestBody(
    state.filters,
    state.changeRule!,
    undefined,
    {
      limit: state.limit,
      sortBy: state.limit ? state.sortBy : undefined,
    },
  );

  const {
    data: previewData,
    isLoading,
    isError: isPreviewError,
  } = useQuery({
    ...EEditWizardQueries.filterEditPreview(
      previewRequestBody,
      state.previewRevision,
    ),
  });

  // Variants are embedded in `previewData.products[].variants` for the first
  // page — this on-demand request only runs when the user clicks "Load more
  // variants" for the currently expanded product.
  const detailsRequestBody =
    state.changeRule && expandedProductId && variantAfterToFetch
      ? {
          ...buildFilterEditPreviewRequestBody(state.filters, state.changeRule),
          product_id: expandedProductId,
          variant_after: variantAfterToFetch,
        }
      : null;

  const { data: detailsData, isFetching: isFetchingMoreVariants } = useQuery({
    ...EEditWizardQueries.productPreviewDetails(detailsRequestBody),
    enabled:
      Boolean(expandedProductId) &&
      Boolean(variantAfterToFetch) &&
      detailsRequestBody !== null,
  });

  useEffect(() => {
    if (!detailsData) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setExtraVariants((prev) => [...prev, ...detailsData.product.variants]);
    setVariantsHasNextPage(
      detailsData.product.variants_page_info.has_next_page,
    );
    setVariantsEndCursor(detailsData.product.variants_page_info.end_cursor);
    setVariantAfterToFetch(undefined);
  }, [detailsData]);

  const { mutate: submitFilterEdit, isPending: isSubmitting } =
    useSubmitFilterEdit();
  const setPendingTaskRunId = useApplyWatchStore(
    (state) => state.setPendingTaskRunId,
  );

  /** Backend no longer sends error_count/valid_count — tallied client-side from
   * whichever page is currently loaded. `validCount` counts everything that
   * isn't ERROR severity (VALID + WARNING both still get applied). */
  const pageSeverities: TRowSeverity[] =
    previewData?.products.map((product) => {
      const singleVariant =
        product.matched_variant_count === 1 ? product.variants[0] : null;
      const inlineChanges: IChangeDetail[] = [
        ...product.changes,
        ...(singleVariant ? singleVariant.changes : []),
      ];
      return getRowSeverity(
        product.will_skip || (singleVariant?.will_skip ?? false),
        inlineChanges,
      );
    }) ?? [];
  const errorCount = pageSeverities.filter(
    (severity) => severity === "ERROR",
  ).length;
  const validCount = pageSeverities.length - errorCount;
  const hasLoadedSummary = Boolean(previewData);

  const hasNextPage = Boolean(previewData?.has_next_page);

  const partialBatchInfo =
    state.limit !== undefined && state.matchedCount !== undefined
      ? { batchSize: state.limit, totalMatched: state.matchedCount }
      : null;

  const sortLabel = t(
    SORT_BY_OPTIONS.find((option) => option.value === state.sortBy)
      ?.labelI18nKey ?? "edit_wizard.sort_by_recently_updated",
  );

  const topBanner = resolveStep3Banner(
    errorCount,
    partialBatchInfo ? { ...partialBatchInfo, sortLabel } : null,
  );

  const handleSubmit = () => {
    submitFilterEdit(submitBody, {
      onSuccess: (taskRun) => {
        setPendingTaskRunId(taskRun.id);
        shopify.toast.show(t("edit_wizard.toast_submit_success"));
        setHasSubmitted(true);
        // FE-SPEC-14 case (b): refresh subscription data so a just-exhausted
        // trial quota is picked up by TrialBanner's exhaustion check on Dashboard.
        queryClient.invalidateQueries({
          queryKey: [EPricingQueryKeys.getSubscriptions],
        });
        navigate({ to: "/" });
      },
      onError: (error) => {
        if (handlePlanLimitError(error, "product_limit")) {
          // FE-SPEC-14 case (a) + general 403 principle: lock further Apply
          // attempts and refresh Step 1's gating state (recount + active session).
          setHasHitPlanLimit(true);
          queryClient.invalidateQueries({
            queryKey: [EEditWizardQueryKeys.filterMatchCount],
          });
          queryClient.invalidateQueries({
            queryKey: [EPricingQueryKeys.getSubscriptions],
          });
          return;
        }
        shopify.toast.show(t("edit_wizard.toast_submit_error"), {
          isError: true,
        });
      },
    });
  };

  const handleApplyClick = () => {
    if (errorCount > 0) {
      shopify.modal.show(ID_MODAL_SHOPIFY.editWizard.modalGuard);
      return;
    }
    handleSubmit();
  };

  const handleNextPage = () => {
    if (!previewData?.end_cursor) return;
    setCursorHistory((prev) => [...prev, previewData.end_cursor ?? undefined]);
  };

  const handlePreviousPage = () => {
    setCursorHistory((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  };

  const handlePrevious = () => {
    dispatch({ type: "GO_TO_STEP", payload: 2 });
  };

  const handleToggleExpand = (product: IPreviewProduct) => {
    const isExpanded = expandedProductId === product.id;
    setExtraVariants([]);
    setVariantAfterToFetch(undefined);
    if (isExpanded) {
      setExpandedProductId(null);
      setVariantsHasNextPage(null);
      setVariantsEndCursor(null);
      return;
    }
    setExpandedProductId(product.id);
    setVariantsHasNextPage(product.variants_page_info?.has_next_page ?? null);
    setVariantsEndCursor(product.variants_page_info?.end_cursor ?? null);
  };

  const handleLoadMoreVariants = () => {
    if (!variantsEndCursor) return;
    setVariantAfterToFetch(variantsEndCursor);
  };

  const { onMarkTaskDoneBackground } = useActionsCheckList();

  useEffect(() => {
    onMarkTaskDoneBackground("preview_viewed");
  }, []);

  return (
    <s-page heading={t("edit_wizard.step3_heading")}>
      <div className="flex flex-col gap-5">
        <WizardStepper currentStep={3} />
        <s-section>
          {isPreviewError && (
            <s-banner tone="critical" heading={t("common.error")}>
              {t("common.error_description")}
            </s-banner>
          )}
          <Step3TopBanner banner={topBanner} />

          {hasLoadedSummary && (
            <s-text color="subdued">
              {t("edit_wizard.summary_valid_error_counts", {
                validCount: returnFormatNumber(validCount),
                errorCount: returnFormatNumber(errorCount),
              })}
            </s-text>
          )}

          {errorCount > 0 && (
            <s-link onClick={handlePrevious}>
              {t("edit_wizard.button_return_to_step2")}
            </s-link>
          )}

          <s-table>
            <s-table-header-row>
              <s-table-header>
                {t("edit_wizard.table_column_product")}
              </s-table-header>
              <s-table-header>
                {t("edit_wizard.table_column_attribute")}
              </s-table-header>
              <s-table-header>
                {t("edit_wizard.table_column_before")}
              </s-table-header>
              <s-table-header>
                {t("edit_wizard.table_column_after")}
              </s-table-header>
            </s-table-header-row>
            <s-table-body>
              {isLoading && (
                <>
                  <PreviewSkeletonRow />
                  <PreviewSkeletonRow />
                  <PreviewSkeletonRow />
                  <PreviewSkeletonRow />
                  <PreviewSkeletonRow />
                  <PreviewSkeletonRow />
                  <PreviewSkeletonRow />
                  <PreviewSkeletonRow />
                  <PreviewSkeletonRow />
                  <PreviewSkeletonRow />
                </>
              )}
              {!isLoading &&
                previewData?.products.map((product) => {
                  const isExpanded = expandedProductId === product.id;
                  const singleVariant =
                    product.matched_variant_count === 1
                      ? product.variants[0]
                      : null;
                  const inlineChanges: IChangeDetail[] = [
                    ...product.changes,
                    ...(singleVariant ? singleVariant.changes : []),
                  ];
                  const showVariantsBadge = product.matched_variant_count > 1;
                  const expandedVariants = isExpanded
                    ? [...product.variants, ...extraVariants]
                    : [];
                  const showLoadMoreRow =
                    isExpanded &&
                    Boolean(variantsHasNextPage) &&
                    variantsHasNextPage !== "false";
                  const productSeverity = getRowSeverity(
                    product.will_skip || (singleVariant?.will_skip ?? false),
                    inlineChanges,
                  );
                  const causeMessages =
                    productSeverity !== "VALID"
                      ? getWarningMessages(inlineChanges)
                      : [];

                  return (
                    <Fragment key={product.id}>
                      <s-table-row>
                        <s-table-cell>
                          <s-stack direction="block" gap="small-100">
                            <ProductCell
                              product={product}
                              onToggleExpand={() => handleToggleExpand(product)}
                            />
                            <SeverityBadge severity={productSeverity} />
                            <WarningCauseText
                              messages={causeMessages}
                              tone={
                                productSeverity === "ERROR"
                                  ? "critical"
                                  : "caution"
                              }
                            />
                          </s-stack>
                        </s-table-cell>
                        <ChangeCells
                          changes={inlineChanges}
                          attributeSuffix={
                            showVariantsBadge ? (
                              <s-badge tone="info">
                                {t("edit_wizard.badge_variants_changed", {
                                  matched: returnFormatNumber(
                                    product.matched_variant_count,
                                  ),
                                  total: returnFormatNumber(
                                    product.total_variant_count,
                                  ),
                                })}
                              </s-badge>
                            ) : undefined
                          }
                        />
                      </s-table-row>
                      {expandedVariants.map((variant) => {
                        const variantLabel = variant.sku
                          ? `${variant.title} · ${t(
                              "edit_wizard.label_variant_sku",
                              { sku: variant.sku },
                            )}`
                          : variant.title;
                        const variantSeverity = getRowSeverity(
                          variant.will_skip,
                          variant.changes,
                        );
                        const variantCauseMessages =
                          variantSeverity !== "VALID"
                            ? getWarningMessages(variant.changes)
                            : [];

                        return (
                          <s-table-row key={variant.id}>
                            <s-table-cell>
                              <s-stack direction="block" gap="small-100">
                                <s-text>{variantLabel}</s-text>
                                <SeverityBadge severity={variantSeverity} />
                                <WarningCauseText
                                  messages={variantCauseMessages}
                                  tone={
                                    variantSeverity === "ERROR"
                                      ? "critical"
                                      : "caution"
                                  }
                                />
                              </s-stack>
                            </s-table-cell>
                            <ChangeCells changes={variant.changes} />
                          </s-table-row>
                        );
                      })}
                      {showLoadMoreRow && (
                        <s-table-row>
                          <s-table-cell>
                            <s-button
                              variant="tertiary"
                              loading={isFetchingMoreVariants}
                              onClick={handleLoadMoreVariants}
                            >
                              {t("edit_wizard.button_load_more_variants")}
                            </s-button>
                          </s-table-cell>
                          <s-table-cell></s-table-cell>
                          <s-table-cell></s-table-cell>
                          <s-table-cell></s-table-cell>
                        </s-table-row>
                      )}
                    </Fragment>
                  );
                })}
            </s-table-body>
          </s-table>

          <s-stack direction="inline" gap="small-200">
            <s-button
              variant="secondary"
              disabled={cursorHistory.length <= 1}
              onClick={handlePreviousPage}
            >
              {t("edit_wizard.button_pagination_previous")}
            </s-button>
            <s-button
              variant="secondary"
              disabled={!hasNextPage}
              onClick={handleNextPage}
            >
              {t("edit_wizard.button_pagination_next")}
            </s-button>
          </s-stack>
        </s-section>
      </div>

      <s-button
        slot="primary-action"
        loading={isSubmitting}
        disabled={
          isLoading ||
          isPreviewError ||
          !hasLoadedSummary ||
          hasSubmitted ||
          hasHitPlanLimit
        }
        onClick={handleApplyClick}
      >
        {t("edit_wizard.button_apply")}
      </s-button>
      <s-button
        slot="secondary-actions"
        variant="secondary"
        onClick={handlePrevious}
      >
        {t("edit_wizard.button_previous")}
      </s-button>

      <CriticalGuardModal
        errorCount={errorCount}
        validCount={validCount}
        onConfirm={handleSubmit}
      />
      <PaywallModal variant={paywallVariant} pathReturn="/edit-wizard" />
    </s-page>
  );
};

export default Step3Preview;
