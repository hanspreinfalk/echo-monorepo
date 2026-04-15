import { PremiumFeatureOverlay } from "@/modules/billing/ui/components/premium-feature-overlay";
import { SubscriptionProtect } from "@/modules/billing/ui/components/subscription-protect";
import { FilesView } from "@/modules/files/ui/views/files-view";

const Page = () => {
  return (
    <SubscriptionProtect
      fallback={
        <PremiumFeatureOverlay>
          <FilesView />
        </PremiumFeatureOverlay>
      }
    >
      <FilesView />
    </SubscriptionProtect>
  );
};
 
export default Page;