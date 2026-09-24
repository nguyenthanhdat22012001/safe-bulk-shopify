import { ADMIN_API_VERSION } from "@/constants/constantGeneral";

export const graphQLFetcher = async <
  ResponseData = unknown,
  TVariables = Record<string, unknown>,
>({
  headers = {},
  signal,
  query = "",
  variables = {} as TVariables,
}: {
  headers?: Record<string, string>;
  signal?: AbortSignal;
  query?: string;
  variables?: TVariables;
}): Promise<ResponseData> => {
  try {
    const baseUrl = `shopify:admin/api/${ADMIN_API_VERSION}/graphql.json`;

    const body =
      JSON.stringify({
        query,
        variables,
      }) || "";

    const options: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      signal,
      body,
    };

    const response = await fetch(baseUrl, options);
    const result = (await response.json()) as ResponseData;

    return result;
  } catch (error) {
    console.error("Error fetching data", error);

    throw error;
  }
};
