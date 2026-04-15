import { PremiumFeatureOverlay } from "@/modules/billing/ui/components/premium-feature-overlay";
import { SubscriptionProtect } from "@/modules/billing/ui/components/subscription-protect";
import { CustomToolsView } from "@/modules/custom-tools/ui/views/custom-tools-view";

const Page = () => {
  return (
    <SubscriptionProtect
      fallback={
        <PremiumFeatureOverlay>
          <CustomToolsView />
        </PremiumFeatureOverlay>
      }
    >
      <CustomToolsView />
    </SubscriptionProtect>
  );
};

export default Page;
