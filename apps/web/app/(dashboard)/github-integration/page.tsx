import { PremiumFeatureOverlay } from "@/modules/billing/ui/components/premium-feature-overlay";
import { SubscriptionProtect } from "@/modules/billing/ui/components/subscription-protect";
import { GithubIntegrationView } from "@/modules/github-integration/ui/views/github-integration-view";

const Page = () => {
  return (
    <SubscriptionProtect
      fallback={
        <PremiumFeatureOverlay>
          <div className="h-svh overflow-hidden">
            <GithubIntegrationView />
          </div>
        </PremiumFeatureOverlay>
      }
    >
      <GithubIntegrationView />
    </SubscriptionProtect>
  );
};
 
export default Page;