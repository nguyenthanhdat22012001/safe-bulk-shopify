import { type IGraphQLResponse } from "@/types/serviceType";
import type {
  GetDetailShopQuery,
  GetCollectionsQuery,
} from "@/types/shopify/admin.generated";
import { graphQLFetcher } from "./graphQLSerive";

/**
 * @description  get detail shop from shopify
 */
export const getDetailShopFromShopify = () =>
  graphQLFetcher<IGraphQLResponse<GetDetailShopQuery>>({
    query: `#graphql
           query getDetailShop {
            shop {
              currencyCode
              ianaTimezone
              timezoneAbbreviation
              timezoneOffset
              name
              email
              currencyFormats {
                moneyFormat
                moneyWithCurrencyFormat
              }
              myshopifyDomain
            }
          }
          `,
  });

/**
 * @description get collections from shopify, used to populate the Edit
 * Wizard's Collection filter dropdown (FE-SPEC-01)
 */
export const getCollectionsFromShopify = () =>
  graphQLFetcher<IGraphQLResponse<GetCollectionsQuery>>({
    query: `#graphql
      query getCollections {
        collections(first: 250) {
          edges {
            node {
              id
              title
            }
          }
        }
      }
    `,
  });
