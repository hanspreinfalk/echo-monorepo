'use client'

import { useInfiniteScroll } from "@workspace/ui/hooks/use-infinite-scroll";
import { InfiniteScrollTrigger } from "@workspace/ui/components/infinite-scroll-trigger";
import { useRef, useState, useMemo } from "react";
import { useThreadMessages, toUIMessages } from "@convex-dev/agent/react";
import { Id } from "@workspace/backend/_generated/dataModel";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Button } from "@workspace/ui/components/button";
import { FileIcon, Loader2Icon, MoreHorizontalIcon, PaperclipIcon, Wand2Icon, XIcon } from "lucide-react";
import { PageControlCardContent } from "@workspace/ui/components/ai/page-control-card";
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
import { Form, FormField } from "@workspace/ui/components/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DicebearAvatar } from "@workspace/ui/components/dicebear-avatar";
import { ConversationStatusButton } from "../components/conversation-status-button";
import { cn } from "@workspace/ui/lib/utils";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { toast } from "sonner";

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

interface ParsedAttachment {
    name: string;
    url: string;
    isImage: boolean;
}

const IMAGE_MIME_TYPE_PREFIX = "image/";
const IMAGE_FILE_EXTENSION_REGEX = /\.(png|jpe?g|webp|gif|bmp|svg)$/i;

function isImageAttachment(fileName: string, mimeType?: string) {
    if (mimeType?.startsWith(IMAGE_MIME_TYPE_PREFIX)) {
        return true;
    }
    return IMAGE_FILE_EXTENSION_REGEX.test(fileName);
}

function parseMessageAttachments(content: string): {
    textContent: string;
    attachments: ParsedAttachment[];
} {
    const attachmentRegex = /\[📎\s*([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
    const attachments: ParsedAttachment[] = [];

    const textContent = content
        .replace(attachmentRegex, (_match, name: string, url: string) => {
            attachments.push({
                name,
                url,
                isImage: isImageAttachment(name),
            });
            return "";
        })
        .replace(/\n{3,}/g, "\n\n")
        .trim();

    return { textContent, attachments };
}

const formSchema = z.object({
    message: z.string(),
})

export function ConversationIdView({ conversationId }: { conversationId: Id<"conversations"> }) {
    const conversation = useQuery(api.private.conversations.getOne, {
        conversationId,
    });

    const messages = useThreadMessages(
        api.private.messages.getMany,
        conversation?.threadId ? { threadId: conversation.threadId } : "skip",
        { initialNumItems: 10 }
    );

    const { topElementRef, handleLoadMore, canLoadMore, isLoadingMore } = useInfiniteScroll({
        status: messages.status,
        loadMore: messages.loadMore,
        loadSize: 10
    })

    const allPageControlRequests = useQuery(
        api.private.conversations.getLatestPageControlRequest,
        { conversationId }
    );
    const requestsById = useMemo(
        () => new Map(allPageControlRequests ? [[allPageControlRequests._id as string, allPageControlRequests]] : []),
        [allPageControlRequests]
    );

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            message: "",
        },
    });

    const [isEnhancing, setIsEnhancing] = useState(false);
    const enhanceResponse = useAction(api.private.messages.enhanceResponse)
    const handleEnhanceResponse = async () => {
        setIsEnhancing(true);
        const currentValue = form.getValues('message');

        try {
            const response = await enhanceResponse({ prompt: currentValue })

            form.setValue('message', response);
        } catch (error) {
            toast.error("Something went wrong");
            console.error(error)
        } finally {
            setIsEnhancing(false);
        }
    }

    const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const storeAttachment = useAction(api.private.messages.storeAttachment);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        e.target.value = '';
        if (!files.length) return;

        for (const file of files) {
            if (file.size > MAX_ATTACHMENT_SIZE) {
                toast.error(`"${file.name}" exceeds the 10 MB limit.`);
                continue;
            }

            const localId = crypto.randomUUID();
            setAttachedFiles(prev => [...prev, {
                id: localId,
                name: file.name,
                mimeType: file.type || 'application/octet-stream',
                size: file.size,
                uploading: true,
            }]);

            try {
                const bytes = await file.arrayBuffer();
                const result = await storeAttachment({
                    bytes,
                    filename: file.name,
                    mimeType: file.type || 'application/octet-stream',
                });
                setAttachedFiles(prev => prev.map(f =>
                    f.id === localId
                        ? { ...f, storageId: result.storageId, url: result.url, uploading: false }
                        : f
                ));
            } catch (error) {
                console.error(error);
                setAttachedFiles(prev => prev.map(f =>
                    f.id === localId
                        ? { ...f, uploading: false, error: 'Upload failed' }
                        : f
                ));
            }
        }
    };

    const handleRemoveAttachment = (id: string) => {
        setAttachedFiles(prev => prev.filter(f => f.id !== id));
    };

    const messageValue = form.watch('message');
    const isUploadingFiles = attachedFiles.some(f => f.uploading);
    const validAttachments = attachedFiles.filter(f => f.url && !f.error);
    const canSubmit = (messageValue.trim().length > 0 || validAttachments.length > 0) && !isUploadingFiles;

    const createMessage = useMutation(api.private.messages.create)
    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (!canSubmit) return;

        let prompt = values.message.trim();

        if (validAttachments.length > 0) {
            const attachmentText = validAttachments
                .map(f => `[📎 ${f.name}](${f.url})`)
                .join('\n');
            prompt = prompt ? `${prompt}\n\n${attachmentText}` : attachmentText;
        }

        try {
            await createMessage({
                conversationId,
                prompt,
            });

            form.reset();
            setAttachedFiles([]);
        } catch (error) {
            console.error(error);
        }
    }

    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const updateConversationStatus = useMutation(api.private.conversations.updateStatus)
    const handleToggleStatus = async () => {
        if (!conversation) {
            return;
        }

        setIsUpdatingStatus(true);

        let newStatus: "unresolved" | "resolved" | "escalated";

        if (conversation.status === "unresolved") {
            newStatus = "escalated";
        } else if (conversation.status === "escalated") {
            newStatus = "resolved"
        } else {
            newStatus = "unresolved";
        }

        try {
            await updateConversationStatus({
                conversationId,
                status: newStatus,
            })
        } catch (error) {
            console.error(error);
        } finally {
            setIsUpdatingStatus(false);
        }
    }

    if (conversation === undefined || messages.status === "LoadingFirstPage") {
        return <ConversationIdViewLoading />
    }

    return (
        <div className="flex h-full flex-col bg-muted">
            <header className="flex items-center justify-between border-b bg-background p-2.5">
                <Button
                    size="sm"
                    variant="ghost"
                >
                    <MoreHorizontalIcon />
                </Button>
                {!!conversation && (
                    <ConversationStatusButton
                        onClick={handleToggleStatus}
                        status={conversation.status}
                        disabled={isUpdatingStatus}
                    />
                )}
            </header>
            <AIConversation className="max-h-[calc(100vh-180px)]">
                <AIConversationContent>
                    <InfiniteScrollTrigger 
                        canLoadMore={canLoadMore}
                        isLoadingMore={isLoadingMore}
                        onLoadMore={handleLoadMore}
                        ref={topElementRef}
                    />
                    {toUIMessages(messages.results ?? [])?.map((message) => {
                        // Detect page control marker — render card inline
                        const markerMatch = message.content.match(/^\[PAGE_CONTROL_REQUEST:(\{.*\})\]$/);
                        if (markerMatch?.[1]) {
                            try {
                                const { id } = JSON.parse(markerMatch[1]) as { id: string };
                                const req = requestsById.get(id);
                                if (req) {
                                    const phase =
                                        req.status === "denied" ? "done"
                                        : req.status === "approved" && req.result ? "done"
                                        : req.status === "approved" ? "running"
                                        : "pending";
                                    const result =
                                        req.status === "denied"
                                            ? { success: false, data: "Denied by user" }
                                            : req.result ?? undefined;
                                    return (
                                        <AIMessage from="user" key={message.id}>
                                            <div className="border bg-background text-foreground px-4 py-3 rounded-lg">
                                                <PageControlCardContent
                                                    action={req.action}
                                                    phase={phase}
                                                    steps={req.steps}
                                                    result={result}
                                                />
                                            </div>
                                        </AIMessage>
                                    );
                                }
                            } catch { /* fall through */ }
                        }

                        const parsedMessage = parseMessageAttachments(message.content);
                        return (
                            <AIMessage
                                // In reverse, because we are watching from "assistant" perspective
                                from={message.role === "user" ? "assistant" : "user"}
                                key={message.id}
                            >
                                <div className="flex flex-col gap-2">
                                    {parsedMessage.attachments.map((attachment, index) => (
                                        attachment.isImage ? (
                                            <a
                                                key={`${message.id}-attachment-${index}`}
                                                href={attachment.url}
                                                rel="noreferrer"
                                                target="_blank"
                                                className="block overflow-hidden rounded-lg border bg-background transition hover:opacity-90"
                                            >
                                                {/* eslint-disable-next-line @next/next/no-img-element -- dynamic Convex storage URLs */}
                                                <img
                                                    src={attachment.url}
                                                    alt={attachment.name}
                                                    loading="lazy"
                                                    className="h-auto max-h-64 w-full object-cover"
                                                />
                                                <div className="border-t px-3 py-1.5 text-xs text-muted-foreground">
                                                    {attachment.name}
                                                </div>
                                            </a>
                                        ) : (
                                            <a
                                                key={`${message.id}-attachment-${index}`}
                                                href={attachment.url}
                                                rel="noreferrer"
                                                target="_blank"
                                                className="inline-flex w-fit items-center gap-1.5 rounded-full border bg-transparent px-2.5 py-1 text-xs font-medium text-foreground hover:opacity-90"
                                            >
                                                <FileIcon className="size-3 shrink-0 text-muted-foreground" />
                                                <span className="max-w-[220px] truncate">{attachment.name}</span>
                                            </a>
                                        )
                                    ))}
                                    {parsedMessage.textContent && (
                                        <AIMessageContent>
                                            <AIResponse>{parsedMessage.textContent}</AIResponse>
                                        </AIMessageContent>
                                    )}
                                </div>
                                {message.role === "user" && (
                                    <DicebearAvatar 
                                        seed={conversation?.contactSessionId ?? "user"}
                                        size={32}
                                    />
                                )}
                            </AIMessage>
                        );
                    })}
                </AIConversationContent>
                <AIConversationScrollButton />
            </AIConversation>

            <div className="relative p-2">
                <input
                    accept=".pdf,.txt,.csv,.doc,.docx,.png,.jpg,.jpeg,.webp"
                    className="hidden"
                    multiple
                    onChange={handleFileSelect}
                    ref={fileInputRef}
                    type="file"
                />
                {attachedFiles.length > 0 && (
                    <div className="pointer-events-none absolute bottom-[calc(100%+0.005rem)] left-2 right-2 z-10">
                        <div className="pointer-events-auto flex flex-wrap gap-1.5 rounded-md border bg-background/95 p-2 shadow-sm backdrop-blur-sm">
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
                                                // eslint-disable-next-line @next/next/no-img-element -- local attachment preview
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
                    <AIInput onSubmit={form.handleSubmit(onSubmit)}>
                        <FormField 
                            control={form.control}
                            disabled={conversation?.status === "resolved"}
                            name="message"
                            render={({ field }) => (
                                <AIInputTextarea 
                                    disabled={
                                        conversation?.status === "resolved" || 
                                        form.formState.isSubmitting ||
                                        isEnhancing
                                    }
                                    onChange={field.onChange}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            form.handleSubmit(onSubmit)();
                                        }
                                    }}
                                    placeholder={
                                        conversation?.status === "resolved" ? "This conversation has been resolved." : "Type your response as an operator..."
                                    }
                                    value={field.value}
                                />
                            )}
                        />
                        <AIInputToolbar>
                            <AIInputTools>
                                <AIInputButton
                                    disabled={conversation?.status === "resolved" || form.formState.isSubmitting}
                                    onClick={() => fileInputRef.current?.click()}
                                    type="button"
                                >
                                    <PaperclipIcon />
                                    Attach
                                </AIInputButton>
                                <AIInputButton 
                                    onClick={handleEnhanceResponse}
                                    disabled={
                                        conversation?.status === "resolved" || 
                                        isEnhancing || 
                                        !messageValue.trim()
                                    }
                                >
                                    <Wand2Icon />
                                    {isEnhancing ? "Enhancing..." : "Enhance"}
                                </AIInputButton>
                            </AIInputTools>
                            <AIInputSubmit 
                                disabled={
                                    conversation?.status === "resolved" || 
                                    form.formState.isSubmitting || 
                                    !canSubmit ||
                                    isEnhancing
                                }
                                status="ready"
                                type="submit"
                            />
                        </AIInputToolbar>
                    </AIInput>
                </Form>
            </div>
        </div>
    )
}

export function ConversationIdViewLoading() {
    return (
        <div className="flex h-full flex-col bg-muted">
            <header className="flex items-center justify-between border-b bg-background p-2.5">
                <Button disabled size="sm" variant="ghost">
                    <MoreHorizontalIcon />
                </Button>
            </header>
            <AIConversation className="max-h-[calc(100vh-180px)]">
                <AIConversationContent>
                    {Array.from({ length: 8 }, (_, index) => {
                        const isUser = index % 2 === 0;
                        const widths = ['w-48', 'w-60', 'w-72']
                        const width = widths[index % widths.length]

                        return (
                            <div
                                className={cn(
                                    "group flex w-full items-end justify-end gap-2 py-2 [&>div]:max-w-[80%]",
                                    isUser ? "is-user" : "is-assistant flex-row-reverse"
                                )}
                                key={index}
                            >
                                <Skeleton className={`h-9 ${width} rounded-lg bg-neutral-200`} />
                                <Skeleton className="size-8 rounded-full bg-neutral-200" /> 
                            </div>
                        )
                    })}
                </AIConversationContent>
            </AIConversation>

            <div className="p-2">
                <AIInput>
                    <AIInputTextarea 
                        disabled 
                        placeholder="Type your response as an operator..."
                    />
                    <AIInputToolbar>
                        <AIInputTools />
                        <AIInputSubmit disabled status="ready" />
                    </AIInputToolbar>
                </AIInput>
            </div>
        </div>
    )
}