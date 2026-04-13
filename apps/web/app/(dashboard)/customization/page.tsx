import { Protect } from "@clerk/nextjs";

import { PremiumFeatureOverlay } from "@/modules/billing/ui/components/premium-feature-overlay";
import { CustomizationView } from "@/modules/customization/ui/views/customization-view";

const Page = () => {
  return (
    <Protect
      condition={(has) => has({ plan: "pro" })}
      fallback={
        <PremiumFeatureOverlay>
          <div className="h-svh overflow-hidden">
            <CustomizationView />
          </div>
        </PremiumFeatureOverlay>
      }
    >
      <CustomizationView />
    </Protect>
  )
};
 
export default Page;