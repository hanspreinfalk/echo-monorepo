'use client'

import { useAtomValue, useSetAtom } from "jotai"
import { contactSessionIdAtomFamily, errorMessageAtom, loadingMessageAtom, organizationIdAtom, screenAtom } from "@/modules/widget/atoms/widget-atoms"
import { WidgetHeader } from "@/modules/widget/ui/components/widget-header"
import { LoaderIcon } from 'lucide-react'
import { useState, useEffect } from 'react'
import { api } from "@workspace/backend/_generated/api";
import { useAction, useMutation } from "convex/react";

type InitStep = 'org' | 'settings' | 'session'| 'vapi' | 'done';

export function WidgetLoadingScreen({ organizationId } : { organizationId: string | null }) {
    const [step, setStep] = useState<InitStep>('org')
    const [sessionValid, setSessionValid] = useState(false)

    const loadingMessage = useAtomValue(loadingMessageAtom)
    const setOrganizationId = useSetAtom(organizationIdAtom)
    const setLoadingMessage = useSetAtom(loadingMessageAtom)
    const setErrorMessage = useSetAtom(errorMessageAtom)
    const setScreen = useSetAtom(screenAtom)

    const contactSessionId = useAtomValue(contactSessionIdAtomFamily(organizationId || ""))

    // Step 01: Validate organization
    const validateOrganization = useAction(api.public.organizations.validate)
    useEffect(() => {
        if (step !== 'org') {
            return;
        }

        setLoadingMessage('Loading organization...')

        if (!organizationId) {
            setErrorMessage('Organization ID is required')
            setScreen('error')
            return;
        }

        setLoadingMessage('Verifying organization...')

        validateOrganization({ organizationId })
            .then((result) => {
                if (result.valid) {
                    setOrganizationId(organizationId)
                    setStep('session')
                } else {
                    setErrorMessage(result.reason || "Invalid configuration")
                    setScreen('error')
                }
            })
            .catch((error) => {
                console.error(error)
                setErrorMessage('Failed to verify organization')
                setScreen('error')
            })
    }, [
        step, 
        organizationId, 
        setErrorMessage, 
        setScreen, 
        setOrganizationId, 
        setStep,
        validateOrganization,
        setLoadingMessage
    ])

    // Step 02: Validate session (if exists)
    const validateContactSession = useMutation(api.public.contactSessions.validate)
    useEffect(() => {
        if (step !== 'session') {
            return;
        }

        setLoadingMessage('Finding contact session...')

        if (!contactSessionId) {
            setSessionValid(false)
            setStep('done')
            return;
        }

        setLoadingMessage('Validating session...')
        validateContactSession({ contactSessionId })
            .then((result) => {
                setSessionValid(result.valid)
                setStep('done')
            })
            .catch(() => {
                setSessionValid(false)
                setStep('done')
            })
    }, [
        step,
        contactSessionId,
        validateContactSession,
        setLoadingMessage,
    ])

    useEffect(() => {
        if (step !== 'done') {
            return;
        }

        const hasValidSession = sessionValid && contactSessionId;
        setScreen(hasValidSession ? 'selection' : 'auth')
    }, [
        step,
        contactSessionId,
        sessionValid,
        setScreen,
    ])

    return (
        <>
            <WidgetHeader>
                <div className="flex flex-col justify-between gap-y-2 px-2 py-6 font-semibold">
                    <p className="text-3xl">
                        Hi there 👋🏻
                    </p>
                    <p className="text-lg">
                        Let&apos;s get you started
                    </p>
                </div>
            </WidgetHeader>
            <div className="flex flex-1 flex-col items-center justify-center gap-y-4 p-4 text-muted-foreground">
                <LoaderIcon className="animate-spin" />
                <p className="text-sm">
                    {loadingMessage || 'Loading...'}
                </p>
            </div>
        </>
    )
}