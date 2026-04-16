"use client"

import * as React from "react"
import { ConvexReactClient } from "convex/react"
import { ConvexProviderWithClerk } from "convex/react-clerk"
import { useAuth } from "@clerk/nextjs"
import { ThemeProvider } from "next-themes"
import posthog from "posthog-js"
import { PostHogProvider as PHProvider } from "posthog-js/react"
import { ClerkThemeProvider } from "./clerk-theme-provider"

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    throw new Error('Missing NEXT_PUBLIC_CONVEX_URL in your .env file')
}

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export function PostHogProvider({ children }: { children: React.ReactNode }) {
    React.useEffect(() => {
        posthog.init(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN as string, {
            api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
            defaults: "2026-01-30",
        })
    }, [])

    return <PHProvider client={posthog}>{children}</PHProvider>
}

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <PostHogProvider>
            <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
                storageKey="echo-web-theme"
            >
                <ClerkThemeProvider>
                    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
                        {children}
                    </ConvexProviderWithClerk>
                </ClerkThemeProvider>
            </ThemeProvider>
        </PostHogProvider>
    )
}