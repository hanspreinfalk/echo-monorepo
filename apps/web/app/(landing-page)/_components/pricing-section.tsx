'use client'

import { PricingTable } from '@/modules/billing/ui/components/pricing-table'

export default function PricingSection() {
    return (
        <section
            id="pricing"
            className="py-16 md:py-24">
            <div className="mx-auto w-full max-w-5xl px-6">
                <div>
                    <h2 className="text-foreground text-balance text-5xl max-md:font-semibold md:font-normal">Plans &amp; pricing</h2>
                    <p className="text-muted-foreground mb-8 mt-4 text-balance text-lg">Choose the plan that&apos;s right for you</p>
                </div>

                <div className="mx-auto mt-8 w-full max-w-screen-md">
                    <PricingTable />
                </div>
            </div>
        </section>
    )
}
