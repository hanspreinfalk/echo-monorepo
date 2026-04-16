import { Check, Image as ImageIcon } from 'lucide-react'

const sections = [
    {
        category: 'AI-Powered Support',
        title: 'Resolve users in the moment',
        description:
            'Your AI support agent handles questions inside your product, in real time. Users get accurate answers without leaving your app.',
        benefits: ['Proactive', 'Personalized', 'Always available'],
        reverse: false,
    },
    {
        category: 'Issue Capture',
        title: 'Turn conversations into structured work',
        description:
            'When something is truly broken, Bryan drafts clear product issues from the thread — with all the context your team needs to act.',
        benefits: ['Rich context preserved', 'No retyping required', 'Team-ready instantly'],
        reverse: true,
    },
    {
        category: 'Prioritization',
        title: 'Ship what matters most',
        description:
            'Severity, impact, and recurrence roll up into a ranked backlog so engineering always knows what to fix first.',
        benefits: ['Data-driven ranking', 'Transparent scoring', 'No more guessing'],
        reverse: false,
    },
]

function ImagePlaceholder({ alt }: { alt: string }) {
    return (
        <div
            aria-label={alt}
            className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-2xl border border-border bg-muted/30 dark:bg-muted/10">
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                    backgroundImage: 'radial-gradient(var(--color-border) 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                }}
            />
            <div className="relative flex flex-col items-center gap-2 text-muted-foreground/25">
                <ImageIcon className="size-12 stroke-[1]" />
            </div>
        </div>
    )
}

export default function SolutionSection() {
    return (
        <section id="solution" className="border-b border-border bg-background py-20 md:py-32">
            <div className="mx-auto max-w-6xl space-y-28 px-6 md:space-y-36">
                {sections.map((section) => (
                    <div
                        key={section.category}
                        className={`flex flex-col gap-10 md:flex-row md:items-center md:gap-20 ${section.reverse ? 'md:flex-row-reverse' : ''}`}>
                        {/* Image frame — takes 55% on desktop */}
                        <div className="w-full md:w-[55%]">
                            <ImagePlaceholder alt={section.title} />
                        </div>

                        {/* Text — takes 45% on desktop */}
                        <div className="w-full md:w-[45%]">
                            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                                {section.category}
                            </p>
                            <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-foreground md:text-[2.5rem] md:leading-tight">
                                {section.title}
                            </h2>
                            <p className="mt-5 text-pretty text-base leading-relaxed text-muted-foreground">
                                {section.description}
                            </p>

                            <ul className="mt-8 space-y-3">
                                {section.benefits.map((benefit) => (
                                    <li
                                        key={benefit}
                                        className="flex items-center gap-3 text-sm font-medium text-foreground">
                                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                                            <Check className="size-3 text-primary" strokeWidth={3} />
                                        </span>
                                        {benefit}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}
