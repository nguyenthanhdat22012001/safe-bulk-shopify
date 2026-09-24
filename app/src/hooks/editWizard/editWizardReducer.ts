import type { IChangeRule, IFilterState, TSortBy } from "@/types/editWizard";

export type TWizardStep = 1 | 2 | 3;

export interface IWizardState {
  step: TWizardStep;
  filters: IFilterState;
  changeRule: IChangeRule | null;
  previewRevision: number;
  /** Set when entering Step 2 via the paywall banner's "Process first N" (FE-SPEC-03). */
  limit?: number;
  sortBy: TSortBy;
  /** The Step 1 matched_count at the moment `limit` was set — Step 3's passive banner
   * needs a total to pair with `limit` for a fresh partial run, and there's no other
   * source for it once Step 1/2 are behind us. */
  matchedCount?: number;
}

export const createInitialWizardState = (): IWizardState => ({
  step: 1,
  filters: {},
  changeRule: null,
  previewRevision: 0,
  sortBy: "recently_updated",
});

export type TWizardAction =
  | { type: "SET_FILTERS"; payload: IFilterState }
  | { type: "SET_CHANGE_RULE"; payload: IChangeRule }
  | { type: "GO_TO_STEP"; payload: TWizardStep }
  | { type: "SET_PARTIAL_LIMIT"; payload: { limit: number; sortBy: TSortBy; matchedCount: number } };

/**
 * `previewRevision` only increments on SET_CHANGE_RULE — it's how Step 3's
 * preview query key forces a fresh fetch whenever the Step 2 rule actually
 * changes, per FE-SPEC-13 ("never reuse a stale preview").
 */
export const editWizardReducer = (
  state: IWizardState,
  action: TWizardAction,
): IWizardState => {
  switch (action.type) {
    case "SET_FILTERS":
      return { ...state, filters: action.payload };
    case "SET_CHANGE_RULE":
      return {
        ...state,
        changeRule: action.payload,
        previewRevision: state.previewRevision + 1,
      };
    case "GO_TO_STEP":
      return { ...state, step: action.payload };
    case "SET_PARTIAL_LIMIT":
      return {
        ...state,
        limit: action.payload.limit,
        sortBy: action.payload.sortBy,
        matchedCount: action.payload.matchedCount,
        step: 2,
      };
    default:
      return state;
  }
};
