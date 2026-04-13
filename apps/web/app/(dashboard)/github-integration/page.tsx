import { Protect } from "@clerk/nextjs";

import { PremiumFeatureOverlay } from "@/modules/billing/ui/components/premium-feature-overlay";
import { GithubIntegrationView } from "@/modules/github-integration/ui/views/github-integration-view";

const Page = () => {
  return (
    <Protect
      condition={(has) => has({ plan: "pro" })}
      fallback={
        <PremiumFeatureOverlay>
          <GithubIntegrationView />
        </PremiumFeatureOverlay>
      }
    >
      <GithubIntegrationView />
    </Protect>
  );
};
 
export default Page;