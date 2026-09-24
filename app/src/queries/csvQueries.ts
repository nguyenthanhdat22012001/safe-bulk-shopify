import { IMPORT_POLL_INTERVAL_MS } from "@/constants/csv";
import {
  exportCsv,
  getImportPreview,
  getImportTaskRun,
  importCsv,
  runImport,
  updateImportConfiguration,
  updatePreviewItemIgnored,
} from "@/services/csvService";
import type {
  IImportConfigurationRequestBody,
  IImportPreviewFilters,
} from "@/types/csv";
import type { IFilterEditRequestBody } from "@/types/editWizard";
import { queryOptions, useMutation } from "@tanstack/react-query";

export const ECsvImportQueryKeys = {
  importTaskRun: "ECsvImportQueryKeys.importTaskRun",
  importPreview: "ECsvImportQueryKeys.importPreview",
} as const;

export const csvImportQueries = {
  /**
   * `isAwaitingPreview` is intentionally NOT part of the query key — it only
   * changes the poll cadence, so keeping it out of the key lets every observer
   * share one cache entry.
   *
   * Before this change `refetchInterval` returned `false` for every status but
   * `analyzing`, so after saving a column mapping the wizard never learned the
   * run had reached `ready`.
   */
  taskRun: (id: number, isAwaitingPreview = false) =>
    queryOptions({
      queryKey: [ECsvImportQueryKeys.importTaskRun, id],
      queryFn: async () => {
        if (!id) throw new Error("Task run ID is required");
        const { status, data } = await getImportTaskRun(id);
        if (!status) throw new Error("Failed to fetch import task run");
        return data;
      },

      refetchInterval: (query) => {
        const run = query.state.data;
        if (run?.status === "analyzing" || run?.status === "previewing") {
          return IMPORT_POLL_INTERVAL_MS;
        }
        if (run?.status === "configuring" && isAwaitingPreview) {
          // `preview.valid === false` is the backend saying it rejected the
          // data and will not build a plan — stop polling and show the errors.
          return IMPORT_POLL_INTERVAL_MS;
        }
        return false;
      },
      // The app runs embedded in the Shopify Admin iframe, where
      // `document.hasFocus()` can report false even while the merchant is
      // looking right at the screen (focus tracks which frame last received
      // an interaction, not which frame is visible). Without this,
      // TanStack Query schedules the interval but silently never dispatches
      // it, permanently stalling the wizard on AWAITING_PREVIEW/BUILDING_PREVIEW.
      // refetchIntervalInBackground: true,
    }),

  preview: (id: number, page: number, filters?: IImportPreviewFilters) =>
    queryOptions({
      queryKey: [
        ECsvImportQueryKeys.importPreview,
        id,
        page,
        filters?.warning ?? null,
        filters?.ignored ?? null,
        filters?.changed ?? null,
      ],
      queryFn: async () => {
        const { status, data } = await getImportPreview(id, page, filters);
        if (!status) throw new Error("Failed to fetch import preview");
        return data;
      },
    }),
};

export const useExportCsv = () => {
  return useMutation({
    mutationFn: async (body: IFilterEditRequestBody) => {
      const { status, data } = await exportCsv({
        ...body,
        columns: {
          base: {
            include: true,
            columns: [
              "ID",
              "Handle",
              "Title",
              "Vendor",
              "Type",
              "Tags",
              "Status",
            ],
          },
          variants: {
            include: true,
            columns: [
              "Variant ID",
              "Variant SKU",
              "Variant Price",
              "Variant Compare At Price",
              "Variant Inventory Qty",
            ],
          },
        },
      });
      if (!status) throw new Error("Failed to export CSV");
      return data;
    },
  });
};

export const useImportCsv = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      const { status, data } = await importCsv(file);
      if (!status) throw new Error("Failed to import CSV");
      return data;
    },
  });
};

export const useUpdateImportConfiguration = () => {
  return useMutation({
    mutationFn: async ({
      id,
      body,
    }: {
      id: number;
      body: IImportConfigurationRequestBody;
    }) => {
      const { status, data } = await updateImportConfiguration(id, body);
      if (!status) throw new Error("Failed to update import configuration");
      return data;
    },
  });
};

export const useUpdatePreviewItemIgnored = () => {
  return useMutation({
    mutationFn: async ({
      id,
      itemId,
      ignored,
    }: {
      id: number;
      itemId: number;
      ignored: boolean;
    }) => {
      const { status, data } = await updatePreviewItemIgnored(
        id,
        itemId,
        ignored,
      );
      if (!status) throw new Error("Failed to update preview item");
      return data;
    },
  });
};

export const useRunImport = () => {
  return useMutation({
    mutationFn: async ({
      id,
      configVersion,
    }: {
      id: number;
      configVersion: number;
    }) => {
      const { status, data } = await runImport(id, configVersion);
      if (!status) throw new Error("Failed to run import");
      return data;
    },
  });
};
