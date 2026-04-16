import { AuthGuard } from "@/modules/auth/ui/components/auth-guard";
import { OrganizationGuard } from "@/modules/auth/ui/components/organization-guard";
import { OnboardingGuard } from "@/modules/auth/ui/components/onboarding-guard";
import { SidebarProvider } from "@workspace/ui/components/sidebar";
import { TooltipProvider } from "@workspace/ui/components/tooltip";
import { cookies } from "next/headers";
import { DashboardSidebar } from "@/modules/dashboard/ui/components/dashboard-sidebar";
import { DashboardMobileSidebarBar } from "@/modules/dashboard/ui/components/dashboard-mobile-sidebar-bar";
import { Provider } from "jotai";

export async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies()
    const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true'

    return (
        <AuthGuard>
            <OrganizationGuard>
                <OnboardingGuard>
                    <Provider>
                        <TooltipProvider>
                            <SidebarProvider defaultOpen={defaultOpen} className="h-svh overflow-hidden">
                                <DashboardSidebar />
                                <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
                                    <DashboardMobileSidebarBar />
                                    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
                                        {children}
                                    </div>
                                </main>
                            </SidebarProvider>
                        </TooltipProvider>
                    </Provider>
                </OnboardingGuard>
            </OrganizationGuard>
        </AuthGuard>
    )
}