import { AuthGuard } from "@/modules/auth/ui/components/auth-guard";
import { OrganizationGuard } from "@/modules/auth/ui/components/organization-guard";
import { SidebarProvider } from "@workspace/ui/components/sidebar";
import { TooltipProvider } from "@workspace/ui/components/tooltip";
import { cookies } from "next/headers";
import { DashboardSidebar } from "@/modules/dashboard/ui/components/dashboard-sidebar";
import { Provider } from "jotai";

export async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies()
    const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true'

    return (
        <AuthGuard>
            <OrganizationGuard>
                <Provider>
                    <TooltipProvider>
                        <SidebarProvider defaultOpen={defaultOpen}>
                            <DashboardSidebar />
                            <main className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
                                {children}
                            </main>
                        </SidebarProvider>
                    </TooltipProvider>
                </Provider>
            </OrganizationGuard>
        </AuthGuard>
    )
}