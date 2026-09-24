import TagComboField from "@/components/commonUIs/TagComboField";
import type { IFilterState, TProductStatus } from "@/types/editWizard";
import type { IDataShopifyCollectionNode } from "@/types/shopify";
import { useTranslation } from "react-i18next";

interface IProps {
  filters: IFilterState;
  collections: IDataShopifyCollectionNode[] | undefined;
  onChange: <K extends keyof IFilterState>(
    key: K,
    value: IFilterState[K],
  ) => void;
}

const ProductFilterFields = ({ filters, collections, onChange }: IProps) => {
  const { t } = useTranslation();

  return (
    <s-grid
      gridTemplateColumns="@container (inline-size < 480px) 1fr, 1fr 1fr"
      gap="base"
    >
      <s-select
        label={t("edit_wizard.filter_collection_label")}
        value={filters.collection_id ?? "null"}
        onInput={(e) =>
          onChange(
            "collection_id",
            e.currentTarget.value === "null"
              ? undefined
              : e.currentTarget.value,
          )
        }
      >
        <s-option value="null">
          {t("edit_wizard.filter_collection_placeholder")}
        </s-option>
        {collections?.map((collection) => (
          <s-option key={collection.id} value={collection.id}>
            {collection.title}
          </s-option>
        ))}
      </s-select>

      <s-select
        label={t("edit_wizard.filter_status_label")}
        value={filters.status ?? "null"}
        onInput={(e) =>
          onChange(
            "status",
            e.currentTarget.value === "null"
              ? undefined
              : (e.currentTarget.value as TProductStatus),
          )
        }
      >
        <s-option value="null">{t("common.txt_any")}</s-option>
        <s-option value="active">
          {t("edit_wizard.filter_status_active")}
        </s-option>
        <s-option value="draft">
          {t("edit_wizard.filter_status_draft")}
        </s-option>
      </s-select>

      <s-grid-item gridColumn="span 2">
        <TagComboField
          label={t("edit_wizard.filter_tags_label")}
          placeholder={t("edit_wizard.filter_tags_placeholder")}
          value={filters.tags ?? []}
          onChange={(tags) => onChange("tags", tags)}
        />
      </s-grid-item>

      <s-money-field
        label={t("edit_wizard.filter_price_min_label")}
        value={filters.price_min?.toString() ?? ""}
        onInput={(e) =>
          onChange(
            "price_min",
            e.currentTarget.value ? Number(e.currentTarget.value) : undefined,
          )
        }
      />
      <s-money-field
        label={t("edit_wizard.filter_price_max_label")}
        value={filters.price_max?.toString() ?? ""}
        onInput={(e) =>
          onChange(
            "price_max",
            e.currentTarget.value ? Number(e.currentTarget.value) : undefined,
          )
        }
      />

      <s-number-field
        label={t("edit_wizard.filter_inventory_min_label")}
        value={filters.inventory_min?.toString() ?? ""}
        onInput={(e) =>
          onChange(
            "inventory_min",
            e.currentTarget.value ? Number(e.currentTarget.value) : undefined,
          )
        }
      />
      <s-number-field
        label={t("edit_wizard.filter_inventory_max_label")}
        value={filters.inventory_max?.toString() ?? ""}
        onInput={(e) =>
          onChange(
            "inventory_max",
            e.currentTarget.value ? Number(e.currentTarget.value) : undefined,
          )
        }
      />
    </s-grid>
  );
};

export default ProductFilterFields;
