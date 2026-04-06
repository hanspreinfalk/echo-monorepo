import { CheckIcon, Loader2Icon, MonitorIcon, XIcon } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { AIMessage, AIMessageContent } from "@workspace/ui/components/ai/message";
import type { ReactNode } from "react";

export type PageControlAgentStep = { stepIndex: number; goal: string; actionName: string };

export interface PageControlCardProps {
    action: string;
    phase: "pending" | "running" | "done";
    steps?: PageControlAgentStep[];
    result?: { success: boolean; data: string };
    /** If omitted the card is read-only (observer / dashboard mode). */
    onAllow?: () => Promise<void> | void;
    onDeny?: () => Promise<void> | void;
    onDismiss?: () => void;
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
}: PageControlCardProps) {
    const interactive = phase === "pending" && (onAllow || onDeny);

    return (
        <div className="flex flex-col gap-2">
            {/* Header */}
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <MonitorIcon className="size-3.5 shrink-0 text-primary" />
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
                        className="text-muted-foreground transition hover:text-foreground"
                    >
                        <XIcon className="size-3.5" />
                    </button>
                )}
            </div>

            {/* Action description */}
            <p className="text-xs text-muted-foreground leading-relaxed">{action}</p>

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
                        className="flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-muted"
                    >
                        <XIcon className="size-3" /> Deny
                    </button>
                </div>
            )}

            {/* Pending — read-only (dashboard observer) */}
            {phase === "pending" && !interactive && (
                <p className="text-xs italic text-muted-foreground">Awaiting user approval…</p>
            )}

            {/* Running / done: step log */}
            {(phase === "running" || phase === "done") && steps && steps.length > 0 && (
                <div className="flex flex-col gap-1 pt-0.5">
                    {steps.map((step) => (
                        <div
                            key={step.stepIndex}
                            className="flex items-start gap-1.5 text-xs text-muted-foreground"
                        >
                            <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary/50" />
                            <span>{step.goal || step.actionName}</span>
                        </div>
                    ))}
                </div>
            )}

            {phase === "running" && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Loader2Icon className="size-3 animate-spin" />
                    <span>Working…</span>
                </div>
            )}

            {phase === "done" && result && (
                <div
                    className={cn(
                        "flex items-center gap-1.5 text-xs font-medium",
                        result.success ? "text-green-600 dark:text-green-400" : "text-destructive"
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
}

/** Standalone card — its own AIMessage bubble. Pass an `avatar` prop for the assistant icon. */
export function PageControlCard({ avatar, ...contentProps }: PageControlCardStandaloneProps) {
    return (
        <AIMessage from="assistant">
            <AIMessageContent>
                <PageControlCardContent {...contentProps} />
            </AIMessageContent>
            {avatar}
        </AIMessage>
    );
}
