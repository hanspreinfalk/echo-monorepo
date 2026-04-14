"use client";

import Bowser from "bowser";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@workspace/ui/components/accordion";
import { getCountryFlagUrl, getCountryFromTimezone } from "@/lib/country-utils";
import { api } from "@workspace/backend/_generated/api";
import { Id } from "@workspace/backend/_generated/dataModel";
import { Button } from "@workspace/ui/components/button";
import { DicebearAvatar } from "@workspace/ui/components/dicebear-avatar";
import { useQuery } from "convex/react";
import { ClockIcon, GlobeIcon, MailIcon, MonitorIcon } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { cn } from "@workspace/ui/lib/utils";

type InfoItem = {
    label: string;
    value: string | React.ReactNode;
    className?: string;
};

type InfoSection = {
    id: string;
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    items: InfoItem[];
};

export const ContactPanel = () => {
    const params = useParams();
    const conversationId = params.conversationId as (Id<"conversations"> | null);

    const contactSession = useQuery(api.private.contactSessions.getOneByConversationId,
        conversationId ? {
            conversationId,
        } : "skip",
    );

    const parseUserAgent = useMemo(() => {
        return (userAgent?: string) => {
            if (!userAgent) {
                return { browser: "Unknown", os: "Unknown", device: "Unknown" };
            }

            const browser = Bowser.getParser(userAgent);
            const result = browser.getResult();

            return {
                browser: result.browser.name || "Unknown",
                browserVersion: result.browser.version || "",
                os: result.os.name || "Unknown",
                osVersion: result.os.version || "",
                device: result.platform.type || "desktop",
                deviceVendor: result.platform.vendor || "",
                deviceModel: result.platform.model || "",
            };
        };
    }, []);

    const userAgentInfo = useMemo(() =>
        parseUserAgent(contactSession?.metadata?.userAgent),
        [contactSession?.metadata?.userAgent, parseUserAgent]);

    const countryInfo = useMemo(() => {
        return getCountryFromTimezone(contactSession?.metadata?.timezone);
    }, [contactSession?.metadata?.timezone]);

    const accordionSections = useMemo<InfoSection[]>(() => {
        if (!contactSession?.metadata) {
            return [];
        }

        return [
            {
                id: "device-info",
                icon: MonitorIcon,
                title: "Device Information",
                items: [
                    {
                        label: "Browser",
                        value:
                            userAgentInfo.browser +
                            (userAgentInfo.browserVersion
                                ? ` ${userAgentInfo.browserVersion}`
                                : ""
                            ),
                    },
                    {
                        label: "OS",
                        value:
                            userAgentInfo.os +
                            (userAgentInfo.osVersion ? ` ${userAgentInfo.osVersion}` : ""),
                    },
                    {
                        label: "Device",
                        value:
                            userAgentInfo.device +
                            (
                                userAgentInfo.deviceModel
                                    ? ` - ${userAgentInfo.deviceModel}`
                                    : ""
                            ),
                        className: "capitalize"
                    },
                    {
                        label: "Screen",
                        value: contactSession.metadata.screenResolution,
                    },
                    {
                        label: "Viewport",
                        value: contactSession.metadata.viewportSize,
                    },
                    {
                        label: "Cookies",
                        value: contactSession.metadata.cookieEnabled ? "Enabled" : "Disabled"
                    },
                ],
            },
            {
                id: "location-info",
                icon: GlobeIcon,
                title: "Location & Language",
                items: [
                    ...(countryInfo
                        ? [
                            {
                                label: "Country",
                                value: (
                                    <span>
                                        {countryInfo.name}
                                    </span>
                                )
                            }
                        ]
                        : []
                    ),
                    {
                        label: "Language",
                        value: contactSession.metadata.language,
                    },
                    {
                        label: "Timezone",
                        value: contactSession.metadata.timezone,
                    },
                    {
                        label: "UTC Offset",
                        value: contactSession.metadata.timezoneOffset,
                    }
                ]
            },
            {
                id: "section-details",
                title: "Section details",
                icon: ClockIcon,
                items: [
                    {
                        label: "Session Started",
                        value: new Date(
                            contactSession._creationTime
                        ).toLocaleString(),
                    }
                ],
            }
        ];
    }, [contactSession, userAgentInfo, countryInfo]);

    if (contactSession === undefined || contactSession === null) {
        return null;
    }

    return (
        <div className="flex h-full w-full flex-col bg-sidebar text-sidebar-foreground">
            {/* Contact header */}
            <div className="border-b border-sidebar-border px-4 py-4">
                <div className="flex items-center gap-3">
                    <DicebearAvatar
                        badgeImageUrl={
                            countryInfo?.code
                                ? getCountryFlagUrl(countryInfo.code)
                                : undefined
                        }
                        seed={contactSession._id}
                        size={36}
                    />
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                            {contactSession.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                            {contactSession.email}
                        </p>
                    </div>
                </div>
                <Button asChild className="mt-3 w-full" size="sm" variant="outline">
                    <Link href={`mailto:${contactSession.email}`}>
                        <MailIcon className="size-3.5" />
                        <span>Send Email</span>
                    </Link>
                </Button>
            </div>

            {contactSession.metadata && (
                <Accordion
                    className="w-full"
                    collapsible
                    type="single"
                >
                    {accordionSections.map((section) => (
                        <AccordionItem
                            className="border-b border-sidebar-border outline-none"
                            key={section.id}
                            value={section.id}
                        >
                            <AccordionTrigger
                                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium outline-none transition-colors hover:bg-sidebar-accent hover:no-underline"
                            >
                                <section.icon className="size-3.5 shrink-0 text-muted-foreground" />
                                <span>{section.title}</span>
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pb-3 pt-1">
                                <div className="space-y-1.5">
                                    {section.items.map((item) => (
                                        <div
                                            className="flex items-start justify-between gap-3 text-xs"
                                            key={`${section.id}-${item.label}`}
                                        >
                                            <span className="shrink-0 text-muted-foreground">
                                                {item.label}
                                            </span>
                                            <span className={cn("text-right", item.className)}>
                                                {item.value}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            )}
        </div>
    );
};