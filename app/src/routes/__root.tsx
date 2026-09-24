import ApplyCompletionWatcher from "@/components/feedback/ApplyCompletionWatcher";
import FeedbackFAB from "@/components/feedback/FeedbackFAB";
import FeedbackPanel from "@/components/feedback/FeedbackPanel";
import I18nPolarisProvider from "@/components/providers/i18nPolarisProvider";
import AuthShop from "@/middleware/AuthShop";
import { createRootRoute, Outlet } from "@tanstack/react-router";

// eslint-disable-next-line react-refresh/only-export-components
const Component = () => (
  <AuthShop>
    <I18nPolarisProvider>
      <s-app-nav>
        <s-link href="/edit-wizard">Edit Wizard</s-link>
        <s-link href="/csv">Import/Export CSV</s-link>
        <s-link href="/pricing">Pricing</s-link>
      </s-app-nav>
      <div className="mb-6">
        <Outlet />
      </div>
      <ApplyCompletionWatcher />
      <FeedbackFAB />
      <FeedbackPanel />
    </I18nPolarisProvider>
  </AuthShop>
);

export const Route = createRootRoute({ component: Component });
