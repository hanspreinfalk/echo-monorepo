import { PremiumFeatureOverlay } from "@/modules/billing/ui/components/premium-feature-overlay";
import { SubscriptionProtect } from "@/modules/billing/ui/components/subscription-protect";
import { GithubIntegrationView } from "@/modules/github-integration/ui/views/github-integration-view";

const Page = () => {
  return (
    <SubscriptionProtect
      fallback={
        <PremiumFeatureOverlay>
          <GithubIntegrationView />
        </PremiumFeatureOverlay>
      }
    >
      <GithubIntegrationView />
    </SubscriptionProtect>
  );
};
 
export default Page;