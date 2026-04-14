'use client'

import { api } from "@workspace/backend/_generated/api"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@workspace/ui/components/select"
import { getCountryFlagUrl, getCountryFromTimezone } from "@/lib/country-utils"
import { usePaginatedQuery } from "convex/react"
import { ListIcon, ArrowRightIcon, ArrowUpIcon, CheckIcon, CornerUpLeftIcon } from "lucide-react"
import Link from "next/link"
import { cn } from "@workspace/ui/lib/utils"
import { usePathname } from "next/navigation"
import { DicebearAvatar } from "@workspace/ui/components/dicebear-avatar"
import { formatDistanceToNow } from "date-fns"
import { ConversationStatusIcon } from "@workspace/ui/components/conversation-status-icon"
import { useAtomValue, useSetAtom } from "jotai"
import { statusFilterAtom } from "../../atoms"
import { useInfiniteScroll } from "@workspace/ui/hooks/use-infinite-scroll"
import { InfiniteScrollTrigger } from "@workspace/ui/components/infinite-scroll-trigger"
import { formatConversationLastMessagePreview } from "@workspace/ui/lib/conversation-last-message-preview"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { SidebarTrigger } from "@workspace/ui/components/sidebar"

export const ConversationsPanel = () => {
    const pathname = usePathname();

    const statusFilter = useAtomValue(statusFilterAtom);
    const setStatusFilter = useSetAtom(statusFilterAtom);

    const conversations = usePaginatedQuery(
        api.private.conversations.getMany,
        {
            status: statusFilter === "all" ? undefined : statusFilter,
        },
        {
            initialNumItems: 10,
        }
    )

    const { topElementRef, handleLoadMore, canLoadMore, isLoadingMore, isLoadingFirstPage } = useInfiniteScroll({
        status: conversations.status,
        loadMore: conversations.loadMore,
        loadSize: 10
    })

    return (
        <div className="flex h-full w-full flex-col overflow-hidden bg-sidebar text-sidebar-foreground">
            {/* Header — fixed height matches chat header */}
            <div className="flex h-11 shrink-0 items-center justify-between border-b border-sidebar-border px-3">
                <div className="flex items-center gap-1">
                    {/* Mobile-only sidebar trigger */}
                    <SidebarTrigger className="md:hidden -ml-1 mr-1" />
                    <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
                        Conversations
                    </span>
                </div>
                <Select
                    defaultValue="all"
                    onValueChange={(value) => setStatusFilter(
                        value as "unresolved" | "escalated" | "resolved" | "all"
                    )}
                    value={statusFilter}
                >
                    <SelectTrigger
                        className="h-6 w-auto gap-1 border-none bg-transparent px-2 text-xs shadow-none ring-0 hover:bg-sidebar-accent focus-visible:ring-0"
                    >
                        <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">
                            <div className="flex items-center gap-2">
                                <ListIcon className="size-3.5" />
                                <span>All</span>
                            </div>
                        </SelectItem>
                        <SelectItem value="unresolved">
                            <div className="flex items-center gap-2">
                                <ArrowRightIcon className="size-3.5" />
                                <span>Unresolved</span>
                            </div>
                        </SelectItem>
                        <SelectItem value="escalated">
                            <div className="flex items-center gap-2">
                                <ArrowUpIcon className="size-3.5" />
                                <span>Escalated</span>
                            </div>
                        </SelectItem>
                        <SelectItem value="resolved">
                            <div className="flex items-center gap-2">
                                <CheckIcon className="size-3.5" />
                                <span>Resolved</span>
                            </div>
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {isLoadingFirstPage ? (
                <SkeletonConversations />
            ) : (
                <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
                    {conversations.results.map((conversation) => {
                        const isLastMessageFromOperator = conversation.lastMessage?.message?.role !== "user";
                        const isSelected = pathname === `/conversations/${conversation._id}`;

                        const country = getCountryFromTimezone(
                            conversation.contactSession.metadata?.timezone
                        );
                        const countryFlagUrl = country?.code ? getCountryFlagUrl(country.code) : undefined;

                        return (
                            <Link
                                key={conversation._id}
                                className={cn(
                                    "group relative flex w-full min-w-0 cursor-pointer items-start gap-3 border-b border-sidebar-border px-3 py-3.5 text-sm transition-colors hover:bg-sidebar-accent",
                                    isSelected && "bg-sidebar-accent"
                                )}
                                href={`/conversations/${conversation._id}`}
                            >
                                {/* Left active indicator */}
                                <div className={cn(
                                    "-translate-y-1/2 absolute top-1/2 left-0 h-[55%] w-0.5 rounded-r-full bg-foreground opacity-0 transition-opacity",
                                    isSelected && "opacity-100"
                                )} />

                                <DicebearAvatar
                                    seed={conversation.contactSession._id}
                                    size={36}
                                    className="mt-0.5 shrink-0"
                                    badgeImageUrl={countryFlagUrl}
                                />
                                <div className="min-w-0 flex-1">
                                    <div className="flex w-full min-w-0 items-center gap-2">
                                        <span className="truncate text-sm font-medium">
                                            {conversation.contactSession.name}
                                        </span>
                                        <span className="ml-auto shrink-0 text-[11px] tabular-nums text-muted-foreground">
                                            {formatDistanceToNow(conversation._creationTime)}
                                        </span>
                                    </div>
                                    <div className="mt-0.5 flex min-w-0 items-center justify-between gap-2">
                                        <div className="flex min-w-0 items-center gap-1">
                                            {isLastMessageFromOperator && (
                                                <CornerUpLeftIcon className="size-3 shrink-0 text-muted-foreground/70" />
                                            )}
                                            <span
                                                className={cn(
                                                    "truncate text-xs text-muted-foreground",
                                                    !isLastMessageFromOperator && "font-medium text-foreground/80"
                                                )}
                                            >
                                                {formatConversationLastMessagePreview(
                                                    conversation.lastMessage?.text,
                                                )}
                                            </span>
                                        </div>
                                        <ConversationStatusIcon status={conversation.status} />
                                    </div>
                                </div>
                            </Link>
                        )
                    })}
                    <InfiniteScrollTrigger
                        canLoadMore={canLoadMore}
                        isLoadingMore={isLoadingMore}
                        onLoadMore={handleLoadMore}
                        ref={topElementRef}
                    />
                </div>
            )}
        </div>
    )
}

export const SkeletonConversations = () => {
    return (
        <div className="flex min-h-0 flex-1 flex-col overflow-auto">
            {Array.from({ length: 8 }).map((_, index) => (
                <div
                    className="flex items-start gap-3 border-b border-sidebar-border px-3 py-3.5"
                    key={index}
                >
                    <Skeleton className="mt-0.5 size-9 shrink-0 rounded-full" />
                    <div className="min-w-0 flex-1">
                        <div className="flex w-full items-center gap-2">
                            <Skeleton className="h-3.5 w-24" />
                            <Skeleton className="ml-auto h-3 w-10 shrink-0" />
                        </div>
                        <div className="mt-1.5">
                            <Skeleton className="h-3 w-3/4" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}