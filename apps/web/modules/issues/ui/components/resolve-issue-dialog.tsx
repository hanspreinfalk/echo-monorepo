"use client";

import { useMutation } from "convex/react";
import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@workspace/ui/components/dialog";
import { api } from "@workspace/backend/_generated/api";
import type { Id } from "@workspace/backend/_generated/dataModel";
import { toast } from "sonner";

export type ResolveIssueTarget = {
    id: Id<"issues">;
    title: string;
    affectedSessionsCount: number;
};

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

    const handleConfirm = async () => {
        if (!issue) {
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await resolveAndNotify({ issueId: issue.id });
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
                        "No linked chats were found — only the issue status was updated.",
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

    const sessionCount = issue?.affectedSessionsCount ?? 0;

    return (
        <Dialog onOpenChange={onOpenChange} open={open}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Mark issue as resolved?</DialogTitle>
                    <DialogDescription>
                        This updates the issue for your team. When visitors are linked to this
                        report, the assistant will send them a short message in chat so they know
                        it&apos;s been resolved.
                    </DialogDescription>
                </DialogHeader>

                {issue && (
                    <div className="py-4">
                        <div className="rounded-lg border bg-muted/50 p-4">
                            <p className="font-medium">{issue.title}</p>
                            <p className="text-muted-foreground mt-2 text-sm">
                                {sessionCount === 0
                                    ? "No linked visitor sessions — only the issue status will change."
                                    : `${sessionCount} linked visitor session${sessionCount === 1 ? "" : "s"} will get an in-chat notice (every conversation tied to those sessions).`}
                            </p>
                        </div>
                    </div>
                )}

                <DialogFooter>
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
