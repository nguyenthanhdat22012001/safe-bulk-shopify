import PaywallModal from "@/components/pricing/PaywallModal";
import {
  ACCEPTED_CSV_EXTENSIONS,
  CSV_IMPORT_INTRO_SEEN_FLAG,
} from "@/constants/csv";
import { ID_MODAL_SHOPIFY } from "@/constants/constantUnique";
import ImportIntroModal from "@/features/CsvImportExport/components/ImportIntroModal";
import UploadZoneCapacityBanner from "@/features/CsvImportExport/components/UploadZoneCapacityBanner";
import { usePlanLimitErrorHandler } from "@/hooks/pricing/usePlanLimitErrorHandler";
import { useExportCsv, useImportCsv } from "@/queries/csvQueries";
import { useUpdateShop } from "@/queries/shopQueries";
import { IN_FLIGHT_STATUSES, taskRunQueries } from "@/queries/taskRunQueries";
import { useShopStore } from "@/stores/shopStore";
import type { ICsvImportTaskRun } from "@/types/csv";
import type { IApiResponseBase } from "@/types/serviceType";
import {
  deriveCsvPlanStatus,
  getUploadZoneGateState,
  validateFileSize,
} from "@/utils/csv";
import { returnFormatNumber } from "@/utils/funcFormat";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const extractErrorMessage = (error: unknown, fallback: string): string => {
  if (!axios.isAxiosError(error)) return fallback;
  const body = error.response?.data as Partial<IApiResponseBase> | undefined;
  return body?.message || fallback;
};

interface IProps {
  onUploaded: (taskRun: ICsvImportTaskRun) => void;
}

const UploadZone = ({ onUploaded }: IProps) => {
  const { t } = useTranslation();
  const shopInfo = useShopStore((state) => state.shopInfo);
  const planStatus = deriveCsvPlanStatus(shopInfo);
  const gate = getUploadZoneGateState(planStatus);
  const [sizeCheck, setSizeCheck] =
    useState<ReturnType<typeof validateFileSize>>();
  const { paywallVariant, handlePlanLimitError } = usePlanLimitErrorHandler();
  const { mutate: mutateShop } = useUpdateShop();

  // Auto-show the intro modal exactly once per shop — mirrors
  // `onMarkTaskDoneBackground` (fire-and-forget, mark-on-show rather than
  // mark-on-dismiss, since "auto-show exactly once" is the hard requirement).
  // The flag guard makes this idempotent, so re-running once `onboarding_tasks`
  // updates after the mutation succeeds is harmless.
  useEffect(() => {
    if (shopInfo.onboarding_tasks.includes(CSV_IMPORT_INTRO_SEEN_FLAG)) return;

    shopify.modal.show(ID_MODAL_SHOPIFY.csvImport.modalIntro);
    mutateShop({
      onboarding_tasks: [
        ...shopInfo.onboarding_tasks,
        CSV_IMPORT_INTRO_SEEN_FLAG,
      ],
    });
  }, [shopInfo.onboarding_tasks, mutateShop]);

  const {
    mutate: importCsv,
    isPending: isUploading,
    isError: isUploadError,
    error: uploadError,
    reset: resetImport,
  } = useImportCsv();

  const [sampleTaskRunId, setSampleTaskRunId] = useState<number | null>(null);

  const { mutate: exportSample, isPending: isRequestingSample } =
    useExportCsv();

  const { data: sampleTaskRun } = useQuery({
    ...taskRunQueries.taskRun(sampleTaskRunId),
    enabled: sampleTaskRunId !== null,
  });

  const isDownloadingSample = isRequestingSample || sampleTaskRunId !== null;

  useEffect(() => {
    if (!sampleTaskRun || IN_FLIGHT_STATUSES.has(sampleTaskRun.status)) return;

    if (sampleTaskRun.download_url) {
      window.open(sampleTaskRun.download_url, "_blank", "noopener");
    } else {
      shopify.toast.show(t("csv_import.toast_sample_download_error"), {
        isError: true,
      });
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSampleTaskRunId(null);
  }, [sampleTaskRun, t]);

  const openLockedPaywall = () => {
    shopify.modal.show(ID_MODAL_SHOPIFY.pricing.modalPaywall);
  };

  const handleFile = (file: File) => {
    setSizeCheck(undefined);

    const check = validateFileSize(planStatus, file.size);
    if (check.blocked) {
      setSizeCheck(check);
      return;
    }

    importCsv(file, {
      onSuccess: onUploaded,
      onError: (mutationError) => {
        if (handlePlanLimitError(mutationError, "csv_feature")) {
          resetImport();
        }
      },
    });
  };

  const handleDownloadSample = () => {
    if (gate.locked) {
      openLockedPaywall();
      return;
    }

    exportSample(
      {
        resource_type: "product",
        priority_order: "recently_updated",
        limit: 10,
      },
      {
        onSuccess: (taskRun) => setSampleTaskRunId(taskRun.id),
        onError: () =>
          shopify.toast.show(t("csv_import.toast_sample_download_error"), {
            isError: true,
          }),
      },
    );
  };

  return (
    <s-stack direction="block" gap="base">
      <s-banner tone="info" heading={t("csv_import.banner_undoable_title")}>
        <s-paragraph>{t("csv_import.banner_undoable_description")}</s-paragraph>
      </s-banner>

      {gate.locked ? (
        <s-box
          padding="large-200"
          borderWidth="base"
          borderColor="base"
          borderStyle="dashed"
          borderRadius="base"
          background="subdued"
        >
          <s-stack direction="block" gap="base" alignItems="center">
            <s-icon type="lock" color="subdued" />
            <s-text type="strong">
              {t("csv_import.overlay_upload_locked_title")}
            </s-text>
            <s-text color="subdued">
              {t("csv_import.overlay_upload_locked_description")}
            </s-text>
            <s-button variant="primary" onClick={openLockedPaywall}>
              {t("csv_import.button_upgrade_import")}
            </s-button>
          </s-stack>
        </s-box>
      ) : (
        <>
          {/* Safe: this branch only renders when `getUploadZoneGateState` reports
              `locked: false`, which happens only when `planStatus !== "free"`
              (see utils/csv/gating.ts). TS can't correlate that across the two
              separate variables, so the exclusion is asserted here. */}
          <UploadZoneCapacityBanner
            planStatus={planStatus as Exclude<typeof planStatus, "free">}
            sizeCheck={sizeCheck}
          />

          {isUploading ? (
            <s-box
              padding="large-200"
              borderWidth="base"
              borderColor="base"
              borderStyle="dashed"
              borderRadius="base"
            >
              <s-stack direction="block" gap="base" alignItems="center">
                <s-spinner
                  accessibilityLabel={t("csv_import.label_uploading_spinner")}
                  size="large"
                />
                <s-text>{t("csv_import.label_uploading_spinner")}</s-text>
              </s-stack>
            </s-box>
          ) : (
            <s-drop-zone
              accept={ACCEPTED_CSV_EXTENSIONS}
              label={t("csv_import.label_drop_zone")}
              labelAccessibilityVisibility="exclusive"

              error={
                sizeCheck?.blocked
                  ? t("csv_import.inline_error_file_too_large_plan", {
                      fileSizeMb: returnFormatNumber(
                        Math.ceil(sizeCheck.fileSizeMb ?? 0),
                      ),
                      limitMb: sizeCheck.limitMb,
                    })
                  : isUploadError
                    ? extractErrorMessage(
                        uploadError,
                        t("csv_import.inline_error_upload_generic"),
                      )
                    : undefined
              }
              onInput={(event) => {
                const [file] = event.currentTarget.files;
                if (file) handleFile(file);
              }}
              onDropRejected={() => setSizeCheck(undefined)}
            >
              <s-paragraph>{t("csv_import.instruction_drop_zone")}</s-paragraph>
            </s-drop-zone>
          )}
        </>
      )}

      <s-stack direction="block" gap="small-200">
        <s-text color="subdued">{t("csv_import.instruction_note")}</s-text>
        <s-text color="subdued">
          {t("csv_import.instruction_sku_required_1")}
        </s-text>
        <s-text color="subdued">
          {t("csv_import.instruction_sku_required_2")}
        </s-text>
      </s-stack>

      <s-stack direction="block" gap="small-200">
        <s-button
          variant="tertiary"
          onClick={() =>
            shopify.modal.show(ID_MODAL_SHOPIFY.csvImport.modalIntro)
          }
        >
          {t("csv_import.button_instructions_for_use")}
        </s-button>
        <s-stack direction="inline" gap="base" alignItems="center">
          <s-button
            variant="tertiary"
            href="/samples/csv-import-blank-template.csv"
            download="csv-import-blank-template.csv"
          >
            {t("csv_import.button_sample_blank")}
          </s-button>
          <s-button
            variant="tertiary"
            loading={isDownloadingSample}
            onClick={handleDownloadSample}
          >
            {t("csv_import.button_sample_real_data")}
          </s-button>
        </s-stack>
        <s-text color="subdued">
          {t("csv_import.inline_sample_blank_suggestion")}
        </s-text>
      </s-stack>

      <PaywallModal
        variant={gate.locked ? "csv_feature" : paywallVariant}
        pathReturn="/csv"
      />
      <ImportIntroModal />
    </s-stack>
  );
};

export default UploadZone;
