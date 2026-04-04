"use client";

import { Button } from "@workspace/ui/components/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@workspace/ui/components/dialog";

export type IssueDeleteTarget = {
    id: string;
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
    const handleDelete = () => {
        onDeleted?.();
        onOpenChange(false);
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
                        onClick={() => onOpenChange(false)}
                        variant="outline"
                    >
                        Cancel
                    </Button>
                    <Button
                        disabled={!issue}
                        onClick={handleDelete}
                        variant="destructive"
                    >
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
