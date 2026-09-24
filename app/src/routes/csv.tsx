import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export interface ICsvSearch {
  mode: "import" | "export";
  taskRunId?: number;
}

const parseTaskRunId = (value: unknown): number | undefined => {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value !== "" && !Number.isNaN(Number(value))) {
    return Number(value);
  }
  return undefined;
};

export const Route = createFileRoute("/csv")({
  validateSearch: (search: Record<string, unknown>): ICsvSearch => ({
    mode: search.mode === "export" ? "export" : "import",
    taskRunId: parseTaskRunId(search.taskRunId),
  }),
  component: lazyRouteComponent(
    () => import("@/features/CsvImportExport/views"),
  ),
});
