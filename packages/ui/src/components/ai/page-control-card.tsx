"use client";

import { CheckIcon, ChevronDownIcon, Loader2Icon, MonitorIcon, SquareIcon, XIcon } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { AIMessage, AIMessageContent } from "@workspace/ui/components/ai/message";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@workspace/ui/components/collapsible";
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

export interface PageControlCardProps {
    action: string;
    phase: "pending" | "running" | "done";
    steps?: PageControlAgentStep[];
    result?: { success: boolean; data: string };
    /** If omitted the card is read-only (observer / dashboard mode). */
    onAllow?: () => Promise<void> | void;
    onDeny?: () => Promise<void> | void;
    /** Shown while `phase === "running"` (e.g. parent PageAgent — call `postMessage` to stop). */
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
}

/** Collapsible agent step log — use without the page-control request bubble. */
export function PageControlAgentStepsPanel({
    steps,
    phase,
    colors,
    expandWhileRunning = false,
}: PageControlAgentStepsPanelProps) {
    const c = { ...defaultColors, ...colors };
    const [open, setOpen] = useState(() => expandWhileRunning && phase === "running");

    useEffect(() => {
        if (phase === "done") {
            setOpen(false);
        }
    }, [phase]);

    if (steps.length === 0) {
        return null;
    }

    return (
        <Collapsible
            className="group min-w-0 w-fit max-w-sm"
            onOpenChange={setOpen}
            open={open}
        >
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
                    className="size-3.5 shrink-0 transition-transform group-data-[state=open]:rotate-180"
                />
            </CollapsibleTrigger>
            <CollapsibleContent className="agent-steps-collapsible-content overflow-hidden">
                <div className="flex flex-col gap-1.5 pt-1 pl-0.5 max-w-[250px]">
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
            </CollapsibleContent>
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
    colors?: CardColors;
}

/** Page control approval UI only — goes inside {@link AIMessageContent}. */
export function PageControlRequestCardContent({
    action,
    interactive,
    onAllow,
    onDeny,
    allowLabel = "Allow",
    denyLabel = "Deny",
    colors,
}: PageControlRequestCardContentProps) {
    const c = { ...defaultColors, ...colors };

    return (
        <div className="flex flex-col gap-2 py-1">
            <div className={cn("flex items-center gap-1.5 text-xs font-semibold", c.text)}>
                <MonitorIcon className={cn("size-3.5 shrink-0", c.icon)} />
                <span>Page control request</span>
            </div>
            <p className={cn("text-xs leading-relaxed", c.mutedText)}>{action}</p>
            {interactive && (onAllow || onDeny) ? (
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

export function PageControlCardContent({
    action,
    phase,
    result,
    onAllow,
    onDeny,
    onStop,
    onDismiss,
    colors,
}: Omit<PageControlCardProps, "steps">) {
    const c = { ...defaultColors, ...colors };
    const interactive = phase === "pending" && !!(onAllow || onDeny);

    if (phase === "pending") {
        return (
            <PageControlRequestCardContent
                action={action}
                allowLabel="Allow"
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

            {phase === "done" && result && (
                <div className={cn("flex items-start gap-1.5 text-xs leading-relaxed", c.mutedText)}>
                    {result.success ? (
                        <CheckIcon className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                    ) : (
                        <XIcon className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                    )}
                    <span>{result.data || (result.success ? "Completed" : "Failed")}</span>
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
}

/** Standalone card — its own AIMessage bubble. Pass an `avatar` prop for the assistant icon. */
export function PageControlCard({ avatar, from = "assistant", ...contentProps }: PageControlCardStandaloneProps) {
    const { steps, ...contentWithoutSteps } = contentProps;
    const c = { ...defaultColors, ...contentProps.colors };
    const showAgentSteps =
        (contentProps.phase === "running" || contentProps.phase === "done") &&
        steps &&
        steps.length > 0;

    return (
        <AIMessage from={from}>
            <div className="flex min-w-0 w-fit max-w-[80%] flex-col gap-1">
                {showAgentSteps && steps && (
                    <PageControlAgentStepsPanel
                        colors={c}
                        expandWhileRunning={false}
                        phase={
                            contentProps.phase === "done" ? "done" : "running"
                        }
                        steps={steps}
                    />
                )}
                <AIMessageContent>
                    <PageControlCardContent {...contentWithoutSteps} />
                </AIMessageContent>
            </div>
            {avatar}
        </AIMessage>
    );
}
