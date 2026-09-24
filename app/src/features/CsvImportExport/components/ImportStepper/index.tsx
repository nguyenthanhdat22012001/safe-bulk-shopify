import { Fragment } from "react";
import { useTranslation } from "react-i18next";

type TImportStep = 1 | 2 | 3;

const IMPORT_STEPS: TImportStep[] = [1, 2, 3];

const STEP_HEADING_KEYS: Record<TImportStep, string> = {
  1: "csv_import.step1_heading",
  2: "csv_import.step2_heading",
  3: "csv_import.step3_heading",
};

const STEP_DESCRIPTION_KEYS: Record<TImportStep, string> = {
  1: "csv_import.step1_description",
  2: "csv_import.step2_description",
  3: "csv_import.step3_description",
};

interface IProps {
  currentStep: TImportStep;
}

const ImportStepper = ({ currentStep }: IProps) => {
  const { t } = useTranslation();

  return (
    <s-box
      padding="base"
      background="subdued"
      borderWidth="base"
      borderColor="base"
      borderRadius="base"
    >
      <s-stack direction="block" gap="small-200">
        <s-stack direction="inline" gap="small-100" alignItems="center">
          {IMPORT_STEPS.map((step, index) => {
            const isDone = step < currentStep;
            const isCurrent = step === currentStep;
            const isLast = index === IMPORT_STEPS.length - 1;

            return (
              <Fragment key={step}>
                <s-badge
                  tone={isDone ? "success" : isCurrent ? "info" : "neutral"}
                  color={isCurrent ? "strong" : "base"}
                  icon={
                    isDone
                      ? "check-circle-filled"
                      : isCurrent
                        ? "circle"
                        : "circle-dashed"
                  }
                >
                  {t(STEP_HEADING_KEYS[step])}
                </s-badge>
                {!isLast && (
                  <s-icon type="chevron-right" color="subdued" size="small" />
                )}
              </Fragment>
            );
          })}
        </s-stack>
        <s-text color="subdued">{t(STEP_DESCRIPTION_KEYS[currentStep])}</s-text>
      </s-stack>
    </s-box>
  );
};

export default ImportStepper;
