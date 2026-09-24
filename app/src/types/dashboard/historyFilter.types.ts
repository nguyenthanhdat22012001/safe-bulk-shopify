import type { TTaskRunOperationType, TTaskRunStatus } from "@/types/editWizard";

export interface IHistoryFilters {
  search: string;
  status: TTaskRunStatus | null;
  operation_type: TTaskRunOperationType | null;
  date_from: string;
  date_to: string;
}
