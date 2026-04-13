"use client";

import { useMutation } from "convex/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Checkbox } from "@workspace/ui/components/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@workspace/ui/components/dialog";
import { Label } from "@workspace/ui/components/label";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Textarea } from "@workspace/ui/components/textarea";
import { api } from "@workspace/backend/_generated/api";
import type { Id } from "@workspace/backend/_generated/dataModel";
import { toast } from "sonner";

export type ResolveIssueAffectedRow = {
    id: Id<"contactSessions">;
    name: string;
    email: string;
};

export type ResolveIssueTarget = {
    id: Id<"issues">;
    title: string;
    affectedSessions: ResolveIssueAffectedRow[];
};

/** Keep in sync with `issueResolvedAssistantMessage` in `packages/backend/convex/private/issues.ts`. */
export function resolveNotificationPreviewForTitle(title: string): string {
    const trimmed = title.trim();
    if (trimmed.length === 0) {
        return "Good news — we've marked the issue you reported as resolved on our side. If anything still isn't right, just reply here and we'll take another look.";
    }
    return `Good news — we've marked your report as resolved on our side (${trimmed}). If anything still isn't right, just reply here and we'll take another look.`;
}

type ResolveIssueDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    issue: ResolveIssueTarget | null;
    onResolved?: () => void;
};

export const ResolveIssueDialog = ({
    open,
    onOpenChange,
    issue,
    onResolved,
}: ResolveIssueDialogProps) => {
    const resolveAndNotify = useMutation(
        api.private.issues.resolveAndNotifyAffectedChats,
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedSessionIds, setSelectedSessionIds] = useState<
        Set<Id<"contactSessions">>
    >(() => new Set());
    const [assistantMessageDraft, setAssistantMessageDraft] = useState("");
    const lastInitKeyRef = useRef<string>("");

    useEffect(() => {
        if (!open || !issue) {
            if (!open) {
                lastInitKeyRef.current = "";
            }
            return;
        }
        const sessionKey = issue.affectedSessions.map((s) => s.id).join(",");
        const initKey = `${issue.id}:${sessionKey}:${issue.title}`;
        if (lastInitKeyRef.current === initKey) {
            return;
        }
        lastInitKeyRef.current = initKey;
        setSelectedSessionIds(
            new Set(issue.affectedSessions.map((s) => s.id)),
        );
        setAssistantMessageDraft(
            resolveNotificationPreviewForTitle(issue.title),
        );
    }, [open, issue]);

    const toggleSession = useCallback((id: Id<"contactSessions">) => {
        setSelectedSessionIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    const selectAllSessions = useCallback(() => {
        if (!issue) {
            return;
        }
        setSelectedSessionIds(
            new Set(issue.affectedSessions.map((s) => s.id)),
        );
    }, [issue]);

    const selectNoSessions = useCallback(() => {
        setSelectedSessionIds(new Set());
    }, []);

    const handleConfirm = async () => {
        if (!issue) {
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await resolveAndNotify({
                issueId: issue.id,
                notifyContactSessionIds: Array.from(selectedSessionIds),
                assistantMessage: assistantMessageDraft,
            });
            if (result.alreadyResolved) {
                toast.message("Already resolved", {
                    description: "This issue was already marked resolved.",
                });
            } else if (result.notifiedConversationCount > 0) {
                toast.success("Issue resolved", {
                    description: `The assistant notified ${result.notifiedConversationCount} conversation${result.notifiedConversationCount === 1 ? "" : "s"} in chat.`,
                });
            } else {
                toast.success("Issue resolved", {
                    description:
                        selectedSessionIds.size === 0
                            ? "No visitors were selected for chat — only the issue status was updated."
                            : "No linked chats were found for the selected visitors — only the issue status was updated.",
                });
            }
            onResolved?.();
            onOpenChange(false);
        } catch (error) {
            console.error(error);
            toast.error("Could not resolve issue", {
                description:
                    error instanceof Error ? error.message : "Please try again.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const sessionRows = issue?.affectedSessions ?? [];
    const hasSessions = sessionRows.length > 0;

    return (
        <Dialog onOpenChange={onOpenChange} open={open}>
            <DialogContent className="flex max-h-[min(90vh,40rem)] max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
                <div className="flex shrink-0 flex-col gap-2 px-4 pt-4 pr-12">
                    <DialogHeader className="space-y-2 text-left">
                        <DialogTitle>Mark issue as resolved?</DialogTitle>
                        <DialogDescription>
                            Pick who gets the assistant message below. 
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-4 py-4">
                    {issue && (
                        <div className="shrink-0 rounded-lg border bg-muted/50 p-4">
                            <p className="font-medium">{issue.title}</p>
                        </div>
                    )}

                    {issue && hasSessions ? (
                        <div className="flex shrink-0 flex-col gap-2">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <Label className="text-sm font-medium">
                                    Notify the user
                                </Label>
                                <div className="flex gap-2">
                                    <Button
                                        className="h-8 px-2 text-xs"
                                        onClick={selectAllSessions}
                                        type="button"
                                        variant="outline"
                                    >
                                        All
                                    </Button>
                                    <Button
                                        className="h-8 px-2 text-xs"
                                        onClick={selectNoSessions}
                                        type="button"
                                        variant="outline"
                                    >
                                        None
                                    </Button>
                                </div>
                            </div>
                            <ScrollArea className="max-h-40 rounded-md border">
                                <ul className="divide-y p-2">
                                    {sessionRows.map((row) => {
                                        const checked =
                                            selectedSessionIds.has(row.id);
                                        const boxId = `resolve-notify-${row.id}`;
                                        return (
                                            <li key={row.id}>
                                                <div className="flex items-start gap-3 py-2 pr-2 pl-1">
                                                    <Checkbox
                                                        checked={checked}
                                                        className="mt-0.5"
                                                        id={boxId}
                                                        onCheckedChange={() => {
                                                            toggleSession(
                                                                row.id,
                                                            );
                                                        }}
                                                    />
                                                    <Label
                                                        className="min-w-0 flex-1 cursor-pointer"
                                                        htmlFor={boxId}
                                                    >
                                                        <span className="block text-sm leading-snug font-medium text-foreground">
                                                            {row.name?.trim() ||
                                                                "Visitor"}
                                                        </span>
                                                        <span className="text-muted-foreground mt-0.5 block text-xs leading-snug font-normal">
                                                            {row.email?.trim() ||
                                                                "No email"}
                                                        </span>
                                                    </Label>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </ScrollArea>
                        </div>
                    ) : issue ? (
                        <p className="text-muted-foreground text-sm">
                            No linked visitor sessions — only the issue status will
                            change. You can still mark it resolved.
                        </p>
                    ) : null}

                    {issue ? (
                        <div className="flex shrink-0 flex-col gap-2">
                            <Label
                                className="text-sm font-medium"
                                htmlFor="resolve-assistant-message"
                            >
                                Message to send
                            </Label>
                            <Textarea
                                className="max-h-[min(40vh,18rem)] min-h-[7rem] resize-y overflow-y-auto text-sm leading-relaxed [field-sizing:fixed] focus-visible:border-input focus-visible:ring-0"
                                id="resolve-assistant-message"
                                onChange={(e) =>
                                    setAssistantMessageDraft(e.target.value)
                                }
                                placeholder={resolveNotificationPreviewForTitle(
                                    issue.title,
                                )}
                                value={assistantMessageDraft}
                            />
                            <p className="text-muted-foreground text-xs">
                                Sent as the assistant. Edit to customize the message.
                            </p>
                        </div>
                    ) : null}
                </div>

                <DialogFooter className="mx-0 mb-0 flex shrink-0 flex-row flex-wrap items-center justify-end gap-2 rounded-b-xl border-t border-border bg-background px-4 py-3.5">
                    <Button
                        disabled={isSubmitting}
                        onClick={() => onOpenChange(false)}
                        variant="outline"
                    >
                        Cancel
                    </Button>
                    <Button
                        disabled={isSubmitting || !issue}
                        onClick={handleConfirm}
                    >
                        {isSubmitting ? "Saving…" : "Mark resolved"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
