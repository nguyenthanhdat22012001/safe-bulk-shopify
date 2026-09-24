export type TProductStatus = "active" | "draft";

export interface IFilterState {
  collection_id?: string;
  tags?: string[];
  status?: TProductStatus;
  price_min?: number;
  price_max?: number;
  inventory_min?: number;
  inventory_max?: number;
}

export interface IFilterMatchCountResponse {
  total_count: string;
  total_count_precision: string;
}
