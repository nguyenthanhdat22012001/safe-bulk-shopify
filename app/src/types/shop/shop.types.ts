export type EAppPlan = "free" | "growth" | "professional";

export interface IShopInfo {
  id: number;
  shopify_domain: string;
  scope: string;
  status: string;
  shopify_plan: string;
  app_plan: EAppPlan;
  email: string;
  owner: string;
  uninstalled_at: string | null;
  created_at: string;
  updated_at: string;
  onboarding_tasks: string[];
}
