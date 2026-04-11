import { Protect } from "@clerk/nextjs";

import { PremiumFeatureOverlay } from "@/modules/billing/ui/components/premium-feature-overlay";
import { CustomToolsView } from "@/modules/custom-tools/ui/views/custom-tools-view";

const Page = () => {
  return (
    <Protect
      condition={(has) => has({ plan: "pro" })}
      fallback={
        <PremiumFeatureOverlay>
          <CustomToolsView />
        </PremiumFeatureOverlay>
      }
    >
      <CustomToolsView />
    </Protect>
  );
};

export default Page;
