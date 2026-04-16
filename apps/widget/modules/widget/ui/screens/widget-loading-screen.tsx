"use client";

import { useEffect, useState } from "react";
import { LoaderIcon } from "lucide-react";
import { useAtomValue, useSetAtom } from "jotai";
import { contactSessionIdAtomFamily, errorMessageAtom, loadingMessageAtom, organizationIdAtom, screenAtom, widgetSettingsAtom } from "@/modules/widget/atoms/widget-atoms";
import { WidgetHeader } from "@/modules/widget/ui/components/widget-header";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { useWidgetStrings } from "@/modules/widget/hooks/use-widget-i18n";

type InitStep = "org" | "session" | "settings" | "vapi" | "done";

export const WidgetLoadingScreen = ({ organizationId }: { organizationId: string | null }) => {
    const [step, setStep] = useState<InitStep>("org")
    const [sessionValid, setSessionValid] = useState(false);

    const loadingMessage = useAtomValue(loadingMessageAtom);
    const setWidgetSettings = useSetAtom(widgetSettingsAtom);
    const setOrganizationId = useSetAtom(organizationIdAtom);
    const setLoadingMessage = useSetAtom(loadingMessageAtom);
    const setErrorMessage = useSetAtom(errorMessageAtom);
    const setScreen = useSetAtom(screenAtom);
    const { t } = useWidgetStrings();

    const contactSessionId = useAtomValue(contactSessionIdAtomFamily(organizationId || ""));

    // Step 1: Validate organization
    const validateOrganization = useAction(api.public.organizations.validate);
    useEffect(() => {
        if (step !== "org") {
            return;
        }

        setLoadingMessage(t("loading.findingOrg"));

        if (!organizationId) {
            setErrorMessage(t("error.missingOrgIdShort"));
            setScreen("error");
            return;
        }

        setLoadingMessage(t("loading.verifyingOrg"));

        validateOrganization({ organizationId })
            .then((result) => {
                if (result.valid) {
                    setOrganizationId(organizationId);
                    setStep("session");
                } else {
                    setErrorMessage(result.reason || t("error.invalidConfig"));
                    setScreen("error");
                }
            })
            .catch(() => {
                setErrorMessage(t("error.unableVerify"));
                setScreen("error");
            })
    }, [
        step,
        organizationId,
        setErrorMessage,
        setScreen,
        setOrganizationId,
        setStep,
        validateOrganization,
        setLoadingMessage,
        t
    ]);

    // Step 2: Validate session (if exists)
    const validateContactSession = useMutation(api.public.contactSessions.validate);
    useEffect(() => {
        if (step !== "session") {
            return;
        }

        setLoadingMessage(t("loading.findingSession"));

        if (!contactSessionId) {
            setSessionValid(false);
            setStep("settings");
            return;
        }

        setLoadingMessage(t("loading.validatingSession"));

        validateContactSession({ contactSessionId })
            .then((result) => {
                setSessionValid(result.valid);
                setStep("settings");
            })
            .catch(() => {
                setSessionValid(false);
                setStep("settings");
            })
    }, [step, contactSessionId, validateContactSession, setLoadingMessage, t]);

    // Step 3: Load Widget Settings
    const widgetSettings = useQuery(api.public.widgetSettings.getByOrganizationId,
        organizationId ? {
            organizationId,
        } : "skip",
    );
    useEffect(() => {
        if (step !== "settings") {
            return;
        }

        setLoadingMessage(t("loading.loadingSettings"));

        if (widgetSettings !== undefined) {
            setWidgetSettings(widgetSettings);
            setStep("done");
        }
    }, [
        step,
        widgetSettings,
        setStep,
        setWidgetSettings,
        setLoadingMessage,
        t,
    ]);

    useEffect(() => {
        if (step !== "done") {
            return;
        }

        const hasValidSession = contactSessionId && sessionValid;
        setScreen(hasValidSession ? "selection" : "auth");
    }, [step, contactSessionId, sessionValid, setScreen]);

    return (
        <>
            <WidgetHeader>
                <div className="flex flex-col justify-between gap-y-2 px-2 py-6 font-semibold">
                    <p className="text-3xl">
                        {t("greeting.title")}
                    </p>
                    <p className="text-lg">
                        {t("greeting.subtitle")}
                    </p>
                </div>
            </WidgetHeader>
            <div className="flex flex-1 flex-col items-center justify-center gap-y-4 p-4 text-muted-foreground">
                <LoaderIcon className="animate-spin" />
                <p className="text-sm">
                    {loadingMessage || t("loading.default")}
                </p>
            </div>
        </>
    );
};
