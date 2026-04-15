'use client'

import { OrganizationSwitcher } from "@clerk/nextjs"
import { api } from "@workspace/backend/_generated/api"
import { useMutation, useQuery } from "convex/react"
import {
    BugIcon,
    CreditCardIcon,
    GithubIcon,
    InboxIcon,
    LayoutDashboardIcon,
    LibraryBigIcon,
    PaletteIcon,
    ShieldIcon,
    WrenchIcon,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect } from "react"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail
} from "@workspace/ui/components/sidebar"
import { cn } from "@workspace/ui/lib/utils"
import { DashboardUserButton } from "./dashboard-user-button"

const customerSupportItems = [
    {
        title: 'Conversations',
        url: '/conversations', 
        icon: InboxIcon
    },
    {
        title: 'Knowledge Base',
        url: '/files',
        icon: LibraryBigIcon
    },
    {
        title: 'Product Issues',
        url: '/issues',
        icon: BugIcon
    }
]

const configurationItems = [
    {
        title: 'Widget Customization',
        url: '/customization',
        icon: PaletteIcon,
    },
    {
        title: 'Integrations',
        url: '/integrations',
        icon: LayoutDashboardIcon,
    },
    {
        title: 'GitHub Integration',
        url: '/github-integration',
        icon: GithubIcon,
    },
    {
        title: 'Custom Tools',
        url: '/custom-tools',
        icon: WrenchIcon,
    },
]

const accountItems = [
    {
        title: 'Plans & Billing',
        url: '/billing',
        icon: CreditCardIcon,
    }
]

const adminItems = [
    {
        title: 'Admin',
        url: '/admin',
        icon: ShieldIcon,
    },
]

export const DashboardSidebar = () => {
    const pathname = usePathname()
    const me = useQuery(api.users.getMe)
    const ensureCurrentUser = useMutation(api.users.ensureCurrentUser)

    useEffect(() => {
        void ensureCurrentUser()
    }, [ensureCurrentUser])

    const showAdmin = me?.role === 'admin'
    
    const isActive = (url: string) => {
        if (url === '/') {
            return pathname === '/'
        }
        return pathname.startsWith(url)
    }

    const activeClass = 'bg-black! text-white! font-medium! dark:bg-white! dark:text-black!'

    return (
        <Sidebar className="group border-r border-sidebar-border" collapsible="icon">
            <SidebarHeader className="pt-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild size="lg">
                            <OrganizationSwitcher 
                                hidePersonal 
                                skipInvitationScreen
                                appearance={{
                                    elements: {
                                        rootBox: 'w-full! h-8!',
                                        avatarBox: 'size-5! rounded-sm!',
                                        organizationSwitcherTrigger: 'w-full! justify-start! group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2!',
                                        organizationPreview: 'group-data-[collapsible=icon]:justify-center! gap-2!',
                                        organizationPreviewTextContainer: 'group-data-[collapsible=icon]:hidden! text-xs! font-medium! text-sidebar-foreground!',
                                        organizationSwitcherTriggerIcon: 'group-data-[collapsible=icon]:hidden! ml-auto! text-sidebar-foreground!'
                                    }
                                }}
                            />
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="gap-0 py-2">
                <SidebarGroup className="py-2">
                    <SidebarGroupLabel className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                        Support
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {customerSupportItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton 
                                        asChild 
                                        tooltip={item.title}
                                        isActive={isActive(item.url)}
                                        className={cn(
                                            'text-sm text-sidebar-foreground/80 transition-colors',
                                            isActive(item.url) && activeClass
                                        )}
                                    >
                                        <Link href={item.url}>
                                            <item.icon className="size-4 shrink-0" />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup className="py-2">
                    <SidebarGroupLabel className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                        Configuration
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {configurationItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        tooltip={item.title}
                                        isActive={isActive(item.url)}
                                        className={cn(
                                            'text-sm text-sidebar-foreground/80 transition-colors',
                                            isActive(item.url) && activeClass
                                        )}
                                    >
                                        <Link href={item.url}>
                                            <item.icon className="size-4 shrink-0" />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup className="py-2">
                    <SidebarGroupLabel className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                        Account
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {accountItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        tooltip={item.title}
                                        isActive={isActive(item.url)}
                                        className={cn(
                                            'text-sm text-sidebar-foreground/80 transition-colors',
                                            isActive(item.url) && activeClass
                                        )}
                                    >
                                        <Link href={item.url}>
                                            <item.icon className="size-4 shrink-0" />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {showAdmin ? (
                    <SidebarGroup className="py-2">
                        <SidebarGroupLabel className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                            Administration
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {adminItems.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            tooltip={item.title}
                                            isActive={isActive(item.url)}
                                            className={cn(
                                                'text-sm text-sidebar-foreground/80 transition-colors',
                                                isActive(item.url) && activeClass
                                            )}
                                        >
                                            <Link href={item.url}>
                                                <item.icon className="size-4 shrink-0" />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ) : null}
            </SidebarContent>

            <SidebarFooter className="py-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DashboardUserButton />
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
