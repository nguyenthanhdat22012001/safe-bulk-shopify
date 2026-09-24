import type { IApiResponse } from "@/types/serviceType";
import type { IFeedbackSubmitResponse, TFeedbackSubmitBody } from "@/types/feedback";
import axiosService from "./axiosService";

export const postFeedback = async (
  body: TFeedbackSubmitBody,
): Promise<IApiResponse<IFeedbackSubmitResponse>> => {
  const res = await axiosService({
    url: "/feedback",
    method: "POST",
    data: body,
  });

  const { data, status } = res;

  if (!status) throw new Error("Failed to submit feedback");

  return data;
};
