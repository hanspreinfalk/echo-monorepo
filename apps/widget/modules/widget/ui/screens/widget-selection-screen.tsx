'use client'

import { WidgetHeader } from "@/modules/widget/ui/components/widget-header"
import { contactSessionIdAtomFamily, conversationIdAtom, errorMessageAtom, organizationIdAtom, screenAtom, widgetSettingsAtom } from "@/modules/widget/atoms/widget-atoms"
import { Button } from "@workspace/ui/components/button"
import { DicebearAvatar } from "@workspace/ui/components/dicebear-avatar"
import { Spinner } from "@workspace/ui/components/spinner"
import { ChevronRightIcon, ImageIcon, MessageSquareTextIcon } from "lucide-react"
import { useAtomValue, useSetAtom } from "jotai"
import { useMutation } from "convex/react"
import { api } from "@workspace/backend/_generated/api"
import { useState } from "react"
import { WidgetFooter } from "../components/widget-footer"

export function WidgetSelectionScreen() {
    const setScreen = useSetAtom(screenAtom)
    const setErrorMessage = useSetAtom(errorMessageAtom)
    const setConversationId = useSetAtom(conversationIdAtom)

    const organizationId = useAtomValue(organizationIdAtom)
    const contactSessionId = useAtomValue(contactSessionIdAtomFamily(organizationId || ""))
    const widgetSettings = useAtomValue(widgetSettingsAtom)
    const showBrandLogo = widgetSettings?.showLogo !== false
    const logoUrl = widgetSettings?.logoUrl?.trim()
    const hasCustomLogo = Boolean(logoUrl)

    const createConversation = useMutation(api.public.conversations.create)
    const [isPending, setIsPending] = useState(false)

    const handleNewConversation = async () => {
        if (!organizationId) {
            setScreen('error')
            setErrorMessage('Missing Organization ID')
            return;
        }

        if (!contactSessionId) {
            setScreen('auth')
            return;
        }

        setIsPending(true)

        try {
            const conversationId = await createConversation({
                organizationId,
                contactSessionId,
            })

            setConversationId(conversationId)
            setScreen('chat')
        } catch {
            setScreen('auth')
        } finally {
            setIsPending(false)
        }
    }

    return (
        <>
            <WidgetHeader>
                <div className="flex flex-col gap-3 py-2">
                    {showBrandLogo ? (
                        hasCustomLogo ? (
                            <DicebearAvatar
                                className="border-primary-foreground/25 bg-primary-foreground/10"
                                imageUrl={logoUrl}
                                seed="assistant"
                                size={44}
                            />
                        ) : (
                            <div
                                className="flex size-11 shrink-0 items-center justify-center rounded-full border border-dashed border-primary-foreground/35 bg-primary-foreground/10 text-primary-foreground/50"
                                role="img"
                                aria-label="Logo placeholder"
                            >
                                <ImageIcon className="size-5" aria-hidden />
                            </div>
                        )
                    ) : null}
                    <div className="flex flex-col gap-1">
                        <h1 className="text-pretty text-2xl font-semibold tracking-tight">
                            Hi there
                        </h1>
                        <p className="text-pretty text-sm leading-relaxed text-primary-foreground/75">
                            Let&apos;s get you started. We&apos;re here when you need us.
                        </p>
                    </div>
                </div>
            </WidgetHeader>
            <div className="flex flex-1 flex-col overflow-y-auto bg-background p-5">
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
                            {isPending ? "One moment…" : "Chat with us"}
                        </span>
                    </span>
                    {!isPending ? (
                        <ChevronRightIcon
                            aria-hidden
                            className="size-4 shrink-0 text-muted-foreground transition-[opacity,transform] duration-200 group-hover/button:translate-x-0.5 group-hover/button:text-foreground"
                        />
                    ) : null}
                </Button>
            </div>
            <WidgetFooter />
        </>
    )
}