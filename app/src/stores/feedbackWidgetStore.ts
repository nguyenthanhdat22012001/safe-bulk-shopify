import { ID_MODAL_SHOPIFY } from "@/constants/constantUnique";
import type { TFeedbackCategory, TFeedbackSourceTag } from "@/types/feedback";
import { create } from "zustand";

type TPanelCategory = Exclude<TFeedbackCategory, "rating" | "nps">;

export interface IFeedbackWidgetStore {
  isCompact: boolean;
  panelSourceTag: TFeedbackSourceTag;
  panelDefaultCategory: TPanelCategory;
  setIsCompact: (value: boolean) => void;
  openPanel: (params: {
    sourceTag: TFeedbackSourceTag;
    defaultCategory?: TPanelCategory;
  }) => void;
}

export const useFeedbackWidgetStore = create<IFeedbackWidgetStore>((set) => ({
  isCompact: false,
  panelSourceTag: "widget",
  panelDefaultCategory: "bug",
  setIsCompact: (value) => set({ isCompact: value }),
  openPanel: ({ sourceTag, defaultCategory = "bug" }) => {
    set({ panelSourceTag: sourceTag, panelDefaultCategory: defaultCategory });
    shopify.modal.show(ID_MODAL_SHOPIFY.feedback.modalWidget);
  },
}));
