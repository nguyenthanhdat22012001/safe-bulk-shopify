export interface IDataShopifyPageInfo {
  startCursor: string;
  endCursor: string;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface IDataShopifyCollectionNode {
  id: string;
  title: string;
}
