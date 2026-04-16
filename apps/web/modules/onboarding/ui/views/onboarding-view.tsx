'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from 'convex/react'
import { api } from '@workspace/backend/_generated/api'
import { Button } from '@workspace/ui/components/button'
import {
    MessageSquareIcon,
    BookOpenIcon,
    BugIcon,
    PaletteIcon,
    PlugZapIcon,
    GithubIcon,
    WrenchIcon,
    SparklesIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    CheckIcon,
    XIcon,
} from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'

interface OnboardingStep {
    id: string
    icon: React.ReactNode
    accentColor: string
    title: string
    subtitle: string
    description: string
    bullets: string[]
}

const STEPS: OnboardingStep[] = [
    {
        id: 'welcome',
        icon: <SparklesIcon className="size-12" />,
        accentColor: 'from-violet-500 to-indigo-600',
        title: 'Welcome to Bryan',
        subtitle: 'Your AI-powered customer support platform',
        description:
            'Bryan brings together intelligent conversations, a powerful knowledge base, automated issue tracking, and seamless integrations — all in one place.',
        bullets: [
            'AI that learns from your docs and conversations',
            'Automatic bug detection and GitHub-powered fixes',
            'Fully customizable widget for your product',
        ],
    },
    {
        id: 'conversations',
        icon: <MessageSquareIcon className="size-12" />,
        accentColor: 'from-sky-500 to-blue-600',
        title: 'Conversations',
        subtitle: 'Manage every customer interaction',
        description:
            'The Conversations page is your live inbox. Every chat your widget captures lands here, giving you full context about the customer and their session.',
        bullets: [
            'See all open, escalated, and resolved chats',
            'Jump into any conversation and reply in real time',
            'AI automatically handles routine questions for you',
        ],
    },
    {
        id: 'knowledge-base',
        icon: <BookOpenIcon className="size-12" />,
        accentColor: 'from-emerald-500 to-teal-600',
        title: 'Knowledge Base',
        subtitle: 'Teach Bryan everything about your product',
        description:
            'Upload PDFs, docs, or plain text files to give the AI deep knowledge about your product. The more context you provide, the smarter Bryan becomes.',
        bullets: [
            'Upload any file type — PDFs, Markdown, text, and more',
            'Files are automatically chunked and indexed for retrieval',
            'Update docs at any time; Bryan learns instantly',
        ],
    },
    {
        id: 'issues',
        icon: <BugIcon className="size-12" />,
        accentColor: 'from-rose-500 to-red-600',
        title: 'Product Issues',
        subtitle: 'Automatically surface and track bugs',
        description:
            'Bryan listens to customer conversations and detects recurring problems, errors, and feature requests — turning feedback into actionable issues.',
        bullets: [
            'Issues are auto-created from conversation patterns',
            'Categorized by severity: Critical, High, Medium, Low',
            'Attach console logs, screenshots, and repro steps',
        ],
    },
    {
        id: 'customization',
        icon: <PaletteIcon className="size-12" />,
        accentColor: 'from-pink-500 to-fuchsia-600',
        title: 'Widget Customization',
        subtitle: 'Make the chat widget truly yours',
        description:
            'Customize every aspect of the support widget — colors, branding, greeting messages, and suggested prompts — so it feels native to your product.',
        bullets: [
            'Set primary colors, gradients, and backgrounds',
            'Upload your logo and set a personalized greeting',
            'Configure quick-reply suggestions for common questions',
        ],
    },
    {
        id: 'integrations',
        icon: <PlugZapIcon className="size-12" />,
        accentColor: 'from-orange-500 to-amber-600',
        title: 'Integrations',
        subtitle: 'Connect the tools you already use',
        description:
            'Extend Bryan with the services your team relies on. Integrations let Bryan pull in external data and trigger actions across your stack.',
        bullets: [
            'Connect to Supabase, Convex, Vercel, and more',
            'Enable MCPs to give the AI access to your services',
            'Integrations power automated fixes and richer context',
        ],
    },
    {
        id: 'github',
        icon: <GithubIcon className="size-12" />,
        accentColor: 'from-slate-600 to-gray-800',
        title: 'GitHub Integration',
        subtitle: 'Ship fixes straight from a bug report',
        description:
            'Connect your GitHub repository and let Bryan dispatch automated fix workflows directly from product issues — no manual handoff required.',
        bullets: [
            'Link a repo and select your default branch',
            'Trigger CI workflows from any product issue',
            'Auto-merge PRs when tests pass (optional)',
        ],
    },
    {
        id: 'custom-tools',
        icon: <WrenchIcon className="size-12" />,
        accentColor: 'from-cyan-500 to-blue-600',
        title: 'Custom Tools',
        subtitle: 'Extend Bryan with your own APIs',
        description:
            'Define custom HTTP tools that Bryan can call during a conversation. Query your database, trigger workflows, or fetch live data — Bryan decides when to use them.',
        bullets: [
            'Register any REST endpoint as an AI tool',
            'Define arguments, types, and descriptions',
            'Bryan invokes tools automatically based on context',
        ],
    },
    {
        id: 'done',
        icon: <CheckIcon className="size-12" />,
        accentColor: 'from-violet-500 to-indigo-600',
        title: "You're all set!",
        subtitle: 'Start building with Bryan today',
        description:
            "That's the full tour. Head to the dashboard and start setting up Bryan for your product. Upload your docs, customize your widget, and deploy your first conversation.",
        bullets: [
            'Upload docs to the Knowledge Base first',
            'Customize your widget to match your brand',
            'Embed the widget and watch conversations roll in',
        ],
    },
]

export function OnboardingView() {
    const router = useRouter()
    const completeOnboarding = useMutation(api.users.completeOnboarding)
    const [currentStep, setCurrentStep] = useState(0)
    const [completing, setCompleting] = useState(false)

    const step = STEPS[currentStep]!
    const isFirst = currentStep === 0
    const isLast = currentStep === STEPS.length - 1
    const progress = ((currentStep + 1) / STEPS.length) * 100

    async function handleFinish() {
        setCompleting(true)
        await completeOnboarding()
        router.push('/conversations')
    }

    async function handleSkip() {
        setCompleting(true)
        await completeOnboarding()
        router.push('/conversations')
    }

    return (
        <div className="flex min-h-screen flex-col bg-background">
            {/* Top bar */}
            <div className="flex items-center justify-between border-b px-6 py-3">
                <span className="text-sm font-medium text-muted-foreground">
                    Step {currentStep + 1} of {STEPS.length}
                </span>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSkip}
                    disabled={completing}
                    className="gap-1.5 text-muted-foreground hover:text-foreground"
                >
                    <XIcon className="size-3.5" />
                    Skip onboarding
                </Button>
            </div>

            {/* Progress bar */}
            <div className="h-0.5 w-full bg-muted">
                <div
                    className="h-full bg-primary transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Split layout */}
            <div className="flex flex-1 flex-col lg:flex-row">
                {/* Mobile image placeholder — sits above text on small screens */}
                <div
                    className={cn(
                        'relative flex h-44 w-full shrink-0 items-center justify-center bg-gradient-to-br text-white lg:hidden',
                        step.accentColor,
                    )}
                >
                    <div className="flex flex-col items-center gap-2 opacity-90">
                        {step.icon}
                        <span className="text-xs font-medium tracking-wide opacity-75">
                            {step.subtitle}
                        </span>
                    </div>
                    <div className="absolute right-8 top-4 size-20 rounded-full bg-white/10 blur-2xl" />
                    <div className="absolute bottom-4 left-8 size-14 rounded-full bg-white/10 blur-xl" />
                </div>

                {/* Left — text */}
                <div className="flex flex-1 flex-col justify-center px-5 py-8 sm:px-8 sm:py-10 lg:px-16 lg:py-16">
                    <div className="mx-auto w-full max-w-lg">
                        {/* Step label */}
                        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground lg:mb-3">
                            {step.subtitle}
                        </p>

                        <h1 className="mb-3 text-2xl font-bold tracking-tight sm:text-3xl lg:mb-4 lg:text-4xl">
                            {step.title}
                        </h1>
                        <p className="mb-5 text-sm leading-relaxed text-muted-foreground sm:text-base lg:mb-6">
                            {step.description}
                        </p>

                        <ul className="mb-8 space-y-2.5 lg:mb-10 lg:space-y-3">
                            {step.bullets.map((bullet) => (
                                <li key={bullet} className="flex items-start gap-3">
                                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                                        <CheckIcon className="size-3 text-primary" />
                                    </span>
                                    <span className="text-sm text-foreground">{bullet}</span>
                                </li>
                            ))}
                        </ul>

                        {/* Navigation */}
                        <div className="flex items-center justify-between gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentStep((s) => s - 1)}
                                disabled={isFirst || completing}
                                className="gap-1 lg:gap-1.5"
                            >
                                <ChevronLeftIcon className="size-4" />
                                <span className="hidden sm:inline">Back</span>
                            </Button>

                            {/* Dot indicators */}
                            <div className="flex items-center gap-1 lg:gap-1.5">
                                {STEPS.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentStep(i)}
                                        disabled={completing}
                                        className={cn(
                                            'h-1.5 rounded-full transition-all duration-200 lg:h-2',
                                            i === currentStep
                                                ? 'w-4 bg-primary lg:w-5'
                                                : 'w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50 lg:w-2',
                                        )}
                                        aria-label={`Go to step ${i + 1}`}
                                    />
                                ))}
                            </div>

                            {isLast ? (
                                <Button
                                    size="sm"
                                    onClick={handleFinish}
                                    disabled={completing}
                                    className="gap-1 lg:gap-1.5"
                                >
                                    Get started
                                    <CheckIcon className="size-4" />
                                </Button>
                            ) : (
                                <Button
                                    size="sm"
                                    onClick={() => setCurrentStep((s) => s + 1)}
                                    disabled={completing}
                                    className="gap-1 lg:gap-1.5"
                                >
                                    <span className="hidden sm:inline">Next</span>
                                    <ChevronRightIcon className="size-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right — image placeholder (desktop only) */}
                <div className="hidden lg:flex lg:w-1/2 lg:shrink-0">
                    <div
                        className={cn(
                            'relative flex w-full items-center justify-center bg-gradient-to-br text-white',
                            step.accentColor,
                        )}
                    >
                        <div className="flex flex-col items-center gap-4 opacity-90">
                            {step.icon}
                            <span className="text-base font-medium tracking-wide opacity-75">
                                {step.subtitle}
                            </span>
                        </div>
                        {/* Decorative blobs */}
                        <div className="absolute right-12 top-12 size-48 rounded-full bg-white/10 blur-3xl" />
                        <div className="absolute bottom-12 left-12 size-32 rounded-full bg-white/10 blur-2xl" />
                        <div className="absolute left-1/2 top-1/2 size-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-3xl" />
                    </div>
                </div>
            </div>
        </div>
    )
}
