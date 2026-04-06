"use client";

import { useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Doc, Id } from "@workspace/backend/_generated/dataModel";
import { DicebearAvatar } from "@workspace/ui/components/dicebear-avatar";
import { PageControlCardContent, PageControlCard } from "@workspace/ui/components/ai/page-control-card";

export type PageControlRequest = Doc<"pageControlRequests">;

interface Props {
    request: PageControlRequest;
    contactSessionId: Id<"contactSessions">;
}

function useCardCallbacks({ request, contactSessionId }: Props) {
    const resolveRequest = useMutation(api.public.conversations.resolvePageControlRequest);

    if (request.status !== "pending") return {};

    return {
        onAllow: async () => {
            await resolveRequest({ requestId: request._id, contactSessionId, decision: "approved" });
            window.parent.postMessage(
                { type: "page-agent-execute", payload: { action: request.action, requestId: request._id } },
                "*"
            );
        },
        onDeny: async () => {
            await resolveRequest({ requestId: request._id, contactSessionId, decision: "denied" });
        },
    };
}

function requestToCardProps(request: PageControlRequest) {
    const phase =
        request.status === "denied"
            ? "done"
            : request.status === "approved" && request.result
            ? "done"
            : request.status === "approved"
            ? "running"
            : "pending";

    const result =
        request.status === "denied"
            ? { success: false, data: "Denied by user" }
            : request.result ?? undefined;

    return { action: request.action, phase: phase as "pending" | "running" | "done", steps: request.steps, result };
}

const avatar = <DicebearAvatar imageUrl="/logo.svg" seed="assistant" size={32} />;

/** Inner content — embed inside an existing AIMessage bubble. */
export function WidgetRequestControlCardContent(props: Props) {
    const callbacks = useCardCallbacks(props);
    const cardProps = requestToCardProps(props.request);
    return <PageControlCardContent {...cardProps} {...callbacks} />;
}

/** Standalone — own AIMessage bubble with avatar. */
export function WidgetRequestControlCard(props: Props) {
    const callbacks = useCardCallbacks(props);
    const cardProps = requestToCardProps(props.request);
    return <PageControlCard {...cardProps} {...callbacks} avatar={avatar} />;
}
