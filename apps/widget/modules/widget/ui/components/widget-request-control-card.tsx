"use client";

import { CheckIcon, Loader2Icon, MonitorIcon, XIcon } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { cn } from "@workspace/ui/lib/utils";
import { AIMessage, AIMessageContent } from "@workspace/ui/components/ai/message";
import { DicebearAvatar } from "@workspace/ui/components/dicebear-avatar";

type ResolveArgs = Parameters<
    ReturnType<typeof useMutation<typeof api.public.conversations.resolvePageControlRequest>>
>[0];

export type AgentStep = { stepIndex: number; goal: string; actionName: string };
export type AgentExecution = {
    action: string;
    phase: "running" | "done";
    steps: AgentStep[];
    result?: { success: boolean; data: string };
};

export interface WidgetRequestControlCardProps {
    pendingRequest: { _id: ResolveArgs["requestId"]; action: string } | null;
    agentExecution: AgentExecution | null;
    contactSessionId: ResolveArgs["contactSessionId"];
    onApproved: (action: string) => void;
    onDismiss: () => void;
}

/** Inner content only — use this when embedding inside an existing AIMessage bubble. */
export function WidgetRequestControlCardContent({
    pendingRequest,
    agentExecution,
    contactSessionId,
    onApproved,
    onDismiss,
}: WidgetRequestControlCardProps) {
    const resolveRequest = useMutation(api.public.conversations.resolvePageControlRequest);

    const action = pendingRequest?.action ?? agentExecution?.action ?? "";
    const phase = pendingRequest ? "pending" : agentExecution?.phase;

    const handleDecision = async (decision: "approved" | "denied") => {
        if (!pendingRequest) return;
        await resolveRequest({ requestId: pendingRequest._id, contactSessionId, decision });
        if (decision === "approved") {
            onApproved(action);
            window.parent.postMessage({ type: "page-agent-execute", payload: { action } }, "*");
        } else {
            onDismiss();
        }
    };

    return (
        <div className="flex flex-col gap-2 border-t pt-2 mt-1">
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
                {phase === "done" && (
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

            {/* Pending: allow / deny */}
            {phase === "pending" && (
                <div className="flex gap-2 pt-0.5">
                    <button
                        onClick={() => handleDecision("approved")}
                        className="flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition hover:opacity-90"
                    >
                        <CheckIcon className="size-3" /> Allow
                    </button>
                    <button
                        onClick={() => handleDecision("denied")}
                        className="flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-muted"
                    >
                        <XIcon className="size-3" /> Deny
                    </button>
                </div>
            )}

            {/* Running / done: step log */}
            {(phase === "running" || phase === "done") && agentExecution && (
                <div className="flex flex-col gap-1 pt-0.5">
                    {agentExecution.steps.map((step) => (
                        <div
                            key={step.stepIndex}
                            className="flex items-start gap-1.5 text-xs text-muted-foreground"
                        >
                            <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary/50" />
                            <span>{step.goal || step.actionName}</span>
                        </div>
                    ))}
                    {phase === "running" && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Loader2Icon className="size-3 animate-spin" />
                            <span>Working…</span>
                        </div>
                    )}
                    {phase === "done" && agentExecution.result && (
                        <div className={cn(
                            "flex items-center gap-1.5 text-xs font-medium",
                            agentExecution.result.success
                                ? "text-green-600 dark:text-green-400"
                                : "text-destructive"
                        )}>
                            {agentExecution.result.success ? (
                                <><CheckIcon className="size-3.5" /> {agentExecution.result.data || "Completed"}</>
                            ) : (
                                <><XIcon className="size-3.5" /> {agentExecution.result.data || "Failed"}</>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

/** Standalone version — renders as its own AIMessage bubble (used when there's no prior assistant message to attach to). */
export function WidgetRequestControlCard(props: WidgetRequestControlCardProps) {
    return (
        <AIMessage from="assistant">
            <AIMessageContent>
                <WidgetRequestControlCardContent {...props} />
            </AIMessageContent>
            <DicebearAvatar imageUrl="/logo.svg" seed="assistant" size={32} />
        </AIMessage>
    );
}
