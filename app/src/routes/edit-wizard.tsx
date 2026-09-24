import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/edit-wizard")({
  component: lazyRouteComponent(() => import("@/features/EditWizard/views")),
});
