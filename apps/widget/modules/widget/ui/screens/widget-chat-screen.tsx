"use client";

import { AISuggestion, AISuggestions } from "@workspace/ui/components/ai/suggestion";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { useThreadMessages } from "@convex-dev/agent/react";
import { WidgetHeader } from "@/modules/widget/ui/components/widget-header";
import { Button } from "@workspace/ui/components/button";
import { useAtomValue, useSetAtom } from "jotai";
import {
    ArrowLeftIcon,
    Camera,
    CheckIcon,
    FileIcon,
    Loader2Icon,
    MenuIcon,
    PaperclipIcon,
    Trash2Icon,
    WrenchIcon,
    XIcon,
} from "lucide-react";
import { useInfiniteScroll } from "@workspace/ui/hooks/use-infinite-scroll";
import { InfiniteScrollTrigger } from "@workspace/ui/components/infinite-scroll-trigger";
import { contactSessionIdAtomFamily, conversationIdAtom, organizationIdAtom, screenAtom } from "../../atoms/widget-atoms";
import { useAction, useMutation, useQuery } from "convex/react";
import { Id } from "@workspace/backend/_generated/dataModel";
import { api } from "@workspace/backend/_generated/api";
import { Form, FormField } from "@workspace/ui/components/form";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@workspace/ui/components/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
    AIConversation,
    AIConversationContent,
    AIConversationScrollButton,
} from "@workspace/ui/components/ai/conversation";
import {
    AIInput,
    AIInputButton,
    AIInputSubmit,
    AIInputTextarea,
    AIInputToolbar,
    AIInputTools,
} from "@workspace/ui/components/ai/input";
import {
    AIMessage,
    AIMessageContent,
} from "@workspace/ui/components/ai/message";
import { AIResponse } from "@workspace/ui/components/ai/response";
import { MessageSenderBadge } from "@workspace/ui/components/ai/message-sender-badge";
import {
    type ChatMessageAttribution,
    injectPageControlStepRows,
    labelForAgentTool,
    threadMessagesToSeparateChatRows,
    toolRowIsComplete,
} from "@workspace/ui/lib/agent-thread-chat-rows";
import {
    formatAttachmentMarkdownLink,
    parseMessageAttachments,
} from "@workspace/ui/lib/attachment-markdown";
import { cn } from "@workspace/ui/lib/utils";
import { motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    PageAgentStepsToolCard,
    PageControlCard,
} from "@workspace/ui/components/ai/page-control-card";
import type { Doc } from "@workspace/backend/_generated/dataModel";
import {
    useAuthoredContent,
    useWidgetStrings,
} from "@/modules/widget/hooks/use-widget-i18n";

const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024; // 10 MB

interface AttachedFile {
    id: string;
    name: string;
    mimeType: string;
    size: number;
    storageId?: string;
    url?: string | null;
    uploading: boolean;
    error?: string;
}

const IMAGE_MIME_TYPE_PREFIX = "image/";
const IMAGE_FILE_EXTENSION_REGEX = /\.(png|jpe?g|webp|gif|bmp|svg)$/i;

function isImageAttachment(fileName: string, mimeType?: string) {
    if (mimeType?.startsWith(IMAGE_MIME_TYPE_PREFIX)) return true;
    return IMAGE_FILE_EXTENSION_REGEX.test(fileName);
}

/** Message timestamp for chat bubbles. */
function formatMessageTime(createdAt: Date) {
    return createdAt.toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
}

const formSchema = z.object({
    message: z.string(),
});

function WidgetPageControlRow({
    row,
    request,
    contactSessionId,
    resolvePageControlRequest,
}: {
    row: { id: string; createdAt: Date; action: string; attribution: ChatMessageAttribution };
    request: Doc<"pageControlRequests">;
    contactSessionId: Id<"contactSessions">;
    resolvePageControlRequest: (args: {
        requestId: Id<"pageControlRequests">;
        contactSessionId: Id<"contactSessions">;
        decision: "approved" | "denied";
    }) => Promise<unknown>;
}) {
    const [acceptSubmitted, setAcceptSubmitted] = useState(false);

    useEffect(() => {
        setAcceptSubmitted(false);
    }, [request._id]);

    const onAllow =
        request.status === "pending"
            ? async () => {
                  setAcceptSubmitted(true);
                  try {
                      await resolvePageControlRequest({
                          requestId: request._id,
                          contactSessionId,
                          decision: "approved",
                      });
                      window.parent.postMessage(
                          {
                              type: "page-agent-execute",
                              payload: { action: request.action, requestId: request._id },
                          },
                          "*",
                      );
                  } catch {
                      setAcceptSubmitted(false);
                  }
              }
            : undefined;
    const onDeny =
        request.status === "pending"
            ? async () => {
                  await resolvePageControlRequest({
                      requestId: request._id,
                      contactSessionId,
                      decision: "denied",
                  });
              }
            : undefined;
    const pageControlTime =
        row.createdAt != null ? (
            <p className="mt-0.5 w-max max-w-full shrink-0 grow-0 basis-auto self-end text-right text-[10px] leading-none text-muted-foreground tabular-nums">
                {formatMessageTime(row.createdAt)}
            </p>
        ) : null;
    const actionLabel = request.action || row.action;

    return (
        <motion.div
            className="w-full"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
                type: "spring",
                stiffness: 420,
                damping: 32,
                mass: 0.85,
            }}
        >
            <PageControlCard
                acceptSubmitted={acceptSubmitted}
                action={actionLabel}
                from="assistant"
                leadContent={
                    <MessageSenderBadge
                        attribution={row.attribution}
                        className="self-start"
                    />
                }
                onAllow={onAllow}
                onDeny={onDeny}
                requestStatus={request.status}
                requestTrailing={pageControlTime}
            />
        </motion.div>
    );
}

export const WidgetChatScreen = () => {
    const setScreen = useSetAtom(screenAtom);
    const setConversationId = useSetAtom(conversationIdAtom);
    const { t } = useWidgetStrings();
    const authoredContent = useAuthoredContent();

    const conversationId = useAtomValue(conversationIdAtom);
    const organizationId = useAtomValue(organizationIdAtom);
    const contactSessionId = useAtomValue(
        contactSessionIdAtomFamily(organizationId || "")
    );

    const onBack = () => {
        setConversationId(null);
        setScreen("selection");
    };

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const deleteConversation = useMutation(api.public.conversations.deleteConversation);

    const handleDeleteConversation = async () => {
        if (!conversationId || !contactSessionId) return;
        setIsDeleting(true);
        try {
            await deleteConversation({ conversationId, contactSessionId });
            setIsDeleteDialogOpen(false);
            onBack();
        } catch (error) {
            console.error(error);
        } finally {
            setIsDeleting(false);
        }
    };

    const suggestions = useMemo(() => {
        // Pull from the language-matched authored content — keeps suggestion
        // order stable across languages (suggestion1 → 2 → 3).
        const s = authoredContent.defaultSuggestions;
        return [s.suggestion1, s.suggestion2, s.suggestion3];
    }, [authoredContent.defaultSuggestions]);

    const conversation = useQuery(
        api.public.conversations.getOne,
        conversationId && contactSessionId
            ? {
                conversationId,
                contactSessionId,
            }
            : "skip"
    );

    const messages = useThreadMessages(
        api.public.messages.getMany,
        conversation?.threadId && contactSessionId
            ? {
                threadId: conversation.threadId,
                contactSessionId,
            }
            : "skip",
        { initialNumItems: 10 },
    );

    const { topElementRef, handleLoadMore, canLoadMore, isLoadingMore } = useInfiniteScroll({
        status: messages.status,
        loadMore: messages.loadMore,
        loadSize: 10,
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            message: "",
        },
    });

    const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
    const [attachmentError, setAttachmentError] = useState<string | null>(null);
    const [screenshotPending, setScreenshotPending] = useState(false);
    const pendingScreenshotRequestIdRef = useRef<string | null>(null);
    const screenshotTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const pageControlRequests = useQuery(
        api.public.conversations.getPageControlRequests,
        conversationId && contactSessionId
            ? { conversationId, contactSessionId }
            : "skip"
    ) ?? [];

    const requestsById = useMemo(
        () => new Map(pageControlRequests.map((r) => [r._id as string, r])),
        [pageControlRequests]
    );

    const addStep = useMutation(api.public.conversations.addPageControlStep);
    const setResult = useMutation(api.public.conversations.setPageControlResult);
    const resolvePageControlRequest = useMutation(api.public.conversations.resolvePageControlRequest);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const storeAttachment = useAction(api.public.messages.storeAttachment);

    const uploadFileToAttachments = useCallback(
        async (file: File) => {
            if (!contactSessionId) return;

            if (file.size > MAX_ATTACHMENT_SIZE) {
                setAttachmentError(t("chat.attachmentTooLarge", { name: file.name }));
                return;
            }

            const localId = crypto.randomUUID();
            setAttachedFiles((prev) => [
                ...prev,
                {
                    id: localId,
                    name: file.name,
                    mimeType: file.type || "application/octet-stream",
                    size: file.size,
                    uploading: true,
                },
            ]);

            try {
                const bytes = await file.arrayBuffer();
                const result = await storeAttachment({
                    bytes,
                    filename: file.name,
                    mimeType: file.type || "application/octet-stream",
                    contactSessionId,
                });
                setAttachedFiles((prev) =>
                    prev.map((f) =>
                        f.id === localId
                            ? {
                                  ...f,
                                  storageId: result.storageId,
                                  url: result.url,
                                  uploading: false,
                              }
                            : f,
                    ),
                );
            } catch (error) {
                console.error(error);
                setAttachedFiles((prev) =>
                    prev.map((f) =>
                        f.id === localId
                            ? { ...f, uploading: false, error: "Upload failed" }
                            : f,
                    ),
                );
            }
        },
        [contactSessionId, storeAttachment, t],
    );

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        e.target.value = "";
        setAttachmentError(null);
        if (!files.length || !contactSessionId) return;

        for (const file of files) {
            await uploadFileToAttachments(file);
        }
    };

    const handleScreenshotClick = () => {
        setAttachmentError(null);
        if (!contactSessionId) return;
        if (window.parent === window.self) {
            setAttachmentError(t("chat.screenshotNotEmbedded"));
            return;
        }
        const requestId = crypto.randomUUID();
        pendingScreenshotRequestIdRef.current = requestId;
        setScreenshotPending(true);
        if (screenshotTimeoutRef.current) {
            clearTimeout(screenshotTimeoutRef.current);
        }
        screenshotTimeoutRef.current = setTimeout(() => {
            if (pendingScreenshotRequestIdRef.current !== requestId) return;
            pendingScreenshotRequestIdRef.current = null;
            setScreenshotPending(false);
            setAttachmentError(t("chat.screenshotTimedOut"));
        }, 60_000);
        window.parent.postMessage(
            { type: "echo-request-host-screenshot", payload: { requestId } },
            "*",
        );
    };

    useEffect(() => {
        if (!contactSessionId) return;
        const handler = (event: MessageEvent) => {
            const { type, payload } = event.data ?? {};
            if (type === "agent-step" && payload?.requestId) {
                addStep({
                    requestId: payload.requestId as Id<"pageControlRequests">,
                    contactSessionId,
                    step: {
                        stepIndex: payload.stepIndex,
                        goal: payload.goal ?? "",
                        actionName: payload.actionName ?? "",
                    },
                }).catch(console.error);
            } else if (type === "agent-done" && payload?.requestId) {
                setResult({
                    requestId: payload.requestId as Id<"pageControlRequests">,
                    contactSessionId,
                    result: { success: payload.success, data: payload.data ?? "" },
                }).catch(console.error);
            } else if (type === "echo-host-screenshot-result" && payload?.requestId) {
                if (pendingScreenshotRequestIdRef.current !== payload.requestId) return;
                pendingScreenshotRequestIdRef.current = null;
                if (screenshotTimeoutRef.current) {
                    clearTimeout(screenshotTimeoutRef.current);
                    screenshotTimeoutRef.current = null;
                }
                setScreenshotPending(false);
                const bytes = payload.bytes as ArrayBuffer | undefined;
                if (!bytes) {
                    setAttachmentError(t("chat.screenshotDataMissing"));
                    return;
                }
                const mime = (payload.mimeType as string) || "image/png";
                const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
                const file = new File([new Blob([bytes], { type: mime })], `page-screenshot-${stamp}.png`, {
                    type: mime,
                });
                void uploadFileToAttachments(file);
            } else if (type === "echo-host-screenshot-error" && payload?.requestId) {
                if (pendingScreenshotRequestIdRef.current !== payload.requestId) return;
                pendingScreenshotRequestIdRef.current = null;
                if (screenshotTimeoutRef.current) {
                    clearTimeout(screenshotTimeoutRef.current);
                    screenshotTimeoutRef.current = null;
                }
                setScreenshotPending(false);
                setAttachmentError(
                    typeof payload.message === "string"
                        ? payload.message
                        : t("chat.screenshotFailedGeneric"),
                );
            }
        };
        window.addEventListener("message", handler);
        return () => {
            window.removeEventListener("message", handler);
            if (screenshotTimeoutRef.current) {
                clearTimeout(screenshotTimeoutRef.current);
            }
        };
    }, [contactSessionId, addStep, setResult, uploadFileToAttachments, t]);

    const handleRemoveAttachment = (id: string) => {
        setAttachedFiles(prev => prev.filter(f => f.id !== id));
    };

    const messageValue = form.watch('message');
    const isUploadingFiles = attachedFiles.some(f => f.uploading);
    const validAttachments = attachedFiles.filter(f => f.url && !f.error);
    const canSubmit = (messageValue.trim().length > 0 || validAttachments.length > 0) && !isUploadingFiles;

    const createMessage = useAction(api.public.messages.create);
    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (!conversation || !contactSessionId || !canSubmit) {
            return;
        }

        let prompt = values.message.trim();

        if (validAttachments.length > 0) {
            const attachmentText = validAttachments
                .map((f) => formatAttachmentMarkdownLink(f.name, f.url!))
                .join('\n');
            prompt = prompt ? `${prompt}\n\n${attachmentText}` : attachmentText;
        }

        form.reset();
        setAttachedFiles([]);

        await createMessage({
            threadId: conversation.threadId,
            prompt,
            contactSessionId,
        });
    };

    const isAiTyping = useQuery(
        api.public.conversations.getIsAiTyping,
        conversationId
            ? {
                conversationId,
            }
            : "skip"
    );

    const chatRows = useMemo(() => {
        const base = threadMessagesToSeparateChatRows(messages.results ?? []);
        return injectPageControlStepRows(base, (requestId) => {
            const r = requestsById.get(requestId);
            return r?.status === "approved";
        });
    }, [messages.results, requestsById]);

    return (
        <div className="flex h-full min-h-0 flex-1 flex-col">
            <Dialog onOpenChange={setIsDeleteDialogOpen} open={isDeleteDialogOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>{t("chat.deleteConversationTitle")}</DialogTitle>
                        <DialogDescription>
                            {t("chat.deleteConversationDescription")}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            disabled={isDeleting}
                            onClick={() => setIsDeleteDialogOpen(false)}
                            variant="outline"
                        >
                            {t("chat.cancel")}
                        </Button>
                        <Button
                            disabled={isDeleting}
                            onClick={handleDeleteConversation}
                            variant="destructive"
                        >
                            {isDeleting ? t("chat.deleting") : t("chat.delete")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <WidgetHeader className="flex items-center justify-between">
                <div className="flex items-center gap-x-2">
                    <Button
                        onClick={onBack}
                        size="icon"
                        variant="transparent"
                    >
                        <ArrowLeftIcon />
                    </Button>
                    <p>{t("chat.headerTitle")}</p>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="transparent">
                            <MenuIcon />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            variant="destructive"
                            onClick={() => setIsDeleteDialogOpen(true)}
                        >
                            <Trash2Icon className="size-4" />
                            {t("chat.delete")}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </WidgetHeader>
            <div className="flex min-h-0 flex-1 flex-col bg-muted">
            <AIConversation className="min-h-0 flex-1">
                <AIConversationContent>
                    <InfiniteScrollTrigger
                        canLoadMore={canLoadMore}
                        isLoadingMore={isLoadingMore}
                        onLoadMore={handleLoadMore}
                        ref={topElementRef}
                    />
                    {chatRows.map((row) => {
                        if (row.kind === "user") {
                        const parsed = parseMessageAttachments(row.content);
                        return (
                            <AIMessage
                                from="user"
                                key={row.id}
                            >
                                <div className="flex w-fit max-w-[80%] flex-col gap-2">
                                    {parsed.attachments.map((attachment, i) => (
                                        attachment.isImage ? (
                                            <a
                                                key={i}
                                                href={attachment.url}
                                                rel="noreferrer"
                                                target="_blank"
                                                className="block w-[220px] overflow-hidden rounded-lg border bg-background transition hover:opacity-90"
                                            >
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={attachment.url}
                                                    alt={attachment.name}
                                                    loading="lazy"
                                                    className="h-auto max-h-40 w-full object-cover"
                                                />
                                                <div className="border-t px-3 py-1.5 text-xs text-muted-foreground">
                                                    {attachment.name}
                                                </div>
                                            </a>
                                        ) : (
                                            <a
                                                key={i}
                                                href={attachment.url}
                                                rel="noreferrer"
                                                target="_blank"
                                                className="inline-flex w-fit items-center gap-1.5 rounded-full border bg-transparent px-2.5 py-1 text-xs font-medium text-foreground hover:opacity-90"
                                            >
                                                <FileIcon className="size-3 shrink-0 text-muted-foreground" />
                                                <span className="max-w-[180px] truncate">{attachment.name}</span>
                                            </a>
                                        )
                                    ))}
                                    {parsed.textContent && (
                                        <AIMessageContent>
                                            <AIResponse>{parsed.textContent}</AIResponse>
                                        </AIMessageContent>
                                    )}
                                    {row.createdAt != null && (
                                        <p className="mt-0.5 w-max max-w-full shrink-0 self-end text-right text-[10px] leading-none text-muted-foreground tabular-nums">
                                            {formatMessageTime(row.createdAt)}
                                        </p>
                                    )}
                                </div>
                            </AIMessage>
                        );
                        }

                        if (row.kind === "page-control-steps") {
                            if (!contactSessionId) {
                                return null;
                            }
                            const pcRequest = requestsById.get(row.requestId);
                            if (!pcRequest) {
                                return null;
                            }
                            const agentPhase =
                                pcRequest.status === "approved" && pcRequest.result
                                    ? "done"
                                    : "running";
                            const onAgentStop =
                                agentPhase === "running"
                                    ? () => {
                                          window.parent.postMessage(
                                              {
                                                  type: "page-agent-stop",
                                                  payload: { requestId: pcRequest._id },
                                              },
                                              "*",
                                          );
                                      }
                                    : undefined;
                            return (
                                <motion.div
                                    key={row.id}
                                    className="w-full"
                                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 420,
                                        damping: 32,
                                        mass: 0.85,
                                    }}
                                >
                                    <AIMessage from="assistant">
                                        <div className="flex min-w-0 w-fit max-w-[80%] flex-col items-start gap-1">
                                            <MessageSenderBadge
                                                attribution={row.attribution}
                                                className="self-start"
                                            />
                                            <PageAgentStepsToolCard
                                                expandWhileRunning
                                                onStop={onAgentStop}
                                                phase={agentPhase}
                                                steps={pcRequest.steps ?? []}
                                            />
                                            {row.createdAt != null && (
                                                <p className="mt-0.5 w-max max-w-full shrink-0 self-end text-right text-[10px] leading-none text-muted-foreground tabular-nums">
                                                    {formatMessageTime(row.createdAt)}
                                                </p>
                                            )}
                                        </div>
                                    </AIMessage>
                                </motion.div>
                            );
                        }

                        if (row.kind === "page-control") {
                            if (!contactSessionId) {
                                return null;
                            }
                            const request = requestsById.get(row.requestId);
                            if (!request) {
                                return null;
                            }
                            return (
                                <WidgetPageControlRow
                                    key={row.id}
                                    contactSessionId={contactSessionId}
                                    request={request}
                                    resolvePageControlRequest={resolvePageControlRequest}
                                    row={row}
                                />
                            );
                        }

                        if (row.kind === "system") {
                            return (
                                <AIMessage from="assistant" key={row.id}>
                                    <div className="flex flex-col gap-2">
                                        <MessageSenderBadge
                                            attribution={row.attribution}
                                            className="self-start"
                                        />
                                        <AIMessageContent>
                                            <AIResponse className="text-muted-foreground text-sm italic">
                                                {row.content}
                                            </AIResponse>
                                        </AIMessageContent>
                                        {row.createdAt != null && (
                                            <p className="mt-0.5 w-max max-w-full shrink-0 self-end text-right text-[10px] leading-none text-muted-foreground tabular-nums">
                                                {formatMessageTime(row.createdAt)}
                                            </p>
                                        )}
                                    </div>
                                </AIMessage>
                            );
                        }

                        if (row.kind === "tool") {
                            const done = toolRowIsComplete(row);
                            return (
                                <AIMessage from="assistant" key={row.id}>
                                    <div className="flex flex-col gap-1">
                                        <MessageSenderBadge
                                            attribution={row.attribution}
                                            className="self-start"
                                        />
                                        <div
                                            className="flex flex-col gap-1.5 rounded-lg border border-border/70 bg-muted/50 px-2.5 py-2"
                                            aria-label="Assistant tool"
                                        >
                                            {/* <p className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                                                <WrenchIcon className="size-3" />
                                                Tool
                                            </p> */}
                                            <div className="flex items-center gap-2 text-xs text-foreground/90">
                                                <span className="min-w-0 flex-1 leading-snug">
                                                    {labelForAgentTool(row.toolName)}
                                                </span>
                                                {done ? (
                                                    <CheckIcon
                                                        aria-hidden
                                                        className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-500"
                                                    />
                                                ) : (
                                                    <Loader2Icon
                                                        aria-hidden
                                                        className="size-3.5 shrink-0 animate-spin text-muted-foreground"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                        {row.createdAt != null && (
                                            <p className="mt-0.5 w-max max-w-full shrink-0 self-end text-right text-[10px] leading-none text-muted-foreground tabular-nums">
                                                {formatMessageTime(row.createdAt)}
                                            </p>
                                        )}
                                    </div>
                                </AIMessage>
                            );
                        }

                        const parsed = parseMessageAttachments(row.text);
                        return (
                            <AIMessage from="assistant" key={row.id}>
                                <div className="flex flex-col gap-2">
                                    <MessageSenderBadge
                                        attribution={row.attribution}
                                        className="self-start"
                                    />
                                    {parsed.attachments.map((attachment, i) => (
                                        attachment.isImage ? (
                                            <a
                                                key={i}
                                                href={attachment.url}
                                                rel="noreferrer"
                                                target="_blank"
                                                className="block max-w-[260px] overflow-hidden rounded-lg border bg-background transition hover:opacity-90"
                                            >
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={attachment.url}
                                                    alt={attachment.name}
                                                    loading="lazy"
                                                    className="h-auto max-h-48 w-full object-cover"
                                                />
                                                <div className="border-t px-3 py-1.5 text-xs text-muted-foreground">
                                                    {attachment.name}
                                                </div>
                                            </a>
                                        ) : (
                                            <a
                                                key={i}
                                                href={attachment.url}
                                                rel="noreferrer"
                                                target="_blank"
                                                className="inline-flex w-fit items-center gap-1.5 rounded-full border bg-transparent px-2.5 py-1 text-xs font-medium text-foreground hover:opacity-90"
                                            >
                                                <FileIcon className="size-3 shrink-0 text-muted-foreground" />
                                                <span className="max-w-[180px] truncate">{attachment.name}</span>
                                            </a>
                                        )
                                    ))}
                                    {parsed.textContent && (
                                        <AIMessageContent>
                                            <AIResponse>{parsed.textContent}</AIResponse>
                                        </AIMessageContent>
                                    )}
                                    {row.createdAt != null && (
                                        <p className="mt-0.5 w-max max-w-full shrink-0 self-end text-right text-[10px] leading-none text-muted-foreground tabular-nums">
                                            {formatMessageTime(row.createdAt)}
                                        </p>
                                    )}
                                </div>
                            </AIMessage>
                        );
                    })}
                    {isAiTyping && (
                        <AIMessage from="assistant">
                            <div className="flex min-w-0 max-w-[80%] flex-col gap-1 self-start">
                                <MessageSenderBadge
                                    attribution={{ kind: "bot" }}
                                    className="self-start"
                                />
                            <AIMessageContent>
                                <div className="flex items-center gap-1 py-0.5">
                                    <span className="size-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
                                    <span className="size-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
                                    <span className="size-1.5 animate-bounce rounded-full bg-current" />
                                </div>
                            </AIMessageContent>
                            </div>
                        </AIMessage>
                    )}
                </AIConversationContent>
                <AIConversationScrollButton />
            </AIConversation>
            {messages.results?.length === 1 && (
                <AISuggestions className="flex w-full flex-col items-end p-2">
                    {suggestions.map((suggestion) => {
                        if (!suggestion) {
                            return null;
                        }

                        return (
                            <AISuggestion
                                key={suggestion}
                                onClick={() => {
                                    form.setValue("message", suggestion, {
                                        shouldValidate: true,
                                        shouldDirty: true,
                                        shouldTouch: true,
                                    });
                                    form.handleSubmit(onSubmit)();
                                }}
                                suggestion={suggestion}
                            />
                        )
                    })}
                </AISuggestions>
            )}
            </div>
            <div className="relative">
                <input
                    accept=".pdf,.txt,.csv,.doc,.docx,.png,.jpg,.jpeg,.webp"
                    className="hidden"
                    multiple
                    onChange={handleFileSelect}
                    ref={fileInputRef}
                    type="file"
                />
                {attachedFiles.length > 0 && (
                    <div className="pointer-events-none absolute bottom-[calc(100%+0.005rem)] left-0 right-0 z-10">
                        <div className="pointer-events-auto flex flex-wrap gap-1.5 border bg-background/95 p-2 shadow-sm backdrop-blur-sm">
                            {attachedFiles.map(file => (
                                <div
                                    key={file.id}
                                    className={cn(
                                        "overflow-hidden rounded-md border text-xs font-medium",
                                        file.error
                                            ? "border-destructive/40 bg-destructive/10 text-destructive"
                                            : "bg-transparent text-foreground"
                                    )}
                                >
                                    {isImageAttachment(file.name, file.mimeType) && !file.error ? (
                                        <div className="relative">
                                            {file.url ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={file.url}
                                                    alt={file.name}
                                                    className="h-18 w-18 object-cover"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="flex h-18 w-18 items-center justify-center bg-muted/50">
                                                    <Loader2Icon className="size-4 animate-spin text-muted-foreground" />
                                                </div>
                                            )}
                                            {!file.uploading && (
                                                <button
                                                    className="absolute right-1 top-1 rounded-full bg-background/90 p-0.5 hover:text-destructive"
                                                    onClick={() => handleRemoveAttachment(file.id)}
                                                    type="button"
                                                >
                                                    <XIcon className="size-3" />
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5 px-2.5 py-1">
                                            {file.uploading ? (
                                                <Loader2Icon className="size-3 animate-spin text-muted-foreground" />
                                            ) : (
                                                <FileIcon className="size-3 shrink-0 text-muted-foreground" />
                                            )}
                                            <span className="max-w-[140px] truncate">
                                                {file.error ? `${file.name} (failed)` : file.name}
                                            </span>
                                            {!file.uploading && (
                                                <button
                                                    className="ml-0.5 rounded-full hover:text-destructive"
                                                    onClick={() => handleRemoveAttachment(file.id)}
                                                    type="button"
                                                >
                                                    <XIcon className="size-3" />
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                <Form {...form}>
                    <AIInput
                        className="rounded-none border-x-0 border-b-0"
                        onSubmit={form.handleSubmit(onSubmit)}
                    >
                        <FormField
                            control={form.control}
                            disabled={conversation?.status === "resolved"}
                            name="message"
                            render={({ field }) => (
                                <AIInputTextarea
                                    disabled={conversation?.status === "resolved"}
                                    onChange={field.onChange}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            form.handleSubmit(onSubmit)();
                                        }
                                    }}
                                    placeholder={
                                        conversation?.status === "resolved"
                                            ? t("chat.conversationResolved")
                                            : t("chat.typeYourMessage")
                                    }
                                    value={field.value}
                                />
                            )}
                        />
                        {attachmentError && (
                            <p className="px-3 pb-1 text-xs text-destructive">{attachmentError}</p>
                        )}
                        <AIInputToolbar>
                            <AIInputTools>
                                <AIInputButton
                                    disabled={conversation?.status === "resolved"}
                                    onClick={() => fileInputRef.current?.click()}
                                    type="button"
                                >
                                    <PaperclipIcon />
                                    {t("chat.attach")}
                                </AIInputButton>
                                <AIInputButton
                                    disabled={
                                        conversation?.status === "resolved" ||
                                        screenshotPending ||
                                        isUploadingFiles
                                    }
                                    onClick={handleScreenshotClick}
                                    type="button"
                                >
                                    <Camera />
                                    {t("chat.screenshot")}
                                </AIInputButton>
                            </AIInputTools>
                            <AIInputSubmit
                                disabled={conversation?.status === "resolved" || !canSubmit}
                                status="ready"
                                type="submit"
                            />
                        </AIInputToolbar>
                    </AIInput>
                </Form>
            </div>
        </div>
    );
};
