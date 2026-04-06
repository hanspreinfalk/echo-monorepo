'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { useThreadMessages, toUIMessages } from "@convex-dev/agent/react"
import { WidgetHeader } from "@/modules/widget/ui/components/widget-header"
import { Button } from "@workspace/ui/components/button"
import { useAtomValue, useSetAtom } from "jotai"
import { ArrowLeftIcon, FileIcon, Loader2Icon, MenuIcon, PaperclipIcon, XIcon } from "lucide-react"
import { contactSessionIdAtomFamily, conversationIdAtom, organizationIdAtom, screenAtom, widgetSettingsAtom } from "@/modules/widget/atoms/widget-atoms"
import { api } from "@workspace/backend/_generated/api"
import { useAction, useQuery } from "convex/react"
import { Form, FormField } from "@workspace/ui/components/form"
import { DicebearAvatar } from "@workspace/ui/components/dicebear-avatar"
import { useInfiniteScroll } from "@workspace/ui/hooks/use-infinite-scroll"
import { InfiniteScrollTrigger } from "@workspace/ui/components/infinite-scroll-trigger"
import {
    AIConversation,
    AIConversationContent,
    AIConversationScrollButton,
} from "@workspace/ui/components/ai/conversation"
import {
    AIInput,
    AIInputButton,
    AIInputSubmit,
    AIInputTextarea,
    AIInputToolbar,
    AIInputTools
} from "@workspace/ui/components/ai/input"
import { AIResponse } from "@workspace/ui/components/ai/response"
import {
    AISuggestion,
    AISuggestions
} from "@workspace/ui/components/ai/suggestion"
import { AIMessage, AIMessageContent } from "@workspace/ui/components/ai/message"
import { useMemo, useRef, useState } from "react"
import { cn } from "@workspace/ui/lib/utils"

const MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024; // 5 MB

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

export function WidgetChatScreen() {
    const setScreen = useSetAtom(screenAtom)
    const setConversationId = useSetAtom(conversationIdAtom)

    const widgetSettings = useAtomValue(widgetSettingsAtom);
    const conversationId = useAtomValue(conversationIdAtom)
    const organizationId = useAtomValue(organizationIdAtom)
    const contactSessionId = useAtomValue(contactSessionIdAtomFamily(organizationId || ""))

    const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const onBack = () => {
        setConversationId(null)
        setScreen('selection')
    }

    const suggestions = useMemo(() => {
        if (!widgetSettings) {
            return [];
        }

        return Object.keys(widgetSettings.defaultSuggestions).map((key) => {
            return widgetSettings.defaultSuggestions[
                key as keyof typeof widgetSettings.defaultSuggestions
            ];
        });
    }, [widgetSettings]);

    const conversation = useQuery(
        api.public.conversations.getOne,
        conversationId && contactSessionId
            ? {
                conversationId,
                contactSessionId,
            } : "skip"
    )

    const messages = useThreadMessages(
        api.public.messages.getMany,
        conversation?.threadId && contactSessionId
            ? {
                threadId: conversation.threadId,
                contactSessionId,
            }
            : "skip",
        { initialNumItems: 10 }
    )

    const { topElementRef, handleLoadMore, canLoadMore, isLoadingMore } = useInfiniteScroll({
        status: messages.status,
        loadMore: messages.loadMore,
        loadSize: 10
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            message: "",
        }
    })

    const messageValue = form.watch('message');
    const isUploadingFiles = attachedFiles.some(f => f.uploading);
    const validAttachments = attachedFiles.filter(f => f.url && !f.error);
    const canSubmit = ((messageValue ?? "").trim().length > 0 || validAttachments.length > 0) && !isUploadingFiles;

    const createMessage = useAction(api.public.messages.create)
    const storeAttachment = useAction(api.public.messages.storeAttachment)

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        e.target.value = '';
        if (!files.length || !conversation || !contactSessionId) return;

        for (const file of files) {
            if (file.size > MAX_ATTACHMENT_SIZE) {
                console.warn(`File "${file.name}" exceeds the 5 MB limit.`);
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
                    threadId: conversation.threadId,
                    contactSessionId,
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

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (!conversation || !contactSessionId) {
            return;
        }

        if (!canSubmit) return;

        let prompt = (values.message ?? "").trim();

        if (validAttachments.length > 0) {
            const attachmentText = validAttachments
                .map(f => `[📎 ${f.name}](${f.url})`)
                .join('\n');
            prompt = prompt ? `${prompt}\n\n${attachmentText}` : attachmentText;
        }

        try {
            await createMessage({
                threadId: conversation.threadId,
                prompt,
                contactSessionId,
            });

            form.reset();
            setAttachedFiles([]);
        } catch (error) {
            console.error(error);
        }
    }

    const inputDisabled =
        conversation?.status === "resolved" ||
        form.formState.isSubmitting;

    return (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <WidgetHeader className="flex shrink-0 items-center justify-between">
                <div className="flex items-center gap-x-2">
                    <Button
                        size="icon"
                        variant="transparent"
                        onClick={onBack}
                    >
                        <ArrowLeftIcon />
                    </Button>
                    <p>Chat</p>
                </div>
                <Button
                    size="icon"
                    variant="transparent"
                >
                    <MenuIcon />
                </Button>
            </WidgetHeader>
            <AIConversation className="min-h-0 flex-1">
                <AIConversationContent>
                    <InfiniteScrollTrigger
                        canLoadMore={canLoadMore}
                        isLoadingMore={isLoadingMore}
                        onLoadMore={handleLoadMore}
                        ref={topElementRef}
                    />
                    {toUIMessages(messages.results ?? [])?.map((message) => (
                        (() => {
                            const parsedMessage = parseMessageAttachments(message.content);
                            const hasTextContent = parsedMessage.textContent.length > 0;
                            const hasOnlyImageAttachments =
                                !hasTextContent &&
                                parsedMessage.attachments.length > 0 &&
                                parsedMessage.attachments.every((attachment) => attachment.isImage);

                            return (
                                <AIMessage
                                    from={message.role === "user" ? "user" : "assistant"}
                                    key={message.id}
                                >
                                    {hasOnlyImageAttachments ? (
                                        <div className="flex flex-col gap-2">
                                            {parsedMessage.attachments.map((attachment, index) => (
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
                                            ))}
                                        </div>
                                    ) : (
                                        <AIMessageContent>
                                            {hasTextContent ? (
                                                <AIResponse>
                                                    {parsedMessage.textContent}
                                                </AIResponse>
                                            ) : null}
                                            {parsedMessage.attachments.length > 0 ? (
                                                <div className="mt-2 flex flex-col gap-2">
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
                                                </div>
                                            ) : null}
                                        </AIMessageContent>
                                    )}
                                    {message.role === "assistant" && (
                                        <DicebearAvatar
                                            imageUrl="/logo.svg"
                                            seed="assistant"
                                            size={32}
                                        />
                                    )}
                                </AIMessage>
                            );
                        })()
                    ))}
                </AIConversationContent>
                <AIConversationScrollButton />
            </AIConversation>
            {toUIMessages(messages.results ?? [])?.length === 1 && (
                <AISuggestions className="flex w-full shrink-0 flex-col items-end p-2">
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
            <div className="relative shrink-0 bg-background p-2">
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
                    <AIInput
                        className="rounded-md "
                        onSubmit={form.handleSubmit(onSubmit)}
                    >
                        <FormField
                            control={form.control}
                            disabled={inputDisabled}
                            name="message"
                            render={({ field }) => (
                                <AIInputTextarea
                                    disabled={inputDisabled}
                                    onChange={field.onChange}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            form.handleSubmit(onSubmit)();
                                        }
                                    }}
                                    placeholder={
                                        conversation?.status === "resolved"
                                            ? "This conversation has been resolved."
                                            : "Type your message..."
                                    }
                                    value={field.value ?? ""}
                                />
                            )}
                        />
                        <AIInputToolbar>
                            <AIInputTools>
                                <AIInputButton
                                    disabled={
                                        conversation?.status === "resolved" ||
                                        form.formState.isSubmitting ||
                                        !conversation ||
                                        !contactSessionId
                                    }
                                    onClick={() => fileInputRef.current?.click()}
                                    type="button"
                                >
                                    <PaperclipIcon />
                                    Attach
                                </AIInputButton>
                            </AIInputTools>
                            <AIInputSubmit
                                disabled={
                                    conversation?.status === "resolved" ||
                                    form.formState.isSubmitting ||
                                    !canSubmit
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
