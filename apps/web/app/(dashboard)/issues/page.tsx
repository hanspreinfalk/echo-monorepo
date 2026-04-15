import { PremiumFeatureOverlay } from "@/modules/billing/ui/components/premium-feature-overlay";
import { SubscriptionProtect } from "@/modules/billing/ui/components/subscription-protect";
import { IssuesView } from "@/modules/issues/ui/views/issues-view";

const Page = () => {
  return (
    <SubscriptionProtect
      fallback={
        <PremiumFeatureOverlay>
          <IssuesView />
        </PremiumFeatureOverlay>
      }
    >
      <IssuesView />
    </SubscriptionProtect>
  );
};

export default Page;
