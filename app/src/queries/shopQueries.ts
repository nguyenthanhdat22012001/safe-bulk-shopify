import { useShopStore } from "@/stores/shopStore";
import type { IShopInfo } from "@/types/shop";
import { queryOptions, useMutation } from "@tanstack/react-query";
import { getInfoShop, updateShop } from "../services/shopService";

/**
 * React Query Keys for Shop
 *
 * Centralized query key definitions for consistent cache management
 * and query invalidation across the Shop feature.
 */
const EShopQueryKeys = {
  getInfoShop: "EShopQueryKeys.getInfoShop",
} as const;

/**
 * Get Shop info query
 *
 * Fetches current Shop information with caching and error handling.
 */
export const shopQueries = {
  getInfoShop: queryOptions({
    queryKey: [EShopQueryKeys.getInfoShop],
    queryFn: async () => {
      const { status, data } = await getInfoShop();
      if (!status) throw new Error("Failed to fetch Shop info");
      return data;
    },
  }),
};

export const useUpdateShop = () => {
  const setShopInfo = useShopStore((state) => state.setShopInfo);

  return useMutation({
    mutationFn: async (
      payload: Partial<Pick<IShopInfo, "onboarding_tasks">>,
    ) => {
      const { status, data } = await updateShop(payload);
      if (!status) throw new Error("Failed to update Shop info");
      return data;
    },
    onSuccess: (data) => {
      setShopInfo({ onboarding_tasks: data.onboarding_tasks });
    },
  });
};
