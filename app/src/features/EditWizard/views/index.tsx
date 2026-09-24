import Step1Filters from "@/features/EditWizard/components/Step1Filters";
import Step2ActionForm from "@/features/EditWizard/components/Step2ActionForm";
import Step3Preview from "@/features/EditWizard/components/Step3Preview";
import { EditWizardProvider, useEditWizardContext } from "@/hooks/editWizard";

const EditWizardSteps = () => {
  const { state } = useEditWizardContext();

  switch (state.step) {
    case 1:
      return <Step1Filters />;
    case 2:
      return <Step2ActionForm />;
    case 3:
      return <Step3Preview />;
  }
};

const EditWizardView = () => {
  return (
    <EditWizardProvider>
      <EditWizardSteps />
    </EditWizardProvider>
  );
};

export default EditWizardView;
