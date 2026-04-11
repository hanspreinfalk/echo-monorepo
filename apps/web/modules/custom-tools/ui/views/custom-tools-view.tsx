"use client";

import { api } from "@workspace/backend/_generated/api";
import { useQuery } from "convex/react";
import { Loader2Icon, PencilIcon, PlusIcon, Trash2Icon, WrenchIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";
import type { Doc } from "@workspace/backend/_generated/dataModel";
import { CustomToolFormDialog } from "../components/custom-tool-form-dialog";
import {
  DeleteCustomToolDialog,
  type CustomToolDeleteTarget,
} from "../components/delete-custom-tool-dialog";

type AgentCustomTool = Doc<"agentCustomTools">;

export const CustomToolsView = () => {
  const tools = useQuery(api.private.agentCustomTools.list);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AgentCustomTool | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CustomToolDeleteTarget | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const isLoading = tools === undefined;

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (tool: AgentCustomTool) => {
    setEditing(tool);
    setFormOpen(true);
  };

  const openDelete = (tool: AgentCustomTool) => {
    setDeleteTarget({ id: tool._id, name: tool.name });
    setDeleteOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-y-2 bg-muted p-8">
        <Loader2Icon className="text-muted-foreground animate-spin" />
        <p className="text-muted-foreground text-sm">Loading tools…</p>
      </div>
    );
  }

  return (
    <>
      <CustomToolFormDialog
        editing={editing}
        onOpenChange={setFormOpen}
        open={formOpen}
        tools={tools}
      />
      <DeleteCustomToolDialog
        onDeleted={() => setDeleteTarget(null)}
        onOpenChange={setDeleteOpen}
        open={deleteOpen}
        tool={deleteTarget}
      />

      <div className="flex min-h-screen flex-col bg-muted p-8">
        <div className="mx-auto w-full max-w-screen-md">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <h1 className="text-2xl md:text-4xl">Custom Tools</h1>
              <p className="text-muted-foreground">
                HTTP endpoints the support agent can call during chats.
              </p>
            </div>
            <Button className="shrink-0 gap-2" onClick={openCreate} size="default">
              <PlusIcon className="size-4" />
              New tool
            </Button>
          </div>

          <Separator className="my-8" />

          {tools.length === 0 ? (
            <Card className="border-dashed bg-background">
              <CardHeader className="text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted">
                  <WrenchIcon className="text-muted-foreground size-6" />
                </div>
                <CardTitle className="text-lg">No custom tools yet</CardTitle>
                <CardDescription>
                  Add a name, description, and endpoint. The agent sends optional
                  key-value parameters to your API.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center pb-8">
                <Button className="gap-2" onClick={openCreate}>
                  <PlusIcon className="size-4" />
                  Create your first tool
                </Button>
              </CardContent>
            </Card>
          ) : (
            <ul className="space-y-4">
              {tools.map((tool) => (
                <li key={tool._id}>
                  <Card className="bg-background">
                    <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-2">
                      <div className="min-w-0 space-y-1">
                        <CardTitle className="font-mono text-base">
                          {tool.name}
                        </CardTitle>
                        <CardDescription className="text-xs font-mono">
                          {tool.method} {tool.endpoint}
                        </CardDescription>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <Button
                          aria-label={`Edit ${tool.name}`}
                          onClick={() => openEdit(tool)}
                          size="icon"
                          variant="ghost"
                        >
                          <PencilIcon className="size-4" />
                        </Button>
                        <Button
                          aria-label={`Delete ${tool.name}`}
                          onClick={() => openDelete(tool)}
                          size="icon"
                          variant="ghost"
                        >
                          <Trash2Icon className="size-4 text-destructive" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-0">
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {tool.description}
                      </p>
                      {(tool.argumentFields?.length ?? 0) > 0 ? (
                        <p className="text-muted-foreground text-xs">
                          Arguments:{" "}
                          <span className="font-mono text-foreground">
                            {(tool.argumentFields ?? [])
                              .map((f) => {
                                const t = f.type ?? "string";
                                const hasShape =
                                  (t === "array" || t === "object") &&
                                  (f.schema?.trim().length ?? 0) > 0;
                                const req = f.required === true ? ", required" : "";
                                return `${f.name} (${t}${req}${hasShape ? ", shape" : ""})`;
                              })
                              .join(", ")}
                          </span>
                        </p>
                      ) : (
                        <p className="text-muted-foreground text-xs">
                          Arguments:{" "}
                          <span className="font-mono text-foreground">any</span>{" "}
                          (free-form{" "}
                          <span className="font-mono">parameters</span>)
                        </p>
                      )}
                      {tool.headers && tool.headers.length > 0 ? (
                        <p className="text-muted-foreground text-xs">
                          {tool.headers.length} custom header
                          {tool.headers.length === 1 ? "" : "s"}
                        </p>
                      ) : null}
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
};
