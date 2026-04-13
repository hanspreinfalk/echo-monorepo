import { Protect } from "@clerk/nextjs";

import { PremiumFeatureOverlay } from "@/modules/billing/ui/components/premium-feature-overlay";
import { IssuesView } from "@/modules/issues/ui/views/issues-view";

const Page = () => {
  return (
    <Protect
      condition={(has) => has({ plan: "pro" })}
      fallback={
        <PremiumFeatureOverlay>
          <IssuesView />
        </PremiumFeatureOverlay>
      }
    >
      <IssuesView />
    </Protect>
  );
};

export default Page;
