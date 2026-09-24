import Tabs, { type ITabItem } from "@/components/commonUIs/Tabs";
import ExportPanel from "@/features/CsvImportExport/components/ExportPanel";
import ImportWizard from "@/features/CsvImportExport/components/ImportWizard";
import { Route } from "@/routes/csv";
import { useTranslation } from "react-i18next";

const CsvImportExportView = () => {
  const { t } = useTranslation();
  const { mode } = Route.useSearch();
  const navigate = Route.useNavigate();

  const tabItems: ITabItem[] = [
    { value: "import", label: t("csv_import.tab_import") },
    { value: "export", label: t("csv_import.tab_export") },
  ];

  const handleTabChange = (nextMode: string) => {
    navigate({ search: { mode: nextMode === "export" ? "export" : "import" } });
  };

  return (
    <s-page heading={t("csv_import.title")}>
      <s-section heading={t("csv_import.subtitle")}>
        <s-stack direction="block" gap="base">
          <Tabs
            items={tabItems}
            value={mode}
            onChange={handleTabChange}
            accessibilityLabel={t("csv_import.title")}
          />
          {mode === "import" ? <ImportWizard /> : <ExportPanel />}
        </s-stack>
      </s-section>
    </s-page>
  );
};

export default CsvImportExportView;
