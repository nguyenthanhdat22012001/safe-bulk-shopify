export interface IApiResponseBase {
  status: boolean;
  message: string;
  error?: boolean;
  sentryId?: string;
  code?: number;
  //   errors?:
  //     | string
  //     | {
  //         code: string;
  //         error_code?: string;
  //       };
  // errors?:{
  //     type:string;
  //     optimize?:string
  // } | [] ;
}
export interface IApiResponse<T = unknown, E = unknown> extends IApiResponseBase {
  data: T;
  errors?: E;
}
export interface IGraphQLResponse<T = unknown> {
  data: T;
  errors?: Array<{ message: string }>;
  extensions?: Extensions;
}

export interface Extensions {
  cost: Cost;
}
export interface Cost {
  requestedQueryCost: number;
  actualQueryCost: number;
  throttleStatus: ThrottleStatus;
}

export interface ThrottleStatus {
  maximumAvailable: number;
  currentlyAvailable: number;
  restoreRate: number;
}
