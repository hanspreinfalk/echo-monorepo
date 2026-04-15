"use client";

import type { PublicFile } from "@workspace/backend/private/files";
import { api } from "@workspace/backend/_generated/api";
import { Button } from "@workspace/ui/components/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@workspace/ui/components/dialog";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import { useAction, useQuery } from "convex/react";
import { Loader2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type KnowledgeBaseEditorDialogProps = {
    file: PublicFile | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export const KnowledgeBaseEditorDialog = ({
    file,
    open,
    onOpenChange,
}: KnowledgeBaseEditorDialogProps) => {
    const updateText = useAction(api.private.files.updateKnowledgeEntryText);
    const editorState = useQuery(
        api.private.files.getKnowledgeEntryForEditor,
        open && file ? { entryId: file.id } : "skip",
    );

    const [draft, setDraft] = useState("");
    const [saveError, setSaveError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!open || !file) {
            return;
        }
        if (editorState?.text === undefined) {
            return;
        }
        setDraft(editorState.text);
    }, [open, file?.id, editorState?.text]);

    useEffect(() => {
        if (!open) {
            setSaveError(null);
        }
    }, [open]);

    const handleSave = async () => {
        if (!file) {
            return;
        }
        setSaving(true);
        setSaveError(null);
        try {
            const result = await updateText({ entryId: file.id, text: draft });
            if (result.embeddingsRefreshed) {
                toast.success("Knowledge base updated", {
                    description:
                        "Indexed text was saved and search embeddings were regenerated.",
                });
            } else {
                toast.message("No changes", {
                    description:
                        "Text matches what was already indexed; embeddings were left as-is.",
                });
            }
            onOpenChange(false);
        } catch (e) {
            setSaveError(e instanceof Error ? e.message : "Failed to save");
        } finally {
            setSaving(false);
        }
    };

    const ready = editorState?.status === "ready";

    return (
        <Dialog onOpenChange={onOpenChange} open={open}>
            <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
                <DialogHeader className="shrink-0 space-y-1 border-b px-6 py-4 text-left">
                    <DialogTitle>Edit knowledge base</DialogTitle>
                    <DialogDescription>
                        Edits search text only; the uploaded file is unchanged.
                    </DialogDescription>
                </DialogHeader>

                <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
                    <div className="space-y-4">
                        {editorState === undefined ? (
                            <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                <Loader2Icon className="size-4 animate-spin" />
                                Loading document text…
                            </div>
                        ) : editorState === null ? (
                            <p className="text-destructive text-sm">
                                Could not load this document.
                            </p>
                        ) : (
                            <>
                                <div className="space-y-1">
                                    <p className="font-medium text-sm">
                                        {editorState.title ??
                                            editorState.filename}
                                    </p>
                                    <p className="font-mono text-muted-foreground text-xs">
                                        {editorState.filename}
                                    </p>
                                    {!ready ? (
                                        <p className="text-amber-600 text-sm dark:text-amber-500">
                                            Still processing. Text may be
                                            incomplete until indexing finishes.
                                        </p>
                                    ) : null}
                                </div>
                                <div className="flex min-h-0 flex-col gap-2">
                                    <Label htmlFor="kb-text">
                                        Indexed text{" "}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Textarea
                                        className="max-h-[min(24rem,50vh)] min-h-[220px] resize-y overflow-y-auto font-mono text-sm leading-relaxed"
                                        id="kb-text"
                                        onChange={(e) =>
                                            setDraft(e.target.value)
                                        }
                                        spellCheck
                                        value={draft}
                                    />
                                </div>
                            </>
                        )}
                        {saveError ? (
                            <p className="text-destructive text-sm">
                                {saveError}
                            </p>
                        ) : null}
                    </div>
                </div>

                <div
                    className="flex shrink-0 flex-row items-center justify-end gap-2 rounded-b-xl border-t bg-muted/50 px-6 py-3"
                    data-slot="dialog-footer"
                >
                    <Button
                        disabled={saving}
                        onClick={() => onOpenChange(false)}
                        type="button"
                        variant="outline"
                    >
                        Cancel
                    </Button>
                    <Button
                        disabled={
                            saving ||
                            editorState === undefined ||
                            editorState === null
                        }
                        onClick={() => void handleSave()}
                        type="button"
                    >
                        {saving ? "Saving…" : "Save"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
