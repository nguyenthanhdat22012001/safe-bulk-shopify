import type { TWizardStep } from "@/hooks/editWizard";
import { Fragment } from "react";
import { useTranslation } from "react-i18next";

interface IProps {
  currentStep: TWizardStep;
}

const WIZARD_STEPS: TWizardStep[] = [1, 2, 3];

const STEP_HEADING_KEYS: Record<TWizardStep, string> = {
  1: "edit_wizard.step1_heading",
  2: "edit_wizard.step2_heading",
  3: "edit_wizard.step3_heading",
};

const STEP_DESCRIPTION_KEYS: Record<TWizardStep, string> = {
  1: "edit_wizard.step1_description",
  2: "edit_wizard.step2_description",
  3: "edit_wizard.step3_description",
};

const WizardStepper = ({ currentStep }: IProps) => {
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
          {WIZARD_STEPS.map((step, index) => {
            const isDone = step < currentStep;
            const isCurrent = step === currentStep;
            const isLast = index === WIZARD_STEPS.length - 1;

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

export default WizardStepper;
