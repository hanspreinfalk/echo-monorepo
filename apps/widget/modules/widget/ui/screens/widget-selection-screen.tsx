'use client'

import { WidgetHeader } from "@/modules/widget/ui/components/widget-header"
import {
    contactSessionIdAtomFamily,
    conversationIdAtom,
    errorMessageAtom,
    organizationIdAtom,
    screenAtom,
    widgetSettingsAtom,
} from "@/modules/widget/atoms/widget-atoms"
import { Button } from "@workspace/ui/components/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@workspace/ui/components/dialog"
import { DicebearAvatar } from "@workspace/ui/components/dicebear-avatar"
import { Spinner } from "@workspace/ui/components/spinner"
import { ChevronRightIcon, ImageIcon, LogOutIcon, MessageSquareTextIcon, XIcon } from "lucide-react"
import { useAtomValue, useSetAtom } from "jotai"
import { useMutation, usePaginatedQuery } from "convex/react"
import { api } from "@workspace/backend/_generated/api"
import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { ConversationStatusIcon } from "@workspace/ui/components/conversation-status-icon"
import { useInfiniteScroll } from "@workspace/ui/hooks/use-infinite-scroll"
import { InfiniteScrollTrigger } from "@workspace/ui/components/infinite-scroll-trigger"
import { formatConversationLastMessagePreview } from "@workspace/ui/lib/conversation-last-message-preview"
import { useWidgetStrings } from "@/modules/widget/hooks/use-widget-i18n"

export function WidgetSelectionScreen() {
    const setScreen = useSetAtom(screenAtom)
    const setErrorMessage = useSetAtom(errorMessageAtom)
    const setConversationId = useSetAtom(conversationIdAtom)
    const { t } = useWidgetStrings()

    const organizationId = useAtomValue(organizationIdAtom)
    const setContactSessionId = useSetAtom(contactSessionIdAtomFamily(organizationId || ""))
    const contactSessionId = useAtomValue(contactSessionIdAtomFamily(organizationId || ""))
    const widgetSettings = useAtomValue(widgetSettingsAtom)
    const showBrandLogo = widgetSettings?.showLogo !== false
    const logoUrl = widgetSettings?.logoUrl?.trim()
    const hasCustomLogo = Boolean(logoUrl)

    const createConversation = useMutation(api.public.conversations.create)
    const [isPending, setIsPending] = useState(false)
    const [isSignOutDialogOpen, setIsSignOutDialogOpen] = useState(false)

    const conversations = usePaginatedQuery(
        api.public.conversations.getMany,
        contactSessionId
            ? {
                  contactSessionId,
              }
            : "skip",
        {
            initialNumItems: 10,
        },
    )

    const { topElementRef, handleLoadMore, canLoadMore, isLoadingMore } = useInfiniteScroll({
        status: conversations.status,
        loadMore: conversations.loadMore,
        loadSize: 10,
    })

    const handleNewConversation = async () => {
        if (!organizationId) {
            setScreen("error")
            setErrorMessage(t("error.missingOrgId"))
            return
        }

        if (!contactSessionId) {
            setScreen("auth")
            return
        }

        setIsPending(true)

        try {
            const conversationId = await createConversation({
                organizationId,
                contactSessionId,
            })

            setConversationId(conversationId)
            setScreen("chat")
        } catch {
            setScreen("auth")
        } finally {
            setIsPending(false)
        }
    }

    const handleConfirmSignOut = () => {
        setContactSessionId(null)
        setConversationId(null)
        setErrorMessage(null)
        setIsSignOutDialogOpen(false)
        setScreen("auth")
    }

    const conversationRows = conversations.results ?? []
    const isLoadingConversations =
        Boolean(contactSessionId) && conversations.status === "LoadingFirstPage"
    const showRecentSection =
        Boolean(contactSessionId) &&
        (conversationRows.length > 0 ||
            isLoadingConversations ||
            conversations.status === "LoadingMore")

    return (
        <>
            <Dialog onOpenChange={setIsSignOutDialogOpen} open={isSignOutDialogOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>{t("selection.signOutTitle")}</DialogTitle>
                        <DialogDescription>
                            {t("selection.signOutDescription")}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={() => setIsSignOutDialogOpen(false)} variant="outline">
                            {t("selection.cancel")}
                        </Button>
                        <Button onClick={handleConfirmSignOut} variant="destructive">
                            {t("selection.signOut")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <WidgetHeader className="relative">
                <div className="absolute top-3 right-3 z-10 flex items-center gap-1">
                    {contactSessionId ? (
                        <Button
                            aria-label={t("selection.signOutAria")}
                            className="rounded-full hover:bg-primary-foreground/10"
                            onClick={() => setIsSignOutDialogOpen(true)}
                            size="icon-lg"
                            type="button"
                            variant="transparent"
                        >
                            <LogOutIcon aria-hidden className="size-[18px]" />
                        </Button>
                    ) : null}
                    <Button
                        aria-label="Close"
                        className="rounded-full hover:bg-primary-foreground/10"
                        onClick={() => window.parent.postMessage({ type: 'close' }, '*')}
                        size="icon-lg"
                        type="button"
                        variant="transparent"
                    >
                        <XIcon aria-hidden className="size-[18px]" />
                    </Button>
                </div>
                <div className="flex flex-col gap-3 py-2 pr-14">
                    {showBrandLogo ? (
                        hasCustomLogo ? (
                            <DicebearAvatar
                                className="border-0 bg-primary-foreground/10 after:border-0"
                                imageUrl={logoUrl}
                                seed="assistant"
                                size={44}
                            />
                        ) : (
                            <div
                                className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary-foreground/10 text-primary-foreground/50"
                                role="img"
                                aria-label="Logo placeholder"
                            >
                                <ImageIcon className="size-5" aria-hidden />
                            </div>
                        )
                    ) : null}
                    <div className="flex flex-col gap-1">
                        <h1 className="text-pretty text-2xl font-semibold tracking-tight">
                            {t("greeting.title")}
                        </h1>
                        <p className="text-pretty text-sm leading-relaxed text-primary-foreground/75">
                            {t("greeting.subtitleExtended")}
                        </p>
                    </div>
                </div>
            </WidgetHeader>
            <div className="flex flex-1 flex-col gap-6 overflow-y-auto bg-background p-5">
                <Button
                    variant="outline"
                    className="group/button h-12 w-full justify-between gap-3 rounded-lg border-border/80 bg-background px-3.5 text-left shadow-xs hover:bg-muted/40"
                    onClick={handleNewConversation}
                    disabled={isPending}
                >
                    <span className="flex min-w-0 flex-1 items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground [&_svg]:size-4">
                            {isPending ? (
                                <Spinner className="size-4 text-muted-foreground" />
                            ) : (
                                <MessageSquareTextIcon aria-hidden className="text-foreground/80" />
                            )}
                        </span>
                        <span className="truncate text-sm font-medium text-foreground">
                            {isPending ? t("selection.oneMoment") : t("selection.chatWithUs")}
                        </span>
                    </span>
                    {!isPending ? (
                        <ChevronRightIcon
                            aria-hidden
                            className="size-4 shrink-0 text-muted-foreground transition-[opacity,transform] duration-200 group-hover/button:translate-x-0.5 group-hover/button:text-foreground"
                        />
                    ) : null}
                </Button>

                {showRecentSection ? (
                    <div className="flex flex-col gap-2">
                        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                            {t("selection.recentChats")}
                        </p>
                        <div className="flex flex-col gap-y-2">
                            {isLoadingConversations && conversationRows.length === 0 ? (
                                <div className="flex justify-center py-8">
                                    <Spinner className="size-6 text-muted-foreground" />
                                </div>
                            ) : null}
                            {conversationRows.map((conversation) => (
                                <Button
                                    className="h-20 w-full justify-between"
                                    key={conversation._id}
                                    onClick={() => {
                                        setConversationId(conversation._id)
                                        setScreen("chat")
                                    }}
                                    variant="outline"
                                >
                                    <div className="flex w-full flex-col gap-4 overflow-hidden text-start">
                                        <div className="flex w-full items-center justify-between gap-x-2">
                                            <p className="text-muted-foreground text-xs">{t("selection.chat")}</p>
                                            <p className="text-muted-foreground text-xs">
                                                {formatDistanceToNow(new Date(conversation._creationTime))}
                                            </p>
                                        </div>

                                        <div className="flex w-full items-center justify-between gap-x-2">
                                            <p className="truncate text-sm">
                                                {formatConversationLastMessagePreview(
                                                    conversation.lastMessage?.text,
                                                )}
                                            </p>
                                            <ConversationStatusIcon
                                                status={conversation.status}
                                                className="shrink-0"
                                            />
                                        </div>
                                    </div>
                                </Button>
                            ))}
                            <InfiniteScrollTrigger
                                canLoadMore={canLoadMore}
                                isLoadingMore={isLoadingMore}
                                onLoadMore={handleLoadMore}
                                ref={topElementRef}
                            />
                        </div>
                    </div>
                ) : null}
            </div>
        </>
    )
}
