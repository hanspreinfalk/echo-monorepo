import { Button } from '@workspace/ui/components/button'
import Link from 'next/link'

export default function CallToAction() {
    return (
        <section className="py-16">
            <div className="mx-auto max-w-5xl rounded-3xl border px-6 py-12 md:py-20 lg:py-32">
                <div className="text-center">
                    <h2 className="text-foreground text-balance text-5xl max-md:font-semibold md:font-normal">Start Today</h2>
                    <p className="mt-4">Get started with your AI customer support agent today.</p>

                    <div className="mt-12 flex flex-wrap justify-center gap-4">
                        <Button
                            asChild
                            size="lg">
                            <Link href="/">
                                <span>Get Started</span>
                            </Link>
                        </Button>

                        <Button
                            asChild
                            size="lg"
                            variant="outline">
                            <Link href="/">
                                <span>Book Demo</span>
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    )
}