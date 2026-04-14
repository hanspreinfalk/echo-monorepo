"use client";

import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@workspace/ui/components/sidebar";

export function DashboardMobileSidebarBar() {
    const pathname = usePathname();
    if (pathname.startsWith("/conversations")) {
        return null;
    }

    return (
        <div className="flex h-11 shrink-0 items-center border-b border-border bg-background px-2 md:hidden">
            <SidebarTrigger className="-ml-1" />
        </div>
    );
}
