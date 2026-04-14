'use client'

import { PricingTable } from '@/modules/billing/ui/components/pricing-table'

export default function PricingSection() {
    return (
        <section
            id="pricing"
            className="border-b border-border bg-background py-16 md:py-24">
            <div className="mx-auto w-full max-w-5xl px-6">
                <div>
                    <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">Pricing</p>
                    <h2 className="text-foreground mt-3 text-balance text-4xl font-semibold tracking-tight md:text-5xl">Plans &amp; pricing</h2>
                    <p className="text-muted-foreground mb-8 mt-4 text-pretty text-lg">
                        Scale AI support and the product issues pipeline as your team grows, with the same flow from conversation to backlog.
                    </p>
                </div>

                <div className="mx-auto mt-8 w-full max-w-screen-md">
                    <PricingTable />
                </div>
            </div>
        </section>
    )
}
