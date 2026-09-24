import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/pricing")({
  component: lazyRouteComponent(() => import("@/features/Pricing/views")),
});
