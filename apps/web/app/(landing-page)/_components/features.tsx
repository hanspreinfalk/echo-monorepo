import { Bot, ClipboardCheck, GitBranch, Layers, MessageSquare, Shield } from 'lucide-react'

const features = [
    {
        icon: Bot,
        title: 'AI that sounds like your team',
        description: 'Accurate, on-brand answers. Quietly spots bugs and feature requests worth tracking.',
    },
    {
        icon: MessageSquare,
        title: 'Embedded support widget',
        description: 'Help users without leaving your app. Every thread stays in one place.',
    },
    {
        icon: ClipboardCheck,
        title: 'Chat to product issues',
        description: 'Echo drafts structured issues from the thread. Your team reviews and accepts.',
    },
    {
        icon: Layers,
        title: 'Prioritized backlog',
        description: 'Severity, impact, and recurrence combined into a transparent ranking.',
    },
    {
        icon: GitBranch,
        title: 'One place to triage',
        description: 'Review, rank, and hand off work — with full conversation context.',
    },
    {
        icon: Shield,
        title: 'Automation with guardrails',
        description: 'Choose how much runs on autopilot. Your data stays under your control.',
    },
] as const

export default function FeaturesSection() {
    return (
        <section id="features" className="border-b border-border bg-muted/30 dark:bg-muted/10 py-16 md:py-24">
            <div className="mx-auto w-full max-w-5xl px-6">
                <div className="mb-12 max-w-xl">
                    <p className="text-xs font-semibold uppercase tracking-widest text-primary">Features</p>
                    <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                        Everything between "help" and "ship"
                    </h2>
                </div>

                <div className="grid gap-px sm:grid-cols-2 lg:grid-cols-3 rounded-2xl overflow-hidden border border-border">
                    {features.map(({ icon: Icon, title, description }) => (
                        <div
                            key={title}
                            className="flex flex-col gap-3 bg-background p-6 dark:bg-background">
                            <span className="flex size-9 items-center justify-center rounded-lg border border-border bg-muted text-foreground">
                                <Icon className="size-4" strokeWidth={1.5} aria-hidden />
                            </span>
                            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                            <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
