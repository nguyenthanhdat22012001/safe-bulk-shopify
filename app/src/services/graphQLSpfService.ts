import type { IGraphQLResponse } from "../types/serviceType";
import type { ShopNameQuery } from "@/types/shopify/admin.generated";
import { graphQLFetcher } from "./graphQLSerive";

export const getOneProductRandom = () =>
  graphQLFetcher<IGraphQLResponse<ShopNameQuery>>({
    query: `#graphql
      query ShopName {
        shop {
          name
        }
      }
    `,
  });
