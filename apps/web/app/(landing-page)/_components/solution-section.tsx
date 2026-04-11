import { ArrowRight, ListOrdered, MessageSquareText, Ticket } from 'lucide-react'

const steps = [
    {
        icon: MessageSquareText,
        title: 'Embed the widget where your product lives',
        description:
            'Users chat with your AI support agent inside the Echo widget on your app or site, so issues are captured in the product context, not lost in email or side threads.',
    },
    {
        icon: ArrowRight,
        title: 'Resolve problems in the conversation',
        description:
            'Answer questions, troubleshoot, and clarify expectations in real time. When something is truly wrong with the product, the thread already has the context engineers need.',
    },
    {
        icon: Ticket,
        title: 'Open structured product issues',
        description:
            'Turn messy reports into clear product issues: titles, descriptions, and labels your team can triage, without retyping or losing nuance from the original conversation.',
    },
    {
        icon: ListOrdered,
        title: 'Prioritize what engineering ships next',
        description:
            'Signals from the conversation, including severity, customer impact, and how often themes show up, roll up into a ranked view so your backlog reflects what matters most to users.',
    },
] as const

export default function SolutionSection() {
    return (
        <section
            id="solution"
            className="border-border/60 border-y bg-background py-16 md:py-24">
            <div className="mx-auto max-w-5xl px-6">
                <div className="max-w-2xl">
                    <p className="text-primary text-sm font-medium tracking-wide uppercase">How it works</p>
                    <h2 className="text-foreground mt-3 text-balance text-4xl max-md:font-semibold md:text-5xl md:font-normal">
                        Support, product issues, and engineering priorities in one flow
                    </h2>
                    <p className="text-muted-foreground mt-4 text-pretty text-lg">
                        Echo closes the gap between what users say in support and what your team actually builds, so every serious problem becomes traceable, prioritized work.
                    </p>
                </div>

                <ol className="mt-14 grid gap-10 md:grid-cols-2 md:gap-x-12 md:gap-y-12">
                    {steps.map((step, index) => {
                        const Icon = step.icon
                        return (
                            <li
                                key={step.title}
                                className="flex gap-5">
                                <span className="text-muted-foreground bg-muted flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold tabular-nums">
                                    {index + 1}
                                </span>
                                <div>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-lg">
                                            <Icon className="size-4" strokeWidth={2} aria-hidden />
                                        </span>
                                        <h3 className="text-foreground text-lg font-semibold">{step.title}</h3>
                                    </div>
                                    <p className="text-muted-foreground mt-3 text-pretty leading-relaxed">{step.description}</p>
                                </div>
                            </li>
                        )
                    })}
                </ol>
            </div>
        </section>
    )
}
