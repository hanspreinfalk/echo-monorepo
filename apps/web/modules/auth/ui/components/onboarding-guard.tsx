'use client'

import { useQuery, useMutation } from 'convex/react'
import { api } from '@workspace/backend/_generated/api'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    const me = useQuery(api.users.getMe)
    const ensureCurrentUser = useMutation(api.users.ensureCurrentUser)

    useEffect(() => {
        if (me === undefined) return

        // No Convex user yet (brand-new sign-up) — create the record then redirect.
        if (me === null) {
            ensureCurrentUser().then(() => {
                router.push('/onboarding')
            })
            return
        }

        if (!me.onboardingFinished && pathname !== '/onboarding') {
            router.push('/onboarding')
        }
    }, [me, pathname, router, ensureCurrentUser])

    // Still loading or about to redirect — render nothing.
    if (me === undefined) return null
    if (me === null) return null
    if (!me.onboardingFinished) return null

    return <>{children}</>
}
