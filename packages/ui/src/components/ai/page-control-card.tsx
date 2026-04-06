import { CheckIcon, Loader2Icon, MonitorIcon, XIcon } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { AIMessage, AIMessageContent } from "@workspace/ui/components/ai/message";
import type { ReactNode } from "react";

export type PageControlAgentStep = { stepIndex: number; goal: string; actionName: string };

export interface CardColors {
    /** Heading text. Defaults to "text-foreground". */
    text?: string;
    /** Secondary / description text. Defaults to "text-muted-foreground". */
    mutedText?: string;
    /** Monitor icon. Defaults to "text-primary". */
    icon?: string;
    /** Step bullet dot. Defaults to "bg-primary/50". */
    stepDot?: string;
}

const defaultColors: Required<CardColors> = {
    text: "text-foreground",
    mutedText: "text-muted-foreground",
    icon: "text-primary",
    stepDot: "bg-primary/50",
};

export interface PageControlCardProps {
    action: string;
    phase: "pending" | "running" | "done";
    steps?: PageControlAgentStep[];
    result?: { success: boolean; data: string };
    /** If omitted the card is read-only (observer / dashboard mode). */
    onAllow?: () => Promise<void> | void;
    onDeny?: () => Promise<void> | void;
    onDismiss?: () => void;
    colors?: CardColors;
}

/** Inner content only — embed inside an existing AIMessageContent bubble. */
export function PageControlCardContent({
    action,
    phase,
    steps,
    result,
    onAllow,
    onDeny,
    onDismiss,
    colors,
}: PageControlCardProps) {
    const c = { ...defaultColors, ...colors };
    const interactive = phase === "pending" && (onAllow || onDeny);

    return (
        <div className="flex flex-col gap-2 py-1">
            {/* Header */}
            <div className="flex items-center justify-between gap-2">
                <div className={cn("flex items-center gap-1.5 text-xs font-semibold", c.text)}>
                    <MonitorIcon className={cn("size-3.5 shrink-0", c.icon)} />
                    <span>
                        {phase === "pending"
                            ? "Page control request"
                            : phase === "running"
                            ? "Working on page…"
                            : "Done"}
                    </span>
                </div>
                {phase === "done" && onDismiss && (
                    <button
                        onClick={onDismiss}
                        className={cn("transition", c.mutedText)}
                    >
                        <XIcon className="size-3.5" />
                    </button>
                )}
            </div>

            {/* Action description */}
            <p className={cn("text-xs leading-relaxed", c.mutedText)}>{action}</p>

            {/* Pending — interactive (widget) */}
            {interactive && (
                <div className="flex gap-2 pt-0.5">
                    <button
                        onClick={() => onAllow?.()}
                        className="flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition hover:opacity-90"
                    >
                        <CheckIcon className="size-3" /> Allow
                    </button>
                    <button
                        onClick={() => onDeny?.()}
                        className={cn(
                            "flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium transition hover:bg-muted",
                            c.mutedText
                        )}
                    >
                        <XIcon className="size-3" /> Deny
                    </button>
                </div>
            )}

            {/* Pending — read-only (dashboard observer) */}
            {phase === "pending" && !interactive && (
                <p className={cn("text-xs italic", c.mutedText)}>Awaiting user approval…</p>
            )}

            {/* Running / done: step log */}
            {(phase === "running" || phase === "done") && steps && steps.length > 0 && (
                <div className="flex flex-col gap-1 pt-0.5">
                    {steps.map((step, i) => (
                        <div
                            key={i}
                            className={cn("flex items-start gap-1.5 text-xs", c.mutedText)}
                        >
                            <span className={cn("mt-1 size-1.5 shrink-0 rounded-full", c.stepDot)} />
                            <span>{step.goal || step.actionName}</span>
                        </div>
                    ))}
                </div>
            )}

            {phase === "running" && (
                <div className={cn("flex items-center gap-1.5 text-xs", c.mutedText)}>
                    <Loader2Icon className="size-3 animate-spin" />
                    <span>Working…</span>
                </div>
            )}

            {phase === "done" && result && (
                <div
                    className={cn(
                        "flex items-center gap-1.5 text-xs font-medium",
                        result.success ? "text-green-500" : "text-destructive"
                    )}
                >
                    {result.success ? (
                        <><CheckIcon className="size-3.5" /> {result.data || "Completed"}</>
                    ) : (
                        <><XIcon className="size-3.5" /> {result.data || "Failed"}</>
                    )}
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
    return (
        <AIMessage from={from}>
            <AIMessageContent>
                <PageControlCardContent {...contentProps} />
            </AIMessageContent>
            {avatar}
        </AIMessage>
    );
}

