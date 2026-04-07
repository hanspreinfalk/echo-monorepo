import { CheckIcon, Loader2Icon, XIcon } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { AIMessage, AIMessageContent } from "@workspace/ui/components/ai/message";
import type { ReactNode } from "react";
import type { CardColors, PageControlAgentStep } from "@workspace/ui/components/ai/page-control-card";

const defaultColors: Required<CardColors> = {
    text: "text-foreground",
    mutedText: "text-muted-foreground",
    icon: "text-primary",
};

function stepRowIsDone(
    index: number,
    total: number,
    phase: "running" | "done"
): boolean {
    if (phase === "done") return true;
    return total > 1 && index < total - 1;
}

export interface AgentStepsCardProps {
    steps?: PageControlAgentStep[];
    phase: "running" | "done";
    result?: { success: boolean; data: string };
    /** Avatar node rendered alongside the bubble (app-specific). */
    avatar?: ReactNode;
    /** Which side the bubble appears on. Defaults to "assistant". */
    from?: "user" | "assistant";
    colors?: CardColors;
}

/** Read-only card showing agent execution steps and final result. */
export function AgentStepsCard({ steps, phase, result, avatar, from = "assistant", colors }: AgentStepsCardProps) {
    const c = { ...defaultColors, ...colors };

    return (
        <AIMessage from={from}>
            <AIMessageContent>
                <div className="flex flex-col gap-2 py-1">
                    {steps && steps.length > 0 && (
                        <div className="flex flex-col gap-1.5">
                            {steps.map((step, i) => {
                                const done = stepRowIsDone(i, steps.length, phase);
                                return (
                                    <div
                                        key={step.stepIndex}
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
            </AIMessageContent>
            {avatar}
        </AIMessage>
    );
}
