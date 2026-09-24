import { useTranslation } from "react-i18next";

const SkeletonBar = ({ className = "" }: { className?: string }) => (
  <div className={`rounded bg-gray-200 animate-pulse ${className}`} />
);

const SkeletonField = ({ valueWidth }: { valueWidth: string }) => (
  <s-stack direction="block" gap="small-100">
    <SkeletonBar className="h-3 w-20" />
    <SkeletonBar className={`h-4 ${valueWidth}`} />
  </s-stack>
);

const SkeletonItemCard = () => (
  <s-box
    padding="small-300"
    borderWidth="base"
    borderColor="subdued"
    borderRadius="base"
  >
    <s-stack direction="block" gap="small-200">
      <s-stack direction="inline" gap="small-200" alignItems="center">
        <SkeletonBar className="h-5 w-20" />
        <SkeletonBar className="h-4 w-40" />
      </s-stack>
      <SkeletonBar className="h-4 w-56" />
    </s-stack>
  </s-box>
);

const HistoryDetailSkeleton = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <span className="sr-only">{t("common.loading")}</span>

      <s-section>
        <SkeletonBar className="h-4 w-48 mb-4" />
        <s-grid gridTemplateColumns="1fr 1fr" gap="base">
          <SkeletonField valueWidth="w-16" />
          <SkeletonField valueWidth="w-32" />
          <SkeletonField valueWidth="w-24" />
          <SkeletonField valueWidth="w-40" />
          <SkeletonField valueWidth="w-12" />
          <SkeletonField valueWidth="w-28" />
          <SkeletonField valueWidth="w-28" />
          <SkeletonField valueWidth="w-24" />
        </s-grid>
      </s-section>

      <s-section>
        <SkeletonBar className="h-4 w-36 mb-4" />
        <s-stack direction="block" gap="large">
          <s-stack direction="inline" gap="small-200">
            <SkeletonBar className="h-8 w-24 rounded-full" />
            <SkeletonBar className="h-8 w-24 rounded-full" />
          </s-stack>
          <s-stack direction="block" gap="small-200">
            <SkeletonItemCard />
            <SkeletonItemCard />
            <SkeletonItemCard />
          </s-stack>
        </s-stack>
      </s-section>
    </div>
  );
};

export default HistoryDetailSkeleton;
