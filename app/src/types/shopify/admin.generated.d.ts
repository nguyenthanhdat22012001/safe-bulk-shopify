/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import type * as AdminTypes from './admin.types.js';

export type ShopNameQueryVariables = AdminTypes.Exact<{ [key: string]: never; }>;


export type ShopNameQuery = { shop: Pick<AdminTypes.Shop, 'name'> };

export type GetDetailShopQueryVariables = AdminTypes.Exact<{ [key: string]: never; }>;


export type GetDetailShopQuery = { shop: (
    Pick<AdminTypes.Shop, 'currencyCode' | 'ianaTimezone' | 'timezoneAbbreviation' | 'timezoneOffset' | 'name' | 'email' | 'myshopifyDomain'>
    & { currencyFormats: Pick<AdminTypes.CurrencyFormats, 'moneyFormat' | 'moneyWithCurrencyFormat'> }
  ) };

export type GetCollectionsQueryVariables = AdminTypes.Exact<{ [key: string]: never; }>;


export type GetCollectionsQuery = { collections: { edges: Array<{ node: Pick<AdminTypes.Collection, 'id' | 'title'> }> } };

interface GeneratedQueryTypes {
  "#graphql\n      query ShopName {\n        shop {\n          name\n        }\n      }\n    ": {return: ShopNameQuery, variables: ShopNameQueryVariables},
  "#graphql\n           query getDetailShop {\n            shop {\n              currencyCode\n              ianaTimezone\n              timezoneAbbreviation\n              timezoneOffset\n              name\n              email\n              currencyFormats {\n                moneyFormat\n                moneyWithCurrencyFormat\n              }\n              myshopifyDomain\n            }\n          }\n          ": {return: GetDetailShopQuery, variables: GetDetailShopQueryVariables},
  "#graphql\n      query getCollections {\n        collections(first: 250) {\n          edges {\n            node {\n              id\n              title\n            }\n          }\n        }\n      }\n    ": {return: GetCollectionsQuery, variables: GetCollectionsQueryVariables},
}

interface GeneratedMutationTypes {
}
declare module '@shopify/admin-api-client' {
  type InputMaybe<T> = AdminTypes.InputMaybe<T>;
  interface AdminQueries extends GeneratedQueryTypes {}
  interface AdminMutations extends GeneratedMutationTypes {}
}
