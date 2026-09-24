import type { IShopStatesFeedbackNamespace } from "@/types/feedback";
import { create } from "zustand";

export interface IFeedbackStateStore {
  feedbackState: IShopStatesFeedbackNamespace;
  /** True only once the `feedback` shop-states namespace has been fetched
   * successfully at least once (set by `AuthShop`). Stays `false` forever if
   * `GET /api/shop-states?namespaces[]=feedback` never resolves or errors —
   * consumers must gate any read/increment of `feedbackState` on this so a
   * failed fetch can't clobber a real server-side value with the all-zero
   * default (see Finding #5 of the final review). */
  isLoaded: boolean;
  setFeedbackState: (partial: Partial<IShopStatesFeedbackNamespace>) => void;
  setIsLoaded: (value: boolean) => void;
}

export const useFeedbackStateStore = create<IFeedbackStateStore>((set) => ({
  feedbackState: {
    "apply.success_count": 0,
    "rating.dismissed_at": null,
    "rating.last_sentiment": null,
    "rating.shown_count": 0,
    "rating.last_reviews_api_code": null,
    "nps.last_shown_at": null,
    "prompt.last_active_shown_at": null,
  },
  isLoaded: false,
  setFeedbackState: (partial) =>
    set((state) => ({
      feedbackState: { ...state.feedbackState, ...partial },
    })),
  setIsLoaded: (value) => set({ isLoaded: value }),
}));
