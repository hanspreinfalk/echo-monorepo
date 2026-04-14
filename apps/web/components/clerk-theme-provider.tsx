"use client"

import { ClerkProvider } from "@clerk/nextjs"
import { shadcn } from "@clerk/themes"

export function ClerkThemeProvider({ children }: { children: React.ReactNode }) {
    return (
        <ClerkProvider
            appearance={{
                baseTheme: shadcn,
            }}
        >
            {children}
        </ClerkProvider>
    )
}
