import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/history/$id")({
  component: lazyRouteComponent(
    () => import("@/features/Dashboard/views/HistoryDetail"),
  ),
});
