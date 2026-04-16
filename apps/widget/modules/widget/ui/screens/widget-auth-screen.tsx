"use client";

import { WidgetHeader } from "@/modules/widget/ui/components/widget-header";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { DicebearAvatar } from "@workspace/ui/components/dicebear-avatar";
import { api } from "@workspace/backend/_generated/api";
import { useMutation } from "convex/react";
import { Doc } from "@workspace/backend/_generated/dataModel";
import { useAtomValue, useSetAtom } from "jotai";
import { useMemo } from "react";
import {
    contactSessionIdAtomFamily,
    organizationIdAtom,
    screenAtom,
    widgetSettingsAtom,
} from "../../atoms/widget-atoms";
import { useWidgetStrings } from "@/modules/widget/hooks/use-widget-i18n";
import { ImageIcon } from "lucide-react";

export function WidgetAuthScreen() {
    const setScreen = useSetAtom(screenAtom);
    const { t } = useWidgetStrings();

    const organizationId = useAtomValue(organizationIdAtom);
    const widgetSettings = useAtomValue(widgetSettingsAtom);
    const showBrandLogo = widgetSettings?.showLogo !== false;
    const logoUrl = widgetSettings?.logoUrl?.trim();
    const hasCustomLogo = Boolean(logoUrl);

    const setContactSessionId = useSetAtom(contactSessionIdAtomFamily(organizationId || ""));

    // Schema is rebuilt per-render so validation messages follow the
    // current language. Cheap and avoids having to thread `t` into zod.
    const formSchema = useMemo(
        () =>
            z.object({
                name: z.string().min(1, { message: t("auth.nameRequired") }),
                email: z.string().email({ message: t("auth.emailInvalid") }),
            }),
        [t],
    );

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
        },
    });

    const createContactSession = useMutation(api.public.contactSessions.create);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (!organizationId) {
            return;
        }

        const metadata: Doc<"contactSessions">["metadata"] = {
            userAgent: navigator.userAgent,
            language: navigator.language,
            languages: navigator.languages.join(','),
            platform: navigator.platform,
            vendor: navigator.vendor,
            screenResolution: `${screen.width}x${screen.height}`,
            viewportSize: `${window.innerWidth}x${window.innerHeight}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            timezoneOffset: new Date().getTimezoneOffset(),
            cookieEnabled: navigator.cookieEnabled,
            referrer: document.referrer || "direct",
            currentUrl: window.location.href,
        }

        const contactSessionId = await createContactSession({
            ...values,
            organizationId,
            metadata,
        });

        setContactSessionId(contactSessionId);
        setScreen("selection");
    };

    return (
        <>
            <WidgetHeader>
                <div className="flex flex-col gap-3 py-2">
                    {showBrandLogo ? (
                        hasCustomLogo ? (
                            <DicebearAvatar
                                className="border-0 bg-primary-foreground/10 after:border-0"
                                imageUrl={logoUrl}
                                seed="assistant"
                                size={44}
                            />
                        ) : (
                            <div
                                className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary-foreground/10 text-primary-foreground/50"
                                role="img"
                                aria-label="Logo placeholder"
                            >
                                <ImageIcon className="size-5" aria-hidden />
                            </div>
                        )
                    ) : null}
                    <div className="flex flex-col gap-1">
                        <h1 className="text-pretty text-2xl font-semibold tracking-tight">
                            {t("greeting.title")}
                        </h1>
                        <p className="text-pretty text-sm leading-relaxed text-primary-foreground/75">
                            {t("greeting.subtitleExtended")}
                        </p>
                    </div>
                </div>
            </WidgetHeader>
            <Form {...form}>
                <form
                    className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto bg-background p-5"
                    onSubmit={form.handleSubmit(onSubmit)}
                >
                    <div className="flex flex-col gap-2">
                        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                            {t("auth.yourDetails")}
                        </p>
                        <div className="flex flex-col gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem className="gap-1.5">
                                        <FormLabel className="text-muted-foreground text-xs font-medium">
                                            {t("auth.nameLabel")}
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                autoComplete="name"
                                                className="h-12 rounded-lg border-border/80 bg-background px-3.5 shadow-xs"
                                                placeholder={t("auth.namePlaceholder")}
                                                type="text"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem className="gap-1.5">
                                        <FormLabel className="text-muted-foreground text-xs font-medium">
                                            {t("auth.emailLabel")}
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                autoComplete="email"
                                                className="h-12 rounded-lg border-border/80 bg-background px-3.5 shadow-xs"
                                                placeholder={t("auth.emailPlaceholder")}
                                                type="email"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                    <Button
                        className="h-12 w-full rounded-lg border-0 bg-black text-white hover:bg-black/90"
                        disabled={form.formState.isSubmitting}
                        type="submit"
                    >
                        {t("auth.continue")}
                    </Button>
                </form>
            </Form>
        </>
    );
}
