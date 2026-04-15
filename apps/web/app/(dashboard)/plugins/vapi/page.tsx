import { PremiumFeatureOverlay } from "@/modules/billing/ui/components/premium-feature-overlay";
import { SubscriptionProtect } from "@/modules/billing/ui/components/subscription-protect";
import { VapiView } from "@/modules/plugins/ui/views/vapi-view";

const Page = () => {
  return (
    <SubscriptionProtect
      fallback={
        <PremiumFeatureOverlay>
          <VapiView />
        </PremiumFeatureOverlay>
      }
    >
      <VapiView />
    </SubscriptionProtect>
  );
};
 
export default Page;