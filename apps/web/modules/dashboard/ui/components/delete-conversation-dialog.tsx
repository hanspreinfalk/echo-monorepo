"use client";

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
import { useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Id } from "@workspace/backend/_generated/dataModel";

type DeleteConversationDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    conversationId: Id<"conversations"> | null;
    contactName?: string;
    onDeleted?: () => void;
};

export const DeleteConversationDialog = ({
    open,
    onOpenChange,
    conversationId,
    contactName,
    onDeleted,
}: DeleteConversationDialogProps) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const deleteConversation = useMutation(api.private.conversations.deleteConversation);

    const handleDelete = async () => {
        if (!conversationId) return;
        setIsDeleting(true);
        try {
            await deleteConversation({ conversationId });
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
                    <DialogTitle>Delete conversation</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete this conversation? All messages and
                        attachments will be permanently removed. This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>

                {contactName && (
                    <div className="py-4">
                        <div className="rounded-lg border bg-muted/50 p-4">
                            <p className="font-medium">{contactName}</p>
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
                        disabled={!conversationId || isDeleting}
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
