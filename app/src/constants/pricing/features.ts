import { type IPricingFeature } from "@/types/pricing";
import { PLAN_CONFIG } from "./planConfig";

export const FREE_FEATURES: IPricingFeature[] = [
  { nameI18nKey: "pricing.features_edit_core", included: true },
  { nameI18nKey: "pricing.features_edit_limit", included: true },
  { nameI18nKey: "pricing.features_undo_48h", included: true },
  {
    nameI18nKey: "pricing.features_csv_import_export",
    included: PLAN_CONFIG.free.csv_enabled,
  },
  { nameI18nKey: "pricing.features_support_24_7", included: false },
];

export const PRO_FEATURES: IPricingFeature[] = [
  { nameI18nKey: "pricing.features_unlimited_products", included: true, highlight: true },
  { nameI18nKey: "pricing.features_undo_30d", included: true },
  {
    nameI18nKey: "pricing.features_csv_10mb",
    included: PLAN_CONFIG.growth.csv_enabled,
    highlight: true,
  },
  { nameI18nKey: "pricing.features_priority_processing", included: true },
  { nameI18nKey: "pricing.features_support_1h", included: true },
];

export const ENTERPRISE_FEATURES: IPricingFeature[] = [
  { nameI18nKey: "pricing.features_unlimited_everything", included: true, highlight: true },
  { nameI18nKey: "pricing.features_lifetime_history", included: true, highlight: true },
  // {
  //   nameI18nKey: "pricing.features_staff_20",
  //   included: PLAN_CONFIG.professional.staff_permissions_enabled,
  //   highlight: true,
  // },
  { nameI18nKey: "pricing.features_draft_approve", included: true, highlight: true },
  { nameI18nKey: "pricing.features_express_server", included: true, highlight: true },
  { nameI18nKey: "pricing.features_automated_backups", included: true, highlight: true },
];

export const DETAILED_COMPARISON = [
  {
    nameI18nKey: "pricing.comparison_edit_limit",
    freeI18nKey: "pricing.comparison_free_50",
    proI18nKey: "pricing.comparison_unlimited",
    enterpriseI18nKey: "pricing.comparison_unlimited",
  },
  {
    nameI18nKey: "pricing.comparison_monthly_limit",
    freeI18nKey: "pricing.comparison_free_500",
    proI18nKey: "pricing.comparison_unlimited",
    enterpriseI18nKey: "pricing.comparison_unlimited",
  },
  {
    nameI18nKey: "pricing.comparison_undo_limit",
    freeI18nKey: "pricing.comparison_free_48h",
    proI18nKey: "pricing.comparison_pro_30d",
    enterpriseI18nKey: "pricing.comparison_unlimited_time",
  },
  {
    nameI18nKey: "pricing.comparison_csv_import_export",
    freeI18nKey: "x",
    proI18nKey: "pricing.comparison_pro_10mb",
    enterpriseI18nKey: "pricing.comparison_unlimited",
  },
  // {
  //   nameI18nKey: "pricing.comparison_staff_permissions",
  //   freeI18nKey: "x",
  //   proI18nKey: "x",
  //   enterpriseI18nKey: "pricing.comparison_enterprise_20",
  // },
  {
    nameI18nKey: "pricing.comparison_approval_workflows",
    freeI18nKey: "x",
    proI18nKey: "x",
    enterpriseI18nKey: "v",
  },
  {
    nameI18nKey: "pricing.comparison_server_queue",
    freeI18nKey: "pricing.comparison_free_shared",
    proI18nKey: "pricing.comparison_pro_standard",
    enterpriseI18nKey: "pricing.comparison_enterprise_express",
  },
  {
    nameI18nKey: "pricing.comparison_automated_backups",
    freeI18nKey: "x",
    proI18nKey: "x",
    enterpriseI18nKey: "v",
  },
  {
    nameI18nKey: "pricing.comparison_technical_support",
    freeI18nKey: "pricing.comparison_free_support",
    proI18nKey: "pricing.comparison_pro_support",
    enterpriseI18nKey: "pricing.comparison_enterprise_support",
  },
];

