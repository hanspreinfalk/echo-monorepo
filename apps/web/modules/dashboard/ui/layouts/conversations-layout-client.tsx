"use client";

import { usePathname } from "next/navigation";
import { ConversationsPanel } from "../components/conversations-panel";
import { cn } from "@workspace/ui/lib/utils";

export function ConversationsLayoutClient({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    // True when we're inside a specific conversation (not the bare /conversations route)
    const isDetail = pathname !== "/conversations";

    return (
        <div className="flex h-full min-h-0 w-full">
            {/* Conversations list — full-width on mobile list view, fixed sidebar on desktop */}
            <div
                className={cn(
                    "h-full min-h-0 shrink-0 border-r border-sidebar-border",
                    "w-full md:w-72 lg:w-80",
                    isDetail && "hidden md:block",
                )}
            >
                <ConversationsPanel />
            </div>

            {/* Detail content — hidden on mobile list view, visible when in a conversation */}
            <div
                className={cn(
                    "h-full min-h-0 min-w-0 flex-1",
                    !isDetail && "hidden md:flex",
                )}
            >
                {children}
            </div>
        </div>
    );
}
