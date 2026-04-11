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

export type CustomToolDeleteTarget = {
  id: Id<"agentCustomTools">;
  name: string;
};

type DeleteCustomToolDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tool: CustomToolDeleteTarget | null;
  onDeleted?: () => void;
};

export const DeleteCustomToolDialog = ({
  open,
  onOpenChange,
  tool,
  onDeleted,
}: DeleteCustomToolDialogProps) => {
  const removeTool = useMutation(api.private.agentCustomTools.remove);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!tool) {
      return;
    }
    setIsDeleting(true);
    try {
      await removeTool({ toolId: tool.id });
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
          <DialogTitle>Delete custom tool</DialogTitle>
          <DialogDescription>
            The support agent will stop offering this tool. This does not affect
            past conversations.
          </DialogDescription>
        </DialogHeader>

        {tool && (
          <div className="py-2">
            <div className="rounded-lg border bg-muted/50 p-4">
              <p className="font-mono text-sm font-medium">{tool.name}</p>
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
            disabled={isDeleting || !tool}
            onClick={handleDelete}
            variant="destructive"
          >
            {isDeleting ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
