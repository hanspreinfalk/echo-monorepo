'use client'

import { useState, useCallback } from 'react'
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
    SendIcon,
    FileTextIcon,
    FileIcon,
    AlertCircleIcon,
    ArrowRightIcon,
    UploadIcon,
    ImageIcon,
    CodeIcon,
    GitPullRequestIcon,
    RocketIcon,
    PaperclipIcon,
    CameraIcon,
    SearchIcon,
    MoreHorizontalIcon,
    CirclePlayIcon,
    ZapIcon,
    TerminalIcon,
    GlobeIcon,
    SettingsIcon,
    ShieldCheckIcon,
    DatabaseIcon,
    ArrowUpIcon,
} from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'

// ---------------------------------------------------------------------------
// Step illustrations – mini mockups of the real product UI
// ---------------------------------------------------------------------------

function WelcomeIllustration() {
    return (
        <div className="relative flex h-full w-full items-center justify-center overflow-hidden p-5">
            {/* Background mock website */}
            <div className="relative w-full max-w-md">
                {/* Browser chrome */}
                <div className="rounded-t-xl border border-white/20 bg-white/10 px-3 py-2 backdrop-blur-sm">
                    <div className="flex items-center gap-1.5">
                        <div className="size-2 rounded-full bg-red-400/60" />
                        <div className="size-2 rounded-full bg-yellow-400/60" />
                        <div className="size-2 rounded-full bg-green-400/60" />
                        <div className="ml-4 flex h-5 flex-1 items-center rounded-md bg-white/10 px-2">
                            <GlobeIcon className="mr-1.5 size-2.5 opacity-40" />
                            <span className="text-[7px] opacity-40">yourapp.com</span>
                        </div>
                    </div>
                </div>
                {/* Page content — realistic skeleton */}
                <div className="relative rounded-b-xl border border-t-0 border-white/20 bg-white/[0.07] p-5">
                    {/* Nav bar */}
                    <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="size-4 rounded bg-white/20" />
                            <div className="h-2 w-12 rounded bg-white/15" />
                        </div>
                        <div className="flex gap-3">
                            <div className="h-2 w-8 rounded bg-white/10" />
                            <div className="h-2 w-8 rounded bg-white/10" />
                            <div className="h-2 w-8 rounded bg-white/10" />
                        </div>
                    </div>
                    {/* Hero section */}
                    <div className="mb-3 h-4 w-4/5 rounded bg-white/15" />
                    <div className="mb-2 h-2 w-full rounded bg-white/10" />
                    <div className="mb-2 h-2 w-5/6 rounded bg-white/10" />
                    <div className="mb-4 h-2 w-2/3 rounded bg-white/10" />
                    <div className="flex gap-2">
                        <div className="h-6 w-20 rounded-md bg-white/20" />
                        <div className="h-6 w-16 rounded-md bg-white/10" />
                    </div>
                    {/* Cards row */}
                    <div className="mt-4 flex gap-2">
                        <div className="flex-1 rounded-lg border border-white/10 bg-white/5 p-2">
                            <div className="mb-1.5 size-3 rounded bg-white/15" />
                            <div className="mb-1 h-1.5 w-3/4 rounded bg-white/10" />
                            <div className="h-1.5 w-1/2 rounded bg-white/8" />
                        </div>
                        <div className="flex-1 rounded-lg border border-white/10 bg-white/5 p-2">
                            <div className="mb-1.5 size-3 rounded bg-white/15" />
                            <div className="mb-1 h-1.5 w-3/4 rounded bg-white/10" />
                            <div className="h-1.5 w-1/2 rounded bg-white/8" />
                        </div>
                    </div>

                    {/* The Bryan widget — floating over the page */}
                    <div className="absolute -bottom-4 -right-4 w-[210px] animate-float">
                        <div className="overflow-hidden rounded-2xl border border-white/30 bg-white/20 shadow-2xl shadow-black/20 backdrop-blur-md">
                            {/* Widget header with gradient */}
                            <div className="bg-gradient-to-r from-violet-400 to-indigo-500 px-3 py-2.5">
                                <div className="flex items-center gap-2">
                                    <div className="flex size-6 items-center justify-center rounded-full bg-white/25">
                                        <SparklesIcon className="size-3.5" />
                                    </div>
                                    <div>
                                        <span className="block text-[9px] font-bold leading-tight">Bryan</span>
                                        <span className="block text-[7px] opacity-70">Always online</span>
                                    </div>
                                </div>
                            </div>
                            {/* Chat messages */}
                            <div className="space-y-2 bg-gradient-to-b from-white/5 to-transparent p-2.5">
                                {/* Bot message */}
                                <div className="flex gap-1.5">
                                    <div className="mt-0.5 size-4 shrink-0 rounded-full bg-violet-400/40" />
                                    <div className="rounded-xl rounded-tl-sm bg-white/15 px-2.5 py-1.5">
                                        <p className="text-[8px] leading-[1.4] opacity-90">
                                            Hi there! How can I help you today?
                                        </p>
                                    </div>
                                </div>
                                {/* Suggestion chips */}
                                <div className="ml-5 flex flex-wrap gap-1">
                                    <span className="rounded-full border border-white/20 bg-white/5 px-2 py-0.5 text-[6px]">Pricing plans</span>
                                    <span className="rounded-full border border-white/20 bg-white/5 px-2 py-0.5 text-[6px]">Get started</span>
                                </div>
                                {/* User message */}
                                <div className="flex justify-end">
                                    <div className="rounded-xl rounded-tr-sm bg-gradient-to-r from-violet-500/40 to-indigo-500/40 px-2.5 py-1.5">
                                        <p className="text-[8px] leading-[1.4] opacity-95">
                                            I have a question about pricing
                                        </p>
                                    </div>
                                </div>
                                {/* Bot typing */}
                                <div className="flex gap-1.5">
                                    <div className="mt-0.5 size-4 shrink-0 rounded-full bg-violet-400/40" />
                                    <div className="rounded-xl rounded-tl-sm bg-white/15 px-3 py-2">
                                        <div className="flex gap-1">
                                            <div className="size-1 animate-pulse rounded-full bg-white/60" style={{ animationDelay: '0ms' }} />
                                            <div className="size-1 animate-pulse rounded-full bg-white/60" style={{ animationDelay: '150ms' }} />
                                            <div className="size-1 animate-pulse rounded-full bg-white/60" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Input bar */}
                            <div className="border-t border-white/15 px-2.5 py-2">
                                <div className="flex items-center gap-1 rounded-lg bg-white/10 px-2 py-1.5">
                                    <span className="flex-1 text-[7px] opacity-35">Type a message...</span>
                                    <PaperclipIcon className="size-2.5 opacity-30" />
                                    <CameraIcon className="size-2.5 opacity-30" />
                                    <div className="ml-0.5 flex size-4 items-center justify-center rounded-md bg-violet-500/50">
                                        <SendIcon className="size-2" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Launcher button */}
                <div className="absolute -bottom-8 -right-8 flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/40 ring-4 ring-white/10">
                    <MessageSquareIcon className="size-5" />
                </div>
            </div>
        </div>
    )
}

function ConversationsIllustration() {
    const conversations = [
        { name: 'Sarah Chen', msg: "The export button isn't working on the reports page", time: '2m', status: 'unresolved', initials: 'SC', color: 'bg-sky-400/50', flag: '🇺🇸' },
        { name: 'James Wilson', msg: 'Thanks, that fixed my issue!', time: '8m', status: 'resolved', initials: 'JW', color: 'bg-emerald-400/50', flag: '🇬🇧' },
        { name: 'Maria Lopez', msg: 'I keep getting a 403 error when I try to...', time: '15m', status: 'escalated', initials: 'ML', color: 'bg-orange-400/50', flag: '🇪🇸' },
        { name: 'Alex Tanaka', msg: 'Can I change my subscription plan?', time: '22m', status: 'unresolved', initials: 'AT', color: 'bg-purple-400/50', flag: '🇯🇵' },
    ]

    return (
        <div className="flex h-full w-full items-center justify-center overflow-hidden p-5">
            <div className="flex w-full max-w-md gap-2.5">
                {/* Sidebar — conversation list */}
                <div className="w-[170px] shrink-0 rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm">
                    {/* Header with search */}
                    <div className="border-b border-white/15 px-3 py-2.5">
                        <div className="flex items-center gap-1.5 rounded-lg bg-white/10 px-2 py-1">
                            <SearchIcon className="size-2.5 opacity-40" />
                            <span className="text-[7px] opacity-35">Search...</span>
                        </div>
                    </div>
                    {/* Filter tabs */}
                    <div className="flex gap-0.5 border-b border-white/10 px-2 py-1.5">
                        {['All', 'Open', 'Escalated'].map((f) => (
                            <span key={f} className={cn('rounded-md px-1.5 py-0.5 text-[7px]', f === 'All' ? 'bg-white/20 font-semibold' : 'opacity-40')}>
                                {f}
                            </span>
                        ))}
                    </div>
                    {/* Conversation items */}
                    <div className="divide-y divide-white/8">
                        {conversations.map((c, i) => (
                            <div key={i} className={cn('flex items-center gap-2 px-2.5 py-2', i === 0 && 'bg-white/10')}>
                                <div className="relative shrink-0">
                                    <div className={cn('flex size-7 items-center justify-center rounded-full text-[8px] font-bold', c.color)}>
                                        {c.initials}
                                    </div>
                                    <span className="absolute -bottom-0.5 -right-0.5 text-[6px]">{c.flag}</span>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[8px] font-semibold">{c.name.split(' ')[0]}</span>
                                        <span className="text-[6px] opacity-30">{c.time}</span>
                                    </div>
                                    <p className="truncate text-[7px] opacity-40">{c.msg}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main — open conversation */}
                <div className="flex flex-1 flex-col rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm">
                    {/* Chat header */}
                    <div className="flex items-center justify-between border-b border-white/15 px-3 py-2">
                        <div className="flex items-center gap-2">
                            <div className="flex size-6 items-center justify-center rounded-full bg-sky-400/50 text-[7px] font-bold">SC</div>
                            <div>
                                <p className="text-[9px] font-semibold">Sarah Chen</p>
                                <div className="flex items-center gap-1">
                                    <div className="size-1 rounded-full bg-emerald-400" />
                                    <span className="text-[6px] opacity-50">Online</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="rounded-full bg-sky-400/20 px-1.5 py-0.5 text-[6px] text-sky-300">Unresolved</span>
                            <MoreHorizontalIcon className="size-3 opacity-40" />
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 space-y-2 p-3">
                        {/* User message */}
                        <div className="flex items-start gap-1.5">
                            <div className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-sky-400/40 text-[6px] font-bold">S</div>
                            <div>
                                <div className="rounded-lg rounded-tl-sm bg-white/10 px-2 py-1.5">
                                    <p className="text-[8px] leading-[1.4]">The export button isn&apos;t working on the reports page. I click it but nothing happens.</p>
                                </div>
                                <p className="mt-0.5 text-[6px] opacity-30">2 min ago</p>
                            </div>
                        </div>
                        {/* Attachment */}
                        <div className="ml-5 flex items-center gap-1.5 rounded-md border border-white/15 bg-white/5 px-2 py-1">
                            <CameraIcon className="size-2.5 text-sky-400/70" />
                            <span className="text-[7px] opacity-60">screenshot.png</span>
                        </div>
                        {/* AI reply */}
                        <div className="flex items-start gap-1.5">
                            <div className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-violet-400/50">
                                <SparklesIcon className="size-2.5" />
                            </div>
                            <div>
                                <div className="rounded-lg rounded-tl-sm bg-white/15 px-2 py-1.5">
                                    <p className="text-[8px] leading-[1.4]">I can see the issue! The export fails for datasets over 10k rows. Let me escalate this to the team.</p>
                                </div>
                                <p className="mt-0.5 text-[6px] opacity-30">Just now &middot; <span className="text-violet-300">AI</span></p>
                            </div>
                        </div>
                    </div>

                    {/* Input */}
                    <div className="border-t border-white/15 px-2 py-1.5">
                        <div className="flex items-center gap-1 rounded-lg bg-white/8 px-2 py-1">
                            <span className="flex-1 text-[7px] opacity-30">Reply...</span>
                            <SendIcon className="size-2.5 opacity-30" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function KnowledgeBaseIllustration() {
    const files = [
        { name: 'product-guide.pdf', type: 'PDF', size: '2.4 MB', icon: FileTextIcon, color: 'text-red-400', typeColor: 'border-red-400/30 text-red-400/80' },
        { name: 'api-reference.md', type: 'MD', size: '156 KB', icon: FileIcon, color: 'text-emerald-400', typeColor: 'border-emerald-400/30 text-emerald-400/80' },
        { name: 'faq-responses.txt', type: 'TXT', size: '45 KB', icon: FileIcon, color: 'text-blue-400', typeColor: 'border-blue-400/30 text-blue-400/80' },
        { name: 'onboarding-flow.pdf', type: 'PDF', size: '890 KB', icon: FileTextIcon, color: 'text-red-400', typeColor: 'border-red-400/30 text-red-400/80' },
    ]

    return (
        <div className="flex h-full w-full items-center justify-center overflow-hidden p-5">
            <div className="w-full max-w-md space-y-3">
                {/* Upload area with animated border */}
                <div className="group relative rounded-xl border-2 border-dashed border-white/25 bg-white/5 p-4 text-center transition-all hover:border-white/40 hover:bg-white/8">
                    <div className="absolute inset-0 animate-pulse-slow rounded-xl bg-gradient-to-br from-emerald-400/5 to-teal-400/5" />
                    <div className="relative">
                        <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-xl bg-white/10">
                            <UploadIcon className="size-5 opacity-60" />
                        </div>
                        <p className="text-[10px] font-semibold opacity-70">
                            Drop files here to train the AI
                        </p>
                        <p className="mt-0.5 text-[8px] opacity-35">PDF, Markdown, TXT, DOCX, and more</p>
                    </div>
                </div>

                {/* Files table */}
                <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm">
                    {/* Table header */}
                    <div className="flex items-center justify-between border-b border-white/15 px-4 py-2.5">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                                Files
                            </span>
                            <span className="rounded-full bg-white/15 px-1.5 py-0.5 text-[8px] font-medium opacity-50">4</span>
                        </div>
                        <div className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5">
                            <CheckIcon className="size-2.5 text-emerald-400" />
                            <span className="text-[8px] font-medium text-emerald-400">All indexed</span>
                        </div>
                    </div>
                    {/* Column headers */}
                    <div className="flex items-center border-b border-white/8 px-4 py-1.5">
                        <span className="flex-1 text-[7px] font-medium uppercase tracking-wider opacity-30">Name</span>
                        <span className="w-12 text-center text-[7px] font-medium uppercase tracking-wider opacity-30">Type</span>
                        <span className="w-14 text-right text-[7px] font-medium uppercase tracking-wider opacity-30">Size</span>
                        <span className="w-6" />
                    </div>
                    <div className="divide-y divide-white/8">
                        {files.map((f, i) => (
                            <div key={i} className="flex items-center px-4 py-2 transition-colors hover:bg-white/5">
                                <div className="flex min-w-0 flex-1 items-center gap-2.5">
                                    <f.icon className={cn('size-4 shrink-0', f.color)} />
                                    <p className="truncate text-[9px] font-medium">{f.name}</p>
                                </div>
                                <div className="w-12 text-center">
                                    <span className={cn('rounded border px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-wider', f.typeColor)}>
                                        {f.type}
                                    </span>
                                </div>
                                <span className="w-14 text-right text-[8px] opacity-40">{f.size}</span>
                                <div className="w-6 text-right">
                                    <MoreHorizontalIcon className="inline size-3 opacity-25" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Indexing info */}
                <div className="flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2">
                    <SparklesIcon className="size-3.5 shrink-0 text-emerald-400" />
                    <div className="flex-1">
                        <p className="text-[8px] font-medium opacity-70">Smart chunking &amp; vectorization</p>
                        <p className="text-[7px] opacity-35">Documents are split into retrievable chunks for AI context</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

function IssuesIllustration() {
    const issues = [
        { title: 'Export fails on large datasets', severity: 'Critical', sevColor: 'bg-red-500/80 text-white', sessions: 12, category: 'Bug' },
        { title: '403 error on settings page', severity: 'High', sevColor: 'bg-white/25 text-white', sessions: 8, category: 'Bug' },
        { title: 'Add dark mode to dashboard', severity: 'Medium', sevColor: 'bg-white/10 text-white/70', sessions: 5, category: 'Feature' },
        { title: 'Slow load time on analytics', severity: 'Low', sevColor: 'border border-white/20 text-white/50', sessions: 2, category: 'Performance' },
    ]

    return (
        <div className="flex h-full w-full items-center justify-center overflow-hidden p-5">
            <div className="w-full max-w-md space-y-2.5">
                {/* Issues panel */}
                <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-white/15 px-4 py-2.5">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Issues</span>
                            <span className="rounded-full bg-red-500/20 px-1.5 py-0.5 text-[8px] font-medium text-red-400">4 open</span>
                        </div>
                        <div className="flex gap-1">
                            <span className="rounded-md bg-white/20 px-1.5 py-0.5 text-[7px] font-medium">Open</span>
                            <span className="rounded-md px-1.5 py-0.5 text-[7px] opacity-35">Resolved</span>
                        </div>
                    </div>

                    {/* Column header */}
                    <div className="flex items-center border-b border-white/8 px-4 py-1.5">
                        <span className="flex-1 text-[7px] font-medium uppercase tracking-wider opacity-25">Issue</span>
                        <span className="w-16 text-center text-[7px] font-medium uppercase tracking-wider opacity-25">Severity</span>
                        <span className="w-14 text-center text-[7px] font-medium uppercase tracking-wider opacity-25">Action</span>
                    </div>

                    {/* Issue rows */}
                    <div className="divide-y divide-white/8">
                        {issues.map((issue, i) => (
                            <div key={i} className={cn('flex items-center px-4 py-2.5', i === 0 && 'bg-white/5')}>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <BugIcon className="size-3 shrink-0 opacity-40" />
                                        <p className="truncate text-[9px] font-medium">{issue.title}</p>
                                    </div>
                                    <div className="ml-5 mt-0.5 flex items-center gap-2">
                                        <span className="text-[7px] opacity-30">{issue.sessions} sessions</span>
                                        <span className="text-[7px] opacity-20">&middot;</span>
                                        <span className="text-[7px] opacity-30">{issue.category}</span>
                                    </div>
                                </div>
                                <div className="w-16 text-center">
                                    <span className={cn('rounded-full px-1.5 py-0.5 text-[7px] font-semibold', issue.sevColor)}>
                                        {issue.severity}
                                    </span>
                                </div>
                                <div className="w-14 text-center">
                                    {i === 0 ? (
                                        <span className="inline-flex items-center gap-0.5 rounded-md bg-sky-400/20 px-1.5 py-0.5 text-[7px] font-medium text-sky-300">
                                            <ZapIcon className="size-2" />
                                            Fix
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-0.5 rounded-md border border-white/15 px-1.5 py-0.5 text-[7px] opacity-40">
                                            <ZapIcon className="size-2" />
                                            Fix
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Expanded issue detail */}
                <div className="rounded-xl border border-white/20 bg-white/10 p-3 backdrop-blur-sm">
                    <div className="mb-2 flex items-center gap-2">
                        <BugIcon className="size-3 text-red-400" />
                        <span className="text-[9px] font-semibold">Export fails on large datasets</span>
                    </div>
                    {/* Console log snippet */}
                    <div className="mb-2 rounded-lg bg-black/30 p-2">
                        <div className="flex items-center gap-1.5 border-b border-white/10 pb-1.5 mb-1.5">
                            <TerminalIcon className="size-2.5 text-red-400/70" />
                            <span className="text-[7px] font-medium text-red-400/70">Console Error</span>
                        </div>
                        <p className="font-mono text-[7px] leading-relaxed text-red-400/80">
                            TypeError: Cannot read property &apos;length&apos;<br />
                            <span className="opacity-50">at ExportService.process (export.ts:142)</span>
                        </p>
                    </div>
                    {/* Auto-detected badge */}
                    <div className="flex items-center gap-2">
                        <SparklesIcon className="size-3 text-amber-400" />
                        <span className="text-[8px] text-amber-400/80">Auto-detected from 12 conversations</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

function CustomizationIllustration() {
    return (
        <div className="flex h-full w-full items-center justify-center overflow-hidden p-5">
            <div className="flex w-full max-w-md gap-3.5">
                {/* Settings panel */}
                <div className="flex-1 space-y-2.5">
                    {/* Colors card */}
                    <div className="rounded-xl border border-white/20 bg-white/10 p-3 backdrop-blur-sm">
                        <p className="mb-2.5 text-[8px] font-bold uppercase tracking-widest opacity-50">
                            Theme Colors
                        </p>
                        <div className="space-y-2">
                            {[
                                { label: 'Primary', color: '#ec4899', display: 'bg-pink-500' },
                                { label: 'Gradient End', color: '#d946ef', display: 'bg-fuchsia-500' },
                                { label: 'Background', color: '#ffffff', display: 'bg-white' },
                                { label: 'Foreground', color: '#0a0a0a', display: 'bg-gray-900' },
                            ].map((c) => (
                                <div key={c.label} className="flex items-center gap-2">
                                    <div className={cn('size-4 shrink-0 rounded-md border border-white/20 shadow-inner', c.display)} />
                                    <span className="flex-1 text-[8px] font-medium opacity-60">{c.label}</span>
                                    <div className="flex items-center rounded border border-white/15 bg-white/5 px-1.5 py-0.5">
                                        <span className="font-mono text-[7px] opacity-50">{c.color}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Logo & greeting card */}
                    <div className="rounded-xl border border-white/20 bg-white/10 p-3 backdrop-blur-sm">
                        <p className="mb-2.5 text-[8px] font-bold uppercase tracking-widest opacity-50">
                            Branding
                        </p>
                        <div className="mb-2.5 flex items-center gap-2.5">
                            <div className="flex size-9 items-center justify-center rounded-xl border border-dashed border-white/25 bg-white/5">
                                <ImageIcon className="size-4 opacity-30" />
                            </div>
                            <div>
                                <p className="text-[8px] font-medium opacity-60">Assistant Logo</p>
                                <p className="text-[7px] opacity-30">PNG, JPG, SVG &middot; Max 5MB</p>
                            </div>
                        </div>
                        <div>
                            <p className="mb-1 text-[7px] font-medium opacity-40">Greeting</p>
                            <div className="rounded-md border border-white/15 bg-white/5 px-2 py-1.5">
                                <p className="text-[8px] opacity-60">Hi! How can I help you today?</p>
                            </div>
                        </div>
                    </div>

                    {/* Languages card */}
                    <div className="rounded-xl border border-white/20 bg-white/10 p-3 backdrop-blur-sm">
                        <p className="mb-2 text-[8px] font-bold uppercase tracking-widest opacity-50">Languages</p>
                        <div className="flex flex-wrap gap-1.5">
                            {['English', 'Spanish', 'Portuguese'].map((l, i) => (
                                <span key={l} className={cn('rounded-full border px-2 py-0.5 text-[7px]', i === 0 ? 'border-pink-400/30 bg-pink-400/10 text-pink-300' : 'border-white/15 opacity-50')}>
                                    {l}
                                </span>
                            ))}
                            <span className="rounded-full border border-dashed border-white/20 px-2 py-0.5 text-[7px] opacity-30">+ Add</span>
                        </div>
                    </div>
                </div>

                {/* Live widget preview */}
                <div className="w-[160px] shrink-0">
                    <p className="mb-2 text-center text-[8px] font-semibold uppercase tracking-widest opacity-40">Live Preview</p>
                    <div className="overflow-hidden rounded-2xl border border-white/25 bg-white/10 shadow-xl backdrop-blur-sm">
                        {/* Header with custom gradient */}
                        <div className="bg-gradient-to-r from-pink-500 to-fuchsia-500 px-3 py-3">
                            <div className="mb-1.5 flex items-center gap-2">
                                <div className="flex size-5 items-center justify-center rounded-full bg-white/25">
                                    <SparklesIcon className="size-3" />
                                </div>
                                <span className="text-[8px] font-bold">Support</span>
                            </div>
                            <p className="text-[7px] opacity-80">Hi! How can I help you today?</p>
                        </div>
                        {/* Suggestions */}
                        <div className="flex flex-col gap-1 border-b border-white/10 px-2 py-2">
                            {['Pricing plans', 'Get started', 'Contact sales'].map((s) => (
                                <span key={s} className="rounded-lg border border-pink-400/20 bg-pink-400/5 px-2 py-1 text-center text-[7px]">{s}</span>
                            ))}
                        </div>
                        {/* Mini chat */}
                        <div className="space-y-1.5 p-2">
                            <div className="rounded-lg bg-white/10 px-2 py-1">
                                <p className="text-[7px] opacity-60">Sure! We have 3 plans...</p>
                            </div>
                            <div className="ml-auto w-4/5 rounded-lg bg-gradient-to-r from-pink-500/30 to-fuchsia-500/30 px-2 py-1">
                                <p className="text-[7px] opacity-70">Which one is best?</p>
                            </div>
                        </div>
                        {/* Input */}
                        <div className="border-t border-white/10 px-2 py-1.5">
                            <div className="flex items-center rounded-md bg-white/8 px-1.5 py-1">
                                <span className="flex-1 text-[6px] opacity-25">Message...</span>
                                <div className="flex size-3.5 items-center justify-center rounded bg-pink-500/50">
                                    <ArrowUpIcon className="size-2" />
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Launcher preview */}
                    <div className="mt-2.5 flex justify-end">
                        <div className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-fuchsia-500 shadow-lg shadow-pink-500/30 ring-2 ring-white/10">
                            <MessageSquareIcon className="size-4" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function IntegrationsIllustration() {
    const integrations = [
        { name: 'Supabase', letter: 'S', color: 'bg-emerald-500/40 text-emerald-200', connected: true },
        { name: 'Vercel', letter: 'V', color: 'bg-white/20 text-white', connected: true },
        { name: 'Sentry', letter: 'S', color: 'bg-purple-500/40 text-purple-200', connected: false },
        { name: 'Convex', letter: 'C', color: 'bg-orange-500/40 text-orange-200', connected: true },
    ]

    return (
        <div className="flex h-full w-full items-center justify-center overflow-hidden p-5">
            <div className="w-full max-w-md space-y-3">
                {/* Integration grid */}
                <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm">
                    <div className="flex items-center justify-between border-b border-white/15 px-4 py-2.5">
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Integrations</span>
                        <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[8px] text-emerald-400">3 active</span>
                    </div>
                    <div className="grid grid-cols-2 gap-px bg-white/8">
                        {integrations.map((int, i) => (
                            <div key={i} className={cn('flex items-center gap-2.5 bg-white/5 p-3', int.connected && 'bg-white/10')}>
                                <div className={cn('flex size-9 items-center justify-center rounded-xl text-sm font-bold', int.color)}>
                                    {int.letter}
                                </div>
                                <div>
                                    <p className="text-[9px] font-semibold">{int.name}</p>
                                    {int.connected ? (
                                        <div className="flex items-center gap-1">
                                            <div className="size-1.5 rounded-full bg-emerald-400" />
                                            <span className="text-[7px] text-emerald-400">Connected</span>
                                        </div>
                                    ) : (
                                        <span className="text-[7px] opacity-35">Available</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Embed code snippet */}
                <div className="rounded-xl border border-white/20 bg-white/10 p-3 backdrop-blur-sm">
                    <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <CodeIcon className="size-3 opacity-50" />
                            <span className="text-[8px] font-bold uppercase tracking-widest opacity-50">Embed Script</span>
                        </div>
                        <span className="rounded border border-white/15 px-1.5 py-0.5 text-[7px] opacity-40">Copy</span>
                    </div>
                    <div className="rounded-lg bg-black/30 p-2.5">
                        <code className="block font-mono text-[7px] leading-relaxed">
                            <span className="text-pink-400/80">&lt;script</span>{' '}
                            <span className="text-sky-400/70">src</span>
                            <span className="text-white/40">=</span>
                            <span className="text-emerald-400/70">&quot;...embed.js&quot;</span>
                            <br />
                            {'  '}
                            <span className="text-sky-400/70">data-org-id</span>
                            <span className="text-white/40">=</span>
                            <span className="text-emerald-400/70">&quot;org_xxx&quot;</span>
                            <span className="text-pink-400/80">&gt;&lt;/script&gt;</span>
                        </code>
                    </div>
                </div>

                {/* MCP tools info */}
                <div className="flex items-center gap-2.5 rounded-xl border border-white/20 bg-white/10 p-3 backdrop-blur-sm">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-orange-500/20">
                        <PlugZapIcon className="size-4 text-orange-400" />
                    </div>
                    <div>
                        <p className="text-[9px] font-semibold opacity-80">MCP Servers</p>
                        <p className="text-[7px] opacity-40">Give the AI access to your external services and data</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

function GitHubIllustration() {
    return (
        <div className="flex h-full w-full items-center justify-center overflow-hidden p-5">
            <div className="w-full max-w-md space-y-3">
                {/* Connected repo card */}
                <div className="rounded-xl border border-white/20 bg-white/10 p-3.5 backdrop-blur-sm">
                    <div className="mb-2 flex items-center gap-2.5">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-white/15">
                            <GithubIcon className="size-4.5" />
                        </div>
                        <div className="flex-1">
                            <span className="text-[10px] font-bold">acme/web-app</span>
                            <div className="flex items-center gap-2 text-[7px] opacity-40">
                                <span>main</span>
                                <span>&middot;</span>
                                <span>TypeScript</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5">
                            <div className="size-1.5 rounded-full bg-emerald-400" />
                            <span className="text-[7px] font-medium text-emerald-400">Linked</span>
                        </div>
                    </div>
                    <div className="flex gap-3 text-[7px] opacity-40">
                        <span>24 workflows</span>
                        <span>Last push 3h ago</span>
                    </div>
                </div>

                {/* Auto-fix workflow — visual pipeline */}
                <div className="rounded-xl border border-white/20 bg-white/10 p-3.5 backdrop-blur-sm">
                    <p className="mb-3 text-[8px] font-bold uppercase tracking-widest opacity-50">
                        Auto-fix Pipeline
                    </p>
                    <div className="space-y-1">
                        {/* Step 1 — Issue */}
                        <div className="flex items-center gap-2.5 rounded-lg bg-red-500/10 px-2.5 py-2">
                            <div className="flex size-7 items-center justify-center rounded-lg bg-red-500/30">
                                <BugIcon className="size-3.5 text-red-400" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[8px] font-semibold">Bug Detected</p>
                                <p className="text-[7px] opacity-40">Export fails on large datasets</p>
                            </div>
                            <CheckIcon className="size-3 text-red-400/60" />
                        </div>

                        <div className="ml-5 flex h-3 items-center">
                            <div className="h-full border-l border-dashed border-white/20" />
                            <ArrowRightIcon className="ml-1 size-2 rotate-90 opacity-20" />
                        </div>

                        {/* Step 2 — PR */}
                        <div className="flex items-center gap-2.5 rounded-lg bg-sky-500/10 px-2.5 py-2">
                            <div className="flex size-7 items-center justify-center rounded-lg bg-sky-500/30">
                                <GitPullRequestIcon className="size-3.5 text-sky-400" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[8px] font-semibold">PR #247 Created</p>
                                <p className="text-[7px] opacity-40">fix: handle large dataset export</p>
                            </div>
                            <CheckIcon className="size-3 text-sky-400/60" />
                        </div>

                        <div className="ml-5 flex h-3 items-center">
                            <div className="h-full border-l border-dashed border-white/20" />
                            <ArrowRightIcon className="ml-1 size-2 rotate-90 opacity-20" />
                        </div>

                        {/* Step 3 — CI */}
                        <div className="flex items-center gap-2.5 rounded-lg bg-amber-500/10 px-2.5 py-2">
                            <div className="flex size-7 items-center justify-center rounded-lg bg-amber-500/30">
                                <CirclePlayIcon className="size-3.5 text-amber-400" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[8px] font-semibold">CI Running</p>
                                <div className="mt-0.5 h-1 w-3/4 overflow-hidden rounded-full bg-white/10">
                                    <div className="h-full w-2/3 animate-pulse rounded-full bg-amber-400/60" />
                                </div>
                            </div>
                        </div>

                        <div className="ml-5 flex h-3 items-center">
                            <div className="h-full border-l border-dashed border-white/20" />
                            <ArrowRightIcon className="ml-1 size-2 rotate-90 opacity-20" />
                        </div>

                        {/* Step 4 — Merged */}
                        <div className="flex items-center gap-2.5 rounded-lg bg-emerald-500/10 px-2.5 py-2">
                            <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/30">
                                <CheckIcon className="size-3.5 text-emerald-400" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[8px] font-semibold">Merged &amp; Deployed</p>
                                <p className="text-[7px] opacity-40">Auto-merged after tests passed</p>
                            </div>
                            <ShieldCheckIcon className="size-3 text-emerald-400/60" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function CustomToolsIllustration() {
    const tools = [
        { method: 'GET', path: '/api/user/:id', name: 'Get user profile', color: 'bg-emerald-500/30 text-emerald-400' },
        { method: 'POST', path: '/api/orders', name: 'Create order', color: 'bg-sky-500/30 text-sky-400' },
        { method: 'PUT', path: '/api/settings', name: 'Update settings', color: 'bg-amber-500/30 text-amber-400' },
    ]

    return (
        <div className="flex h-full w-full items-center justify-center overflow-hidden p-5">
            <div className="w-full max-w-md space-y-2.5">
                {/* Tools registry */}
                <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm">
                    <div className="flex items-center justify-between border-b border-white/15 px-4 py-2.5">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Tools</span>
                            <span className="rounded-full bg-white/15 px-1.5 py-0.5 text-[8px] opacity-50">3</span>
                        </div>
                        <span className="flex items-center gap-1 rounded-md border border-white/15 px-2 py-0.5 text-[7px] opacity-50">
                            <span>+</span> Add tool
                        </span>
                    </div>
                    <div className="divide-y divide-white/8">
                        {tools.map((t, i) => (
                            <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                                <span className={cn('shrink-0 rounded-md px-2 py-0.5 font-mono text-[8px] font-bold', t.color)}>
                                    {t.method}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[9px] font-semibold">{t.name}</p>
                                    <p className="truncate font-mono text-[7px] opacity-35">{t.path}</p>
                                </div>
                                <MoreHorizontalIcon className="size-3 shrink-0 opacity-25" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Live conversation showing tool invocation */}
                <div className="rounded-xl border border-white/20 bg-white/10 p-3 backdrop-blur-sm">
                    <p className="mb-2 text-[8px] font-bold uppercase tracking-widest opacity-40">Live Example</p>
                    <div className="space-y-2">
                        {/* User asks */}
                        <div className="flex justify-end">
                            <div className="rounded-xl rounded-tr-sm bg-cyan-500/20 px-2.5 py-1.5">
                                <p className="text-[8px]">What&apos;s my current plan?</p>
                            </div>
                        </div>
                        {/* AI invokes tool */}
                        <div className="flex items-start gap-1.5">
                            <div className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-violet-400/40">
                                <SparklesIcon className="size-2.5" />
                            </div>
                            <div className="space-y-1.5">
                                {/* Tool call card */}
                                <div className="rounded-lg border border-cyan-400/20 bg-cyan-400/5 px-2 py-1.5">
                                    <div className="flex items-center gap-1.5">
                                        <WrenchIcon className="size-2.5 text-cyan-400" />
                                        <span className="text-[7px] font-semibold text-cyan-400/80">Called: Get user profile</span>
                                    </div>
                                    <div className="mt-1 rounded bg-black/20 px-1.5 py-1">
                                        <code className="font-mono text-[6px] text-cyan-300/60">GET /api/user/usr_abc123</code>
                                    </div>
                                </div>
                                {/* Response */}
                                <div className="rounded-xl rounded-tl-sm bg-white/15 px-2.5 py-1.5">
                                    <p className="text-[8px] leading-[1.4]">You&apos;re on the <span className="font-semibold">Pro plan</span> ($29/mo). Your next billing date is May 1st.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function DoneIllustration() {
    return (
        <div className="flex h-full w-full items-center justify-center overflow-hidden p-5">
            <div className="w-full max-w-sm text-center">
                {/* Success animation */}
                <div className="relative mx-auto mb-8 flex size-28 items-center justify-center">
                    {/* Outer rings */}
                    <div className="absolute inset-0 animate-ping rounded-full bg-emerald-400/10" style={{ animationDuration: '2s' }} />
                    <div className="absolute inset-3 rounded-full bg-emerald-400/8" />
                    <div className="absolute inset-6 rounded-full bg-emerald-400/5" />
                    {/* Main circle */}
                    <div className="relative flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-xl shadow-emerald-500/40">
                        <CheckIcon className="size-8" strokeWidth={3} />
                    </div>
                    {/* Floating particles */}
                    <div className="absolute -right-1 top-2 size-2 animate-float rounded-full bg-violet-400/60" style={{ animationDelay: '0.5s' }} />
                    <div className="absolute -left-2 top-6 size-1.5 animate-float rounded-full bg-indigo-400/60" style={{ animationDelay: '1s' }} />
                    <div className="absolute bottom-2 right-0 size-1.5 animate-float rounded-full bg-emerald-400/60" style={{ animationDelay: '1.5s' }} />
                    <div className="absolute -left-1 bottom-4 size-2 animate-float rounded-full bg-pink-400/50" style={{ animationDelay: '0.7s' }} />
                </div>

                {/* Next steps */}
                <div className="space-y-2">
                    {[
                        { icon: BookOpenIcon, text: 'Upload docs to the Knowledge Base', detail: 'Train the AI with your product info' },
                        { icon: PaletteIcon, text: 'Customize your widget', detail: 'Match colors and branding' },
                        { icon: CodeIcon, text: 'Embed on your website', detail: 'Add one script tag and go live' },
                    ].map((item, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-3 rounded-xl border border-white/20 bg-white/10 px-3.5 py-3 text-left backdrop-blur-sm"
                        >
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/15">
                                <item.icon className="size-4 opacity-70" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-[9px] font-semibold">{item.text}</p>
                                <p className="text-[7px] opacity-40">{item.detail}</p>
                            </div>
                            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-[8px] font-bold opacity-40">
                                {i + 1}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

// ---------------------------------------------------------------------------
// Step definitions
// ---------------------------------------------------------------------------

interface OnboardingStep {
    id: string
    icon: React.ReactNode
    accentColor: string
    title: string
    subtitle: string
    description: string
    bullets: string[]
    illustration: React.ReactNode
}

const STEPS: OnboardingStep[] = [
    {
        id: 'welcome',
        icon: <SparklesIcon className="size-5" />,
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
        illustration: <WelcomeIllustration />,
    },
    {
        id: 'conversations',
        icon: <MessageSquareIcon className="size-5" />,
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
        illustration: <ConversationsIllustration />,
    },
    {
        id: 'knowledge-base',
        icon: <BookOpenIcon className="size-5" />,
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
        illustration: <KnowledgeBaseIllustration />,
    },
    {
        id: 'issues',
        icon: <BugIcon className="size-5" />,
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
        illustration: <IssuesIllustration />,
    },
    {
        id: 'customization',
        icon: <PaletteIcon className="size-5" />,
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
        illustration: <CustomizationIllustration />,
    },
    {
        id: 'integrations',
        icon: <PlugZapIcon className="size-5" />,
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
        illustration: <IntegrationsIllustration />,
    },
    {
        id: 'github',
        icon: <GithubIcon className="size-5" />,
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
        illustration: <GitHubIllustration />,
    },
    {
        id: 'custom-tools',
        icon: <WrenchIcon className="size-5" />,
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
        illustration: <CustomToolsIllustration />,
    },
    {
        id: 'done',
        icon: <CheckIcon className="size-5" />,
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
        illustration: <DoneIllustration />,
    },
]

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function OnboardingView() {
    const router = useRouter()
    const completeOnboarding = useMutation(api.users.completeOnboarding)
    const [currentStep, setCurrentStep] = useState(0)
    const [completing, setCompleting] = useState(false)

    const step = STEPS[currentStep]!
    const isFirst = currentStep === 0
    const isLast = currentStep === STEPS.length - 1
    const progress = ((currentStep + 1) / STEPS.length) * 100

    const goTo = useCallback(
        (target: number) => {
            setCurrentStep(target)
        },
        [],
    )

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
            <div className="flex items-center justify-between border-b px-4 py-2.5 sm:px-6 sm:py-3">
                <div className="flex items-center gap-3">
                    <div
                        className={cn(
                            'flex size-7 items-center justify-center rounded-lg bg-gradient-to-br text-white',
                            step.accentColor,
                        )}
                    >
                        {step.icon}
                    </div>
                    <div>
                        <span className="text-sm font-semibold">{step.title}</span>
                        <span className="ml-2 text-xs text-muted-foreground">
                            {currentStep + 1}/{STEPS.length}
                        </span>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSkip}
                    disabled={completing}
                    className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                >
                    <XIcon className="size-3" />
                    Skip
                </Button>
            </div>

            {/* Progress bar */}
            <div className="h-0.5 w-full bg-muted">
                <div
                    className={cn(
                        'h-full bg-gradient-to-r transition-all duration-500 ease-out',
                        step.accentColor,
                    )}
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col lg:flex-row">
                {/* Mobile illustration */}
                <div
                    className={cn(
                        'relative h-64 w-full shrink-0 bg-gradient-to-br text-white sm:h-72 lg:hidden',
                        step.accentColor,
                    )}
                >
                    <div className="relative z-10 h-full">{step.illustration}</div>
                    <div className="absolute inset-0 bg-black/5" />
                </div>

                {/* Left — text content */}
                <div className="flex flex-1 flex-col justify-center px-5 py-6 sm:px-8 sm:py-8 lg:px-14 lg:py-12">
                    <div
                        key={step.id}
                        className="mx-auto w-full max-w-lg animate-fade-in"
                    >
                        {/* Step label */}
                        <div className="mb-4 flex items-center gap-2 lg:mb-5">
                            <div
                                className={cn(
                                    'flex size-8 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm lg:size-9',
                                    step.accentColor,
                                )}
                            >
                                {step.icon}
                            </div>
                            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                {step.subtitle}
                            </p>
                        </div>

                        <h1 className="mb-3 text-2xl font-bold tracking-tight sm:text-3xl lg:mb-4 lg:text-4xl">
                            {step.title}
                        </h1>
                        <p className="mb-5 text-sm leading-relaxed text-muted-foreground sm:text-base lg:mb-7">
                            {step.description}
                        </p>

                        <ul className="mb-8 space-y-3 lg:mb-10">
                            {step.bullets.map((bullet, i) => (
                                <li
                                    key={bullet}
                                    className="flex items-start gap-3"
                                    style={{ animationDelay: `${i * 100 + 150}ms` }}
                                >
                                    <span
                                        className={cn(
                                            'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-white',
                                            step.accentColor,
                                        )}
                                    >
                                        <CheckIcon className="size-3" strokeWidth={3} />
                                    </span>
                                    <span className="text-sm text-foreground">{bullet}</span>
                                </li>
                            ))}
                        </ul>

                        {/* Navigation */}
                        <div className="flex items-center justify-between gap-3">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => goTo(currentStep - 1)}
                                disabled={isFirst || completing}
                                className="gap-1.5"
                            >
                                <ChevronLeftIcon className="size-4" />
                                <span className="hidden sm:inline">Back</span>
                            </Button>

                            {/* Step dots */}
                            <div className="flex items-center gap-1.5">
                                {STEPS.map((s, i) => (
                                    <button
                                        key={i}
                                        onClick={() => goTo(i)}
                                        disabled={completing}
                                        className={cn(
                                            'rounded-full transition-all duration-300',
                                            i === currentStep
                                                ? 'h-2 w-6 bg-primary'
                                                : i < currentStep
                                                  ? 'size-2 bg-primary/40 hover:bg-primary/60'
                                                  : 'size-2 bg-muted-foreground/20 hover:bg-muted-foreground/40',
                                        )}
                                        aria-label={`Go to step ${i + 1}: ${s.title}`}
                                    />
                                ))}
                            </div>

                            {isLast ? (
                                <Button
                                    size="sm"
                                    onClick={handleFinish}
                                    disabled={completing}
                                    className="gap-1.5"
                                >
                                    Get started
                                    <RocketIcon className="size-4" />
                                </Button>
                            ) : (
                                <Button
                                    size="sm"
                                    onClick={() => goTo(currentStep + 1)}
                                    disabled={completing}
                                    className="gap-1.5"
                                >
                                    <span className="hidden sm:inline">Next</span>
                                    <ChevronRightIcon className="size-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right — illustration (desktop) */}
                <div className="hidden lg:flex lg:w-1/2 lg:shrink-0">
                    <div
                        key={step.id}
                        className={cn(
                            'relative flex w-full animate-fade-in bg-gradient-to-br text-white',
                            step.accentColor,
                        )}
                    >
                        <div className="relative z-10 h-full w-full">{step.illustration}</div>
                        {/* Decorative elements */}
                        <div className="absolute right-8 top-8 size-40 rounded-full bg-white/5 blur-3xl" />
                        <div className="absolute bottom-8 left-8 size-28 rounded-full bg-white/5 blur-2xl" />
                    </div>
                </div>
            </div>
        </div>
    )
}
