import { createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { initReactI18next } from "react-i18next";
import { initI18n, localResourcesToBackend } from "./utils/i18n.ts";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Import the web vitals tracking function
// import { processWebVitals } from "./utils/trackingWebVital.ts";

// if (shopify?.webVitals?.onReport) {
//   shopify?.webVitals?.onReport(processWebVitals);
// }

initI18n([
  initReactI18next, // bắt buộc phải có nếu dùng hook useTranslation
  localResourcesToBackend(), // backend load từ API
]);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      // retry: false,
    },
  },
});

// Create a new router instance
const router = createRouter({
  routeTree,
  context: {
    queryClient,
  },
  defaultPreload: "intent",
  // Since we're using React Query, we don't want loader calls to ever be stale
  // This will ensure that the loader is always called when the route is preloaded or visited
  defaultPreloadStaleTime: 0,
  scrollRestoration: true,
});

// Render the app
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <Suspense
        fallback={
          <s-spinner accessibilityLabel="Loading" size="large-100"></s-spinner>
        }
      >
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </Suspense>
    </StrictMode>,
  );
}
