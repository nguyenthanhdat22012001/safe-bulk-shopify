import NpsBanner from "@/components/feedback/NpsBanner";
import PaywallModal, {
  type TPaywallVariant,
} from "@/components/pricing/PaywallModal";
import { ID_MODAL_SHOPIFY } from "@/constants/constantUnique";
import CancelConfirmModal from "@/features/Dashboard/components/CancelConfirmModal";
import DashboardBanners from "@/features/Dashboard/components/DashboardBanners";
import FooterInfoBanner from "@/features/Dashboard/components/FooterInfoBanner";
import HistoryTable from "@/features/Dashboard/components/HistoryTable";
import OnboardingChecklistCard from "@/features/Dashboard/components/OnboardingChecklistCard";
import { useShopStore } from "@/stores/shopStore";
import type {
  ITaskRunListResource,
  TUndoLockedReason,
} from "@/types/editWizard";
import { useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

function DashboardView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const shopInfo = useShopStore((state) => state.shopInfo);

  const [paywallVariant, setPaywallVariant] =
    useState<TPaywallVariant>("product_limit");
  const [cancelRun, setCancelRun] = useState<ITaskRunListResource | null>(null);
  const [cancellingIds, setCancellingIds] = useState<Set<number>>(new Set());
  const [isNpsDismissed, setIsNpsDismissed] = useState(false);

  const historyTableRef = useRef<HTMLDivElement>(null);

  const scrollToHistoryTable = () => {
    historyTableRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const goToWizard = () => navigate({ to: "/edit-wizard" });

  const openPaywall = (variant: TPaywallVariant) => {
    setPaywallVariant(variant);
    shopify.modal.show(ID_MODAL_SHOPIFY.pricing.modalPaywall);
  };

  const handleTrialQuotaExhausted = () => openPaywall("trial_exhausted");

  const handleUndoLockedClick = (
    _run: ITaskRunListResource,
    reason: NonNullable<TUndoLockedReason>,
  ) => {
    if (
      reason === "UNDO_WINDOW_EXPIRED" &&
      shopInfo.app_plan !== "professional"
    ) {
      openPaywall("undo_expired");
    }
    // JOB_ALREADY_UNDONE / JOB_FAILED / JOB_IN_PROGRESS: tooltip on the button already
    // communicates this (see HistoryTable) — no further action.
  };

  const handleCancelClick = (run: ITaskRunListResource) => {
    setCancelRun(run);
    shopify.modal.show(ID_MODAL_SHOPIFY.dashboard.modalCancelConfirm);
  };

  const handleCancelled = (id: number) => {
    setCancellingIds((prev) => new Set(prev).add(id));
  };

  const handleCancellingResolved = (ids: number[]) => {
    setCancellingIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    });
  };

  const handleCsvClick = (mode: "import" | "export") => {
    navigate({ to: "/csv", search: { mode } });
  };

  return (
    <s-page heading={t("dashboard.title")}>
      <s-button slot="primary-action" onClick={goToWizard}>
        {t("dashboard.button_create_bulk_edit")}
      </s-button>
      <s-button
        slot="secondary-actions"
        onClick={() => handleCsvClick("import")}
      >
        {t("dashboard.button_import_export_csv")}
      </s-button>

      <div className="flex flex-col gap-6">
        <OnboardingChecklistCard onUndoTaskClick={scrollToHistoryTable} />

        <DashboardBanners
          trialSubscription={shopInfo}
          onTrialQuotaExhausted={handleTrialQuotaExhausted}
        />

        {!isNpsDismissed && (
          <NpsBanner onCompleted={() => setIsNpsDismissed(true)} />
        )}

        <FooterInfoBanner />

        <div ref={historyTableRef} className="flex flex-col gap-2">
          <HistoryTable
            onCreateClick={goToWizard}
            onUndoLockedClick={handleUndoLockedClick}
            onCancelClick={handleCancelClick}
            cancellingIds={cancellingIds}
            onCancellingResolved={handleCancellingResolved}
          />
        </div>
      </div>

      <CancelConfirmModal run={cancelRun} onCancelled={handleCancelled} />
      <PaywallModal variant={paywallVariant} pathReturn="/" />
    </s-page>
  );
}

export default DashboardView;
