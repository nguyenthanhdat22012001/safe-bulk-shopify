import { getCollectionsFromShopify, getDetailShopFromShopify } from "@/services/shopifyServices";
import { queryOptions } from "@tanstack/react-query";

const ShopifyQueryKeys = {
  getDetailShopFromShopify: "EShopifyQueryKeys.getDetailShopFromShopify",
  getCollectionsFromShopify: "EShopifyQueryKeys.getCollectionsFromShopify",
} as const;

export const queriesShopify = {
  getDetailShopFromShopify: queryOptions({
    queryKey: [ShopifyQueryKeys.getDetailShopFromShopify],
    queryFn: async () => {
      const { data } = await getDetailShopFromShopify();
      return data;
    },
  }),
  getCollectionsFromShopify: queryOptions({
    queryKey: [ShopifyQueryKeys.getCollectionsFromShopify],
    queryFn: async () => {
      const { data } = await getCollectionsFromShopify();
      return data.collections.edges.map((edge) => edge.node);
    },
  }),
};
