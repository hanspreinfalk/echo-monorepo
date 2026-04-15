import { PremiumFeatureOverlay } from "@/modules/billing/ui/components/premium-feature-overlay";
import { SubscriptionProtect } from "@/modules/billing/ui/components/subscription-protect";
import { CustomizationView } from "@/modules/customization/ui/views/customization-view";

const Page = () => {
  return (
    <SubscriptionProtect
      fallback={
        <PremiumFeatureOverlay>
          <div className="h-svh overflow-hidden">
            <CustomizationView />
          </div>
        </PremiumFeatureOverlay>
      }
    >
      <CustomizationView />
    </SubscriptionProtect>
  )
};
 
export default Page;