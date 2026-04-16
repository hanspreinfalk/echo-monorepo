import React from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { TextEffect } from '@workspace/ui/components/text-effect'
import { AnimatedGroup } from '@workspace/ui/components/animated-group'

const transitionVariants = {
    item: {
        hidden: {
            opacity: 0,
            filter: 'blur(12px)',
            y: 12,
        },
        visible: {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
            transition: {
                type: 'spring' as const,
                bounce: 0.3,
                duration: 1.5,
            },
        },
    },
}

export default function HeroSection() {
    return (
        <main className="overflow-hidden">
            {/* Dot grid */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10"
                style={{
                    backgroundImage: 'radial-gradient(var(--color-border) 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                    maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 80%)',
                }}
            />
            <section>
                <div className="relative pt-24 md:pt-36">
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
                            <AnimatedGroup variants={transitionVariants}>
                                <Link
                                    href="#solution"
                                    className="hover:bg-background dark:hover:border-t-border bg-muted group mx-auto flex w-fit items-center gap-4 rounded-full border p-1 pl-4 shadow-sm transition-colors duration-300 dark:border-t-white/5">
                                    <span className="text-foreground text-sm">Support becomes prioritized product work</span>
                                    <span className="dark:border-background block h-4 w-0.5 border-l bg-white dark:bg-zinc-700" />
                                    <div className="bg-background group-hover:bg-muted size-6 overflow-hidden rounded-full duration-500">
                                        <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                                            <span className="flex size-6">
                                                <ArrowRight className="m-auto size-3" />
                                            </span>
                                            <span className="flex size-6">
                                                <ArrowRight className="m-auto size-3" />
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            </AnimatedGroup>

                            <TextEffect
                                preset="fade-in-blur"
                                speedSegment={0.3}
                                as="h1"
                                className="mx-auto mt-8 max-w-4xl text-balance text-5xl font-semibold tracking-tight md:text-7xl lg:mt-16 xl:text-[5.25rem]">
                                Support that ships the right fixes
                            </TextEffect>
                            <TextEffect
                                per="line"
                                preset="fade-in-blur"
                                speedSegment={0.3}
                                delay={0.5}
                                as="p"
                                className="text-muted-foreground mx-auto mt-6 max-w-lg text-balance text-lg">
                                Resolve users. Capture issues. Ship what matters.
                            </TextEffect>

                            <AnimatedGroup
                                variants={{
                                    container: {
                                        visible: {
                                            transition: {
                                                staggerChildren: 0.05,
                                                delayChildren: 0.75,
                                            },
                                        },
                                    },
                                    ...transitionVariants,
                                }}
                                className="mt-10 flex flex-col items-center justify-center gap-3 md:flex-row">
                                <Button
                                    key={1}
                                    asChild
                                    size="lg"
                                    className="rounded-lg px-6 font-medium">
                                    <Link href="/sign-up">
                                        <span className="text-nowrap">Get started</span>
                                    </Link>
                                </Button>
                                <Button
                                    key={2}
                                    asChild
                                    size="lg"
                                    variant="outline"
                                    className="rounded-lg px-6">
                                    <Link href="#solution">
                                        <span className="text-nowrap">See how it works</span>
                                    </Link>
                                </Button>
                            </AnimatedGroup>
                        </div>
                    </div>

                    <AnimatedGroup
                        variants={{
                            container: {
                                visible: {
                                    transition: {
                                        staggerChildren: 0.05,
                                        delayChildren: 0.75,
                                    },
                                },
                            },
                            ...transitionVariants,
                        }}>
                        <div className="relative mt-12 w-full min-w-0 overflow-x-clip px-6 sm:mt-20 md:mt-28">
                            <div className="bg-background relative mx-auto w-full max-w-6xl min-w-0 overflow-hidden rounded-2xl border p-2 shadow-lg shadow-zinc-950/10 sm:p-4">
                                <div className="relative aspect-video w-full min-w-0 overflow-hidden rounded-xl sm:rounded-2xl">
                                    <iframe
                                        className="pointer-events-none absolute left-1/2 top-1/2 h-[118%] w-[118%] max-w-none -translate-x-1/2 -translate-y-1/2 border-0 sm:h-[125%] sm:w-[125%]"
                                        src="https://www.youtube.com/embed/EJPFV9kCeZ8?autoplay=1&mute=1&loop=1&playlist=EJPFV9kCeZ8&controls=0&showinfo=0&rel=0&vq=hd1080"
                                        title="Bryan demo"
                                        allow="autoplay; encrypted-media; fullscreen"
                                        allowFullScreen
                                    />
                                </div>
                            </div>
                        </div>
                    </AnimatedGroup>
                </div>
            </section>

            <section className="border-y border-border bg-background py-10 mt-16 md:mt-24">
                <div className="mx-auto max-w-5xl px-6">
                    <div className="grid gap-6 sm:grid-cols-3 sm:divide-x sm:divide-border">
                        <div className="flex items-center gap-3 sm:pr-8">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-muted">
                                <span className="text-xs font-bold text-foreground">1</span>
                            </div>
                            <p className="text-sm font-medium text-foreground">Instant answers in-app</p>
                        </div>
                        <div className="flex items-center gap-3 sm:px-8">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-muted">
                                <span className="text-xs font-bold text-foreground">2</span>
                            </div>
                            <p className="text-sm font-medium text-foreground">Issues with full context</p>
                        </div>
                        <div className="flex items-center gap-3 sm:pl-8">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-muted">
                                <span className="text-xs font-bold text-foreground">3</span>
                            </div>
                            <p className="text-sm font-medium text-foreground">Clear engineering priority</p>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    )
}
