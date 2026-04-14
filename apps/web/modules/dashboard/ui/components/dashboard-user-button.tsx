"use client"

import { UserButton } from "@clerk/nextjs"
import { PaletteIcon } from "lucide-react"
import { UserProfileAppearance } from "./user-profile-appearance"

export function DashboardUserButton() {
    return (
        <UserButton
            showName
            appearance={{
                elements: {
                    rootBox: "w-full! h-8!",
                    userButtonTrigger:
                        "w-full! p-2! hover:bg-sidebar-accent! hover:text-sidebar-accent-foreground! group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2!",
                    userButtonBox:
                        "w-full! flex-row-reverse! justify-end! gap-2! group-data-[collapsible=icon]:justify-center! text-sidebar-foreground!",
                    userButtonOuterIdentifier: "pl-0! group-data-[collapsible=icon]:hidden!",
                    avatarBox: "size-5!",
                },
            }}
        >
            <UserButton.UserProfilePage
                label="Appearance"
                url="appearance"
                labelIcon={<PaletteIcon className="size-4" />}
            >
                <UserProfileAppearance />
            </UserButton.UserProfilePage>
        </UserButton>
    )
}
