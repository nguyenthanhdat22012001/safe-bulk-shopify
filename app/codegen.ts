import { shopifyApiProject, ApiType } from "@shopify/api-codegen-preset";
import { ADMIN_API_VERSION } from "./src/constants/constantGeneral";

export default {
  projects: {
    default: shopifyApiProject({
      apiType: ApiType.Admin,
      apiVersion: ADMIN_API_VERSION,
      documents: ["./src/**/*.{ts,tsx}"],
      outputDir: "./src/types/shopify",
    }),
  },
};
