import { Button } from '@workspace/ui/components/button'
import Link from 'next/link'

export default function CallToAction() {
    return (
        <section className="bg-background py-16 md:py-24">
            <div className="mx-auto max-w-5xl px-6">
                <div className="relative overflow-hidden rounded-3xl border border-border bg-muted/40 px-8 py-16 text-center dark:bg-muted/20 md:px-16 md:py-24">
                    {/* Radial glow top-center */}
                    <div
                        aria-hidden
                        className="pointer-events-none absolute inset-x-0 -top-24 mx-auto h-64 w-2/3 rounded-full bg-primary/20 blur-3xl dark:bg-primary/15"
                    />

                    <div className="relative">
                        <h2 className="text-balance text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
                            Turn support into a product engine
                        </h2>
                        <p className="mx-auto mt-4 max-w-sm text-pretty text-base text-muted-foreground">
                            Fast answers. Real issues. Prioritized backlog.
                        </p>

                        <div className="mt-8 flex flex-wrap justify-center gap-3">
                            <Button
                                asChild
                                size="lg"
                                className="rounded-lg px-6 font-medium">
                                <Link href="/sign-up">Get started</Link>
                            </Button>
                            <Button
                                asChild
                                size="lg"
                                variant="outline"
                                className="rounded-lg px-6">
                                <Link href="#faqs">Read FAQs</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
