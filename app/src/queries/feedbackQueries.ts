import { postFeedback } from "@/services/feedbackService";
import type { TFeedbackSubmitBody } from "@/types/feedback";
import { useMutation } from "@tanstack/react-query";

export const useSubmitFeedback = () => {
  return useMutation({
    mutationFn: async (body: TFeedbackSubmitBody) => {
      const { status, data } = await postFeedback(body);
      if (!status) throw new Error("Failed to submit feedback");
      return data;
    },
  });
};
