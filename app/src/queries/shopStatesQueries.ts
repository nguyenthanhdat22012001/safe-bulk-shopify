import {
  getShopStatesFeedback,
  patchShopStatesFeedback,
} from "@/services/shopStatesService";
import type { IShopStatesFeedbackNamespace } from "@/types/feedback";
import { queryOptions, useMutation } from "@tanstack/react-query";

export const EShopStatesQueryKeys = {
  feedbackNamespace: "EShopStatesQueryKeys.feedbackNamespace",
} as const;

export const shopStatesQueries = {
  feedbackNamespace: () =>
    queryOptions({
      queryKey: [EShopStatesQueryKeys.feedbackNamespace],
      queryFn: async () => {
        const { status, data } = await getShopStatesFeedback();
        if (!status) throw new Error("Failed to fetch shop states");
        return data.feedback;
      },
    }),
};

export const usePatchFeedbackState = () => {
  return useMutation({
    mutationFn: async (feedback: Partial<IShopStatesFeedbackNamespace>) => {
      const { status, data } = await patchShopStatesFeedback(feedback);
      if (!status) throw new Error("Failed to update shop states");
      return data.feedback;
    },
  });
};
