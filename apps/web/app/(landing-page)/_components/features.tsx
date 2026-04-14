import { Card, CardContent } from '@workspace/ui/components/card'
import {
    Bot,
    ClipboardCheck,
    GitBranch,
    Layers,
    MessageSquare,
    Shield,
} from 'lucide-react'

const features = [
    {
        icon: Bot,
        title: 'AI that sounds like your team',
        description:
            'Trained on how your product works so users get accurate, on brand answers, while the system quietly spots bugs, gaps, and feature requests worth tracking.',
    },
    {
        icon: MessageSquare,
        title: 'Support through your embedded widget',
        description:
            'Drop the Echo chatbot into your product so users get help without leaving the app. Every thread stays in one place for answers and issue capture.',
    },
    {
        icon: ClipboardCheck,
        title: 'From chat to product issues',
        description:
            'When a problem is real, Echo drafts structured product issues with context from the thread. Your team reviews, edits, and accepts, so nothing lands on the backlog by surprise.',
    },
    {
        icon: Layers,
        title: 'Prioritized engineering work',
        description:
            'Combine severity, customer impact, recurrence, and strategic fit into a transparent ranking. Engineering sees what to fix first without another prioritization meeting.',
    },
    {
        icon: GitBranch,
        title: 'One place to triage and prioritize',
        description:
            'Accepted issues live in Echo where your team reviews, ranks, and hands off work with full context from the conversation. No duplicate trackers to keep in sync.',
    },
    {
        icon: Shield,
        title: 'Automation with guardrails',
        description:
            'You choose how much runs on autopilot: suggestions only, approve before sync, or fully automated for low risk categories. Customer data stays under your controls.',
    },
] as const

export default function FeaturesSection() {
    return (
        <section id="features" className="border-b border-border bg-background py-16 md:py-24">
            <div className="mx-auto w-full max-w-5xl px-6">
                <div className="max-w-2xl">
                    <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">Features</p>
                    <h2 className="text-foreground mt-3 text-balance text-4xl font-semibold tracking-tight md:text-5xl">
                        Everything between "help" and "ship"
                    </h2>
                    <p className="text-muted-foreground mb-12 mt-4 text-pretty text-lg">
                        Echo is customer support that does not stop at closing tickets. It makes sure real product problems become visible, owned, and ordered for the people who build the product.
                    </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {features.map(({ icon: Icon, title, description }) => (
                        <Card
                            key={title}
                            className="flex flex-col p-0 shadow-none">
                            <CardContent className="flex flex-col p-5">
                                <span className="border border-border bg-muted text-foreground mb-4 flex size-9 items-center justify-center rounded-lg">
                                    <Icon className="size-4" strokeWidth={1.5} aria-hidden />
                                </span>
                                <h3 className="text-foreground text-sm font-semibold">{title}</h3>
                                <p className="text-muted-foreground mt-2 flex-1 text-pretty text-sm leading-relaxed">{description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}
