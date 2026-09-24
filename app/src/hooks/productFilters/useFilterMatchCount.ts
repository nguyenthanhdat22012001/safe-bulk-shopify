import { FILTER_DEBOUNCE_MS } from "@/constants/editWizard";
import { EEditWizardQueries } from "@/queries/editWizardQueries";
import type { IFilterState } from "@/types/editWizard";
import { buildFilterEditRequestBody } from "@/utils/editWizard";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";

export const useFilterMatchCount = (filters: IFilterState) => {
  const [debouncedFilters] = useDebounce(filters, FILTER_DEBOUNCE_MS);

  const { data, isFetching, isError } = useQuery(
    EEditWizardQueries.filterMatchCount(
      buildFilterEditRequestBody(debouncedFilters),
    ),
  );

  return {
    debouncedFilters,
    countData: data,
    matchedCount: data ? Number(data.total_count) : 0,
    isCountFetching: isFetching,
    isCountError: isError,
  };
};
