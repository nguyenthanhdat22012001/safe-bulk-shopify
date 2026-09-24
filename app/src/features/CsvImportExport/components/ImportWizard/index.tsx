import { PREVIEW_POLL_TIMEOUT_MS } from "@/constants/csv";
import ColumnMappingStep from "@/features/CsvImportExport/components/ColumnMappingStep";
import ImportStepper from "@/features/CsvImportExport/components/ImportStepper";
import PreviewStep from "@/features/CsvImportExport/components/PreviewStep";
import UploadZone from "@/features/CsvImportExport/components/UploadZone";
import { csvImportQueries } from "@/queries/csvQueries";
import { Route, type ICsvSearch } from "@/routes/csv";
import type { ICsvImportTaskRun, IImportSourceError } from "@/types/csv";
import {
  deriveImportWizardStage,
  getImportSourceErrorContent,
  resolveStepNumber,
  type TWizardOverride,
} from "@/utils/csv";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const ProgressPanel = ({
  label,
  description,
}: {
  label: string;
  description?: string;
}) => (
  <s-box
    padding="large-200"
    borderWidth="base"
    borderColor="base"
    borderStyle="dashed"
    borderRadius="base"
  >
    <s-stack direction="block" gap="base" alignItems="center">
      <s-spinner accessibilityLabel={label} size="large" />
      <s-text>{label}</s-text>
      {description && <s-text color="subdued">{description}</s-text>}
    </s-stack>
  </s-box>
);

const ImportWizard = () => {
  const { t } = useTranslation();
  const navigate = Route.useNavigate();
  const { taskRunId: resumeTaskRunId } = Route.useSearch();

  const [taskRunId, setTaskRunId] = useState<number | null>(
    resumeTaskRunId ?? null,
  );
  const [override, setOverride] = useState<TWizardOverride>("NONE");
  const [awaitingSince, setAwaitingSince] = useState<number | null>(null);
  const [dismissedFailedTaskRunId, setDismissedFailedTaskRunId] = useState<
    number | null
  >(null);

  // While polling is active the query re-renders every tick, so this is
  // re-evaluated often enough to trip on time. Once it trips, the query stops
  // polling — the timeout is self-terminating. Reading the clock during
  // render is intentional here (not a counter or setTimeout — see the task
  // brief): the comparison only needs to trip *eventually*, and it depends
  // on the polling re-render cadence to do so, which is what makes reading
  // `Date.now()` here tolerable rather than merely convenient.
  //
  // This is a novel suppression, not an established codebase pattern — no
  // other file disables react-hooks/purity. It's safe today because this
  // project has no React Compiler / babel-plugin-react-compiler configured
  // (checked package.json and vite.config.ts: only @vitejs/plugin-react),
  // so there is no live memoization hazard to violate; if a compiler is
  // ever introduced, this line should be revisited.
  const hasPollTimedOut =
    awaitingSince !== null &&
    // eslint-disable-next-line react-hooks/purity
    Date.now() - awaitingSince > PREVIEW_POLL_TIMEOUT_MS;

  const isAwaitingPreview = override === "AWAITING_PREVIEW" && !hasPollTimedOut;

  const { data: taskRun, refetch } = useQuery({
    ...csvImportQueries.taskRun(taskRunId ?? 0, isAwaitingPreview),
    enabled: !!taskRunId,
  });

  const stage = deriveImportWizardStage({
    taskRunId,
    status: taskRun?.status,
    // isPreviewInvalid: taskRun?.preview?.valid === false,
    override,
    hasPollTimedOut,
  });

  const startAwaitingPreview = () => {
    setOverride("AWAITING_PREVIEW");
    setAwaitingSince(Date.now());
  };

  const handleUploaded = (uploaded: ICsvImportTaskRun) => {
    setTaskRunId(uploaded.id);
    setOverride("NONE");
    setAwaitingSince(null);
    navigate({
      search: (prev: ICsvSearch) => ({ ...prev, taskRunId: uploaded.id }),
      replace: true,
    });
  };

  const handleStartOver = () => {
    setTaskRunId(null);
    setOverride("NONE");
    setAwaitingSince(null);
  };

  const handleCheckAgain = () => {
    startAwaitingPreview();
    refetch();
  };

  const renderStage = () => {
    if (stage === "UPLOAD") return <UploadZone onUploaded={handleUploaded} />;

    if (stage === "ANALYZING") {
      return <ProgressPanel label={t("csv_import.label_analyzing_spinner")} />;
    }

    if (stage === "MAPPING" && taskRunId !== null) {
      return (
        <ColumnMappingStep
          taskRunId={taskRunId}
          onSubmitted={startAwaitingPreview}
        />
      );
    }

    if (stage === "AWAITING_PREVIEW") {
      return (
        <ProgressPanel
          label={t("csv_import.label_checking_data")}
          description={t("csv_import.description_checking_data")}
        />
      );
    }

    if (stage === "BUILDING_PREVIEW") {
      return <ProgressPanel label={t("csv_import.label_building_preview")} />;
    }

    if (stage === "PREVIEW_TIMEOUT") {
      return (
        <s-stack direction="block" gap="base">
          <s-banner
            tone="warning"
            heading={t("csv_import.banner_preview_timeout_title")}
          >
            <s-paragraph>
              {t("csv_import.banner_preview_timeout_description")}
            </s-paragraph>
          </s-banner>
          <s-stack direction="inline" gap="base">
            <s-button variant="primary" onClick={handleCheckAgain}>
              {t("csv_import.button_check_again")}
            </s-button>
            <s-button variant="secondary" onClick={handleStartOver}>
              {t("csv_import.button_upload_different_file")}
            </s-button>
          </s-stack>
        </s-stack>
      );
    }

    if ((stage === "BLOCKING_ERRORS" || stage === "PREVIEW") && taskRun) {
      return (
        <PreviewStep
          taskRun={taskRun}
          onPolicyChanged={startAwaitingPreview}
          onRunStarted={() => navigate({ to: "/" })}
          onStartOver={handleStartOver}
        />
      );
    }

    if (stage === "RUNNING") {
      return (
        <s-banner
          tone="info"
          heading={t("csv_import.banner_import_running_title")}
        >
          <s-stack direction="block" gap="small-200">
            <s-paragraph>
              {t("csv_import.banner_import_running_description")}
            </s-paragraph>
            <s-link onClick={() => navigate({ to: "/" })}>
              {t("csv_import.button_view_progress")}
            </s-link>
          </s-stack>
        </s-banner>
      );
    }

    if (stage === "FAILED") {
      const sourceErrors = (taskRun?.preview?.errors ?? []).filter(
        (error): error is IImportSourceError => error.row_number === null,
      );
      const isBannerDismissed = dismissedFailedTaskRunId === taskRunId;

      return (
        <s-stack direction="block" gap="base">
          {!isBannerDismissed && (
            <s-banner
              tone="critical"
              heading={t("csv_import.banner_import_failed_title")}
              dismissible
              onDismiss={() => setDismissedFailedTaskRunId(taskRunId)}
            >
              <s-stack direction="block" gap="small-200">
                {sourceErrors.length > 0 ? (
                  sourceErrors.map((error, index) => {
                    const { key, values } =
                      getImportSourceErrorContent(error);
                    return (
                      <s-paragraph key={`${error.code}-${index}`}>
                        {t(key, values)}
                      </s-paragraph>
                    );
                  })
                ) : (
                  <s-paragraph>
                    {t("csv_import.banner_import_failed_description_generic")}
                  </s-paragraph>
                )}
              </s-stack>
            </s-banner>
          )}
          <UploadZone onUploaded={handleUploaded} />
        </s-stack>
      );
    }

    return (
      <s-stack direction="block" gap="base">
        <s-banner
          tone="critical"
          heading={t("csv_import.banner_analysis_failed_title")}
        >
          <s-paragraph>
            {t("csv_import.banner_analysis_failed_description")}
          </s-paragraph>
        </s-banner>
        <s-button variant="secondary" onClick={handleStartOver}>
          {t("csv_import.button_upload_different_file")}
        </s-button>
      </s-stack>
    );
  };

  return (
    <s-stack direction="block" gap="base">
      <ImportStepper currentStep={resolveStepNumber(stage)} />
      {renderStage()}
    </s-stack>
  );
};

export default ImportWizard;
