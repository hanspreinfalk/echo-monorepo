import { Button } from '@workspace/ui/components/button'
import Link from 'next/link'

export default function CallToAction() {
    return (
        <section className="bg-foreground py-16 md:py-24">
            <div className="mx-auto max-w-5xl px-6">
                <div className="text-center">
                    <h2 className="text-background text-balance text-4xl font-semibold tracking-tight md:text-5xl">
                        Turn support into a product engine
                    </h2>
                    <p className="text-background/60 mx-auto mt-4 max-w-xl text-pretty text-lg">
                        Give users fast answers, capture real issues with context, and feed engineering a backlog that reflects what is breaking or missing in the wild.
                    </p>

                    <div className="mt-10 flex flex-wrap justify-center gap-3">
                        <Button
                            asChild
                            size="lg"
                            className="bg-background text-foreground hover:bg-background/90 rounded-lg px-6 font-medium">
                            <Link href="/sign-up">
                                <span>Get started</span>
                            </Link>
                        </Button>

                        <Button
                            asChild
                            size="lg"
                            variant="outline"
                            className="border-background/20 text-background hover:bg-background/10 hover:text-background rounded-lg px-6 bg-transparent">
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
