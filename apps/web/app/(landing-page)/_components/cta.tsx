import { Button } from '@workspace/ui/components/button'
import Link from 'next/link'

export default function CallToAction() {
    return (
        <section className="py-16">
            <div className="mx-auto max-w-5xl rounded-3xl border px-6 py-12 md:py-20 lg:py-32">
                <div className="text-center">
                    <h2 className="text-foreground text-balance text-5xl max-md:font-semibold md:font-normal">Turn support into a product engine</h2>
                    <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-pretty">
                        Give users fast answers, capture real issues with context, and feed engineering a backlog that reflects what is breaking or missing in the wild.
                    </p>

                    <div className="mt-12 flex flex-wrap justify-center gap-4">
                        <Button
                            asChild
                            size="lg">
                            <Link href="/sign-up">
                                <span>Get started</span>
                            </Link>
                        </Button>

                        <Button
                            asChild
                            size="lg"
                            variant="outline">
                            <Link href="#faqs">
                                <span>Read FAQs</span>
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    )
}