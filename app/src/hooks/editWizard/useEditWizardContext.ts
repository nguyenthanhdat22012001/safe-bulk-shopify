import { createContext, useContext, type Dispatch } from "react";
import type { IWizardState, TWizardAction } from "./editWizardReducer";

interface IEditWizardContextValue {
  state: IWizardState;
  dispatch: Dispatch<TWizardAction>;
}

export const EditWizardContext = createContext<IEditWizardContextValue | null>(null);

export const useEditWizardContext = () => {
  const context = useContext(EditWizardContext);
  if (!context) {
    throw new Error("useEditWizardContext must be used within EditWizardProvider");
  }
  return context;
};
