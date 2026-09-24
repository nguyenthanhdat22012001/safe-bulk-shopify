import { useReducer, type PropsWithChildren } from "react";
import {
  createInitialWizardState,
  editWizardReducer,
} from "./editWizardReducer";
import { EditWizardContext } from "./useEditWizardContext";

export const EditWizardProvider = ({ children }: PropsWithChildren) => {
  const [state, dispatch] = useReducer(
    editWizardReducer,
    createInitialWizardState(),
  );

  return (
    <EditWizardContext.Provider value={{ state, dispatch }}>
      {children}
    </EditWizardContext.Provider>
  );
};
