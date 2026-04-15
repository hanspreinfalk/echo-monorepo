"use client";

import { CheckIcon, ChevronDownIcon, Loader2Icon, MonitorIcon, SquareIcon, XIcon } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { AIMessage, AIMessageContent } from "@workspace/ui/components/ai/message";
import {
    Collapsible,
    CollapsibleTrigger,
} from "@workspace/ui/components/collapsible";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";

export type PageControlAgentStep = { stepIndex: number; goal: string; actionName: string };

export interface CardColors {
    /** Heading text. Defaults to "text-foreground". */
    text?: string;
    /** Secondary / description text. Defaults to "text-muted-foreground". */
    mutedText?: string;
    /** Monitor icon. Defaults to "text-primary". */
    icon?: string;
}

const defaultColors: Required<CardColors> = {
    text: "text-foreground",
    mutedText: "text-muted-foreground",
    icon: "text-primary",
};

/** Props for the page-control request bubble only (live steps render in a separate chat row). */
export interface PageControlCardProps {
    action: string;
    /** Convex `pageControlRequests.status` — drives the request card (frozen after accept). */
    requestStatus: "pending" | "approved" | "denied";
    /** If omitted the card is read-only (observer / dashboard mode). */
    onAllow?: () => Promise<void> | void;
    onDeny?: () => Promise<void> | void;
    /** Widget: true after user taps accept while approval is saving. */
    acceptSubmitted?: boolean;
    colors?: CardColors;
}

export interface PageControlCardContentProps {
    action: string;
    phase: "pending" | "running" | "done";
    result?: { success: boolean; data: string };
    onAllow?: () => Promise<void> | void;
    onDeny?: () => Promise<void> | void;
    acceptSubmitted?: boolean;
    onStop?: () => void;
    onDismiss?: () => void;
    colors?: CardColors;
}

type MergedCardColors = Required<CardColors>;

function stepRowIsDone(
    index: number,
    total: number,
    phase: "running" | "done"
): boolean {
    if (phase === "done") return true;
    return total > 1 && index < total - 1;
}

export interface PageControlAgentStepsPanelProps {
    steps: PageControlAgentStep[];
    phase: "running" | "done";
    colors?: CardColors;
    /**
     * When true, the list starts expanded while `phase === "running"` and collapses automatically when `phase === "done"`.
     * When false (default), starts collapsed (e.g. dashboard).
     */
    expandWhileRunning?: boolean;
    /** Renders beside the trigger row (e.g. running / done status icon), vertically centered with the label. */
    statusAdornment?: ReactNode;
}

/** Collapsible agent step log — use without the page-control request bubble. */
export function PageControlAgentStepsPanel({
    steps,
    phase,
    colors,
    expandWhileRunning = false,
    statusAdornment,
}: PageControlAgentStepsPanelProps) {
    const c = { ...defaultColors, ...colors };
    const [open, setOpen] = useState(() => expandWhileRunning && phase === "running");
    const reduceMotion = useReducedMotion();

    useEffect(() => {
        if (phase === "done") {
            setOpen(false);
        }
    }, [phase]);

    if (steps.length === 0) {
        return null;
    }

    const transition = reduceMotion
        ? { duration: 0 }
        : {
              height: { duration: 0.28, ease: [0.32, 0.72, 0, 1] as const },
              opacity: { duration: 0.22, ease: "easeOut" as const },
          };

    return (
        <Collapsible
            className="group min-w-0 w-fit max-w-sm"
            onOpenChange={setOpen}
            open={open}
        >
            <div className="flex min-w-0 items-center gap-2">
                <CollapsibleTrigger
                    type="button"
                    className={cn(
                        "inline-flex max-w-full flex-nowrap items-center gap-1 whitespace-nowrap rounded-md py-1 text-left text-xs transition-colors hover:bg-muted/60 -mx-0.5 px-0.5",
                        c.mutedText
                    )}
                >
                    <span className="font-medium whitespace-nowrap">Agent steps: {steps.length}</span>
                    <ChevronDownIcon
                        aria-hidden
                        className="size-3.5 shrink-0 transition-transform duration-300 ease-out group-data-[state=open]:rotate-180"
                    />
                </CollapsibleTrigger>
                {statusAdornment != null && (
                    <span className="inline-flex shrink-0 items-center">{statusAdornment}</span>
                )}
            </div>
            <motion.div
                animate={{
                    height: open ? "auto" : 0,
                    opacity: open ? 1 : 0,
                }}
                className="min-w-0 overflow-hidden"
                initial={false}
                transition={transition}
            >
                <div className="flex flex-col gap-1.5 pt-1 pl-0.5">
                    {steps.map((step, i) => {
                        const done = stepRowIsDone(i, steps.length, phase);
                        return (
                            <div
                                key={i}
                                className={cn("text-xs leading-relaxed", c.mutedText)}
                            >
                                {step.goal || step.actionName}
                                {done && (
                                    <CheckIcon
                                        aria-hidden
                                        className="ml-1 inline-block size-3 align-[-0.15em] opacity-90"
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            </motion.div>
        </Collapsible>
    );
}

export interface PageControlRequestCardContentProps {
    action: string;
    /** Widget: true with handlers; dashboard observer: false. */
    interactive: boolean;
    onAllow?: () => void;
    onDeny?: () => void;
    allowLabel?: string;
    denyLabel?: string;
    /** After the user taps accept while the approval mutation is in flight. */
    acceptSubmitted?: boolean;
    /** Request was approved — same layout as pending, read-only “Accepted”. */
    readonlyApproved?: boolean;
    /** Request was denied — same layout as pending, read-only “Denied”. */
    readonlyDenied?: boolean;
    colors?: CardColors;
}

/** Page control approval UI only — goes inside {@link AIMessageContent}. */
export function PageControlRequestCardContent({
    action,
    interactive,
    onAllow,
    onDeny,
    allowLabel = "Accept",
    denyLabel = "Deny",
    acceptSubmitted = false,
    readonlyApproved = false,
    readonlyDenied = false,
    colors,
}: PageControlRequestCardContentProps) {
    const c = { ...defaultColors, ...colors };

    const showAcceptedStamp = readonlyApproved || (interactive && acceptSubmitted);

    return (
        <div className="flex flex-col gap-2 py-1">
            <div className={cn("flex items-center gap-1.5 text-xs font-semibold", c.text)}>
                <MonitorIcon className={cn("size-3.5 shrink-0", c.icon)} />
                <span>Page control request</span>
            </div>
            <p className={cn("text-xs leading-relaxed", c.mutedText)}>{action}</p>
            {readonlyDenied ? (
                <div className="pt-0.5">
                    <span
                        className={cn(
                            "inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium",
                            c.mutedText
                        )}
                    >
                        <XIcon className="size-3" /> Denied
                    </span>
                </div>
            ) : showAcceptedStamp ? (
                <div className="pt-0.5">
                    <button
                        type="button"
                        disabled
                        className="flex cursor-default items-center gap-1 rounded-md border border-transparent bg-primary/80 px-3 py-1.5 text-xs font-medium text-primary-foreground opacity-90"
                    >
                        <CheckIcon className="size-3" /> Accepted
                    </button>
                </div>
            ) : interactive && (onAllow || onDeny) ? (
                <div className="flex gap-2 pt-0.5">
                    {onAllow && (
                        <button
                            type="button"
                            onClick={() => onAllow()}
                            className="flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition hover:opacity-90"
                        >
                            <CheckIcon className="size-3" /> {allowLabel}
                        </button>
                    )}
                    {onDeny && (
                        <button
                            type="button"
                            onClick={() => onDeny()}
                            className={cn(
                                "flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium transition hover:bg-muted",
                                c.mutedText
                            )}
                        >
                            <XIcon className="size-3" /> {denyLabel}
                        </button>
                    )}
                </div>
            ) : (
                <p className={cn("text-xs italic", c.mutedText)}>Awaiting user approval…</p>
            )}
        </div>
    );
}

export interface PageControlRunningBarProps {
    onStop?: () => void;
    colors?: CardColors;
}

export function PageControlRunningBar({ onStop, colors }: PageControlRunningBarProps) {
    const c = { ...defaultColors, ...colors };

    return (
        <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5 text-xs">
            <div className={cn("flex items-center gap-1.5", c.mutedText)}>
                <Loader2Icon className="size-3 animate-spin" />
                <span>Working…</span>
            </div>
            {onStop && (
                <button
                    type="button"
                    onClick={() => onStop()}
                    className="flex shrink-0 items-center gap-1 rounded-md border border-destructive/50 px-2.5 py-1 text-xs font-medium text-destructive transition hover:bg-destructive/10"
                >
                    <SquareIcon className="size-2.5 fill-current" />
                    Stop
                </button>
            )}
        </div>
    );
}

export interface PageAgentStepsToolCardProps {
    phase: "running" | "done";
    steps: PageControlAgentStep[];
    onStop?: () => void;
    colors?: CardColors;
    expandWhileRunning?: boolean;
}

/** Muted “tool” style card for live page-agent steps (separate from the page-control request bubble). */
export function PageAgentStepsToolCard({
    phase,
    steps,
    onStop,
    colors,
    expandWhileRunning = false,
}: PageAgentStepsToolCardProps) {
    const c = { ...defaultColors, ...colors };
    const done = phase === "done";

    const statusIcon = done ? (
        <CheckIcon
            aria-hidden
            className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-500"
        />
    ) : (
        <Loader2Icon
            aria-hidden
            className="size-3.5 shrink-0 animate-spin text-muted-foreground"
        />
    );

    return (
        <div
            className="flex min-w-0 w-fit max-w-sm flex-col gap-1.5 rounded-lg border border-border/70 bg-muted/50 px-2.5 py-2"
            aria-label="Agent steps"
        >
            {steps.length > 0 ? (
                <PageControlAgentStepsPanel
                    colors={c}
                    expandWhileRunning={expandWhileRunning}
                    phase={phase}
                    statusAdornment={statusIcon}
                    steps={steps}
                />
            ) : (
                <div className="flex justify-end">{statusIcon}</div>
            )}
            {phase === "running" && onStop && (
                <div className="flex justify-end border-t border-border/60 pt-1.5">
                    <button
                        type="button"
                        onClick={() => onStop()}
                        className="flex shrink-0 items-center gap-1 rounded-md border border-destructive/50 px-2.5 py-1 text-xs font-medium text-destructive transition hover:bg-destructive/10"
                    >
                        <SquareIcon className="size-2.5 fill-current" />
                        Stop
                    </button>
                </div>
            )}
        </div>
    );
}

export function PageControlCardContent({
    action,
    phase,
    result,
    onAllow,
    onDeny,
    acceptSubmitted,
    onStop,
    onDismiss,
    colors,
}: PageControlCardContentProps) {
    const c = { ...defaultColors, ...colors };
    const interactive = phase === "pending" && !!(onAllow || onDeny);

    if (phase === "pending") {
        return (
            <PageControlRequestCardContent
                acceptSubmitted={acceptSubmitted}
                action={action}
                denyLabel="Deny"
                interactive={interactive}
                onAllow={onAllow}
                onDeny={onDeny}
                colors={colors}
            />
        );
    }

    return (
        <div className="flex flex-col gap-2 py-1">
            <div className="flex items-center justify-between gap-2">
                <div className={cn("flex items-center gap-1.5 text-xs font-semibold", c.text)}>
                    <MonitorIcon className={cn("size-3.5 shrink-0", c.icon)} />
                    <span>
                        {phase === "running"
                            ? "Working on page…"
                            : "Done"}
                    </span>
                </div>
                {phase === "done" && onDismiss && (
                    <button
                        type="button"
                        onClick={onDismiss}
                        className={cn("transition", c.mutedText)}
                    >
                        <XIcon className="size-3.5" />
                    </button>
                )}
            </div>

            <p className={cn("text-xs leading-relaxed", c.mutedText)}>{action}</p>

            {phase === "running" && (
                <PageControlRunningBar colors={colors} onStop={onStop} />
            )}

            {phase === "done" && result && !result.success && (
                <div className={cn("flex items-start gap-1.5 text-xs leading-relaxed", c.mutedText)}>
                    <XIcon className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                    <span>{result.data || "Failed"}</span>
                </div>
            )}
        </div>
    );
}

export interface PageControlCardStandaloneProps extends PageControlCardProps {
    /** Avatar node rendered alongside the bubble (app-specific). */
    avatar?: ReactNode;
    /** Which side the bubble appears on. Defaults to "assistant". */
    from?: "user" | "assistant";
    /** E.g. message timestamp below the request card. */
    requestTrailing?: ReactNode;
    /** Rendered above the request card (e.g. sender badge). */
    leadContent?: ReactNode;
}

/**
 * Page-control request only. Live steps are rendered via `page-control-steps` rows
 * ({@link injectPageControlStepRows}) and {@link PageAgentStepsToolCard}.
 */
export function PageControlCard({
    avatar,
    from = "assistant",
    requestTrailing,
    leadContent,
    ...contentProps
}: PageControlCardStandaloneProps) {
    const { action, requestStatus, colors, acceptSubmitted, onAllow, onDeny } = contentProps;
    const interactive = requestStatus === "pending" && !!(onAllow || onDeny);

    return (
        <AIMessage from={from}>
            <div className="flex min-w-0 w-fit max-w-[80%] flex-col gap-1">
                {leadContent}
                <AIMessageContent>
                    <PageControlRequestCardContent
                        acceptSubmitted={acceptSubmitted}
                        action={action}
                        colors={colors}
                        denyLabel="Deny"
                        interactive={interactive}
                        onAllow={onAllow}
                        onDeny={onDeny}
                        readonlyApproved={requestStatus === "approved"}
                        readonlyDenied={requestStatus === "denied"}
                    />
                </AIMessageContent>
                {requestTrailing}
            </div>
            {avatar}
        </AIMessage>
    );
}
