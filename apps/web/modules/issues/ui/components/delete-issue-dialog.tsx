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

export type IssueDeleteTarget = {
    id: Id<"issues">;
    title: string;
};

type DeleteIssueDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    issue: IssueDeleteTarget | null;
    onDeleted?: () => void;
};

export const DeleteIssueDialog = ({
    open,
    onOpenChange,
    issue,
    onDeleted,
}: DeleteIssueDialogProps) => {
    const removeIssue = useMutation(api.private.issues.remove);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!issue) {
            return;
        }

        setIsDeleting(true);
        try {
            await removeIssue({ issueId: issue.id });
            onDeleted?.();
            onOpenChange(false);
        } catch (error) {
            console.error(error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Dialog onOpenChange={onOpenChange} open={open}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Delete issue</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete this issue? This action cannot be
                        undone.
                    </DialogDescription>
                </DialogHeader>

                {issue && (
                    <div className="py-4">
                        <div className="rounded-lg border bg-muted/50 p-4">
                            <p className="font-medium">{issue.title}</p>
                        </div>
                    </div>
                )}

                <DialogFooter>
                    <Button
                        disabled={isDeleting}
                        onClick={() => onOpenChange(false)}
                        variant="outline"
                    >
                        Cancel
                    </Button>
                    <Button
                        disabled={isDeleting || !issue}
                        onClick={handleDelete}
                        variant="destructive"
                    >
                        {isDeleting ? "Deleting..." : "Delete"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
