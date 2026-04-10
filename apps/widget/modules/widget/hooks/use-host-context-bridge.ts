"use client";

import { useEffect, useRef } from "react";
import { useAtom, useAtomValue } from "jotai";
import { useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import {
  contactSessionIdAtomFamily,
  organizationIdAtom,
  pendingHostContextAtomFamily,
} from "@/modules/widget/atoms/widget-atoms";
import { HOST_CONTEXT_MESSAGE_TYPE } from "@/modules/widget/constants";

type HostContextPayload = {
  hostPageUrl?: string;
  hostConsoleLogs?: string[];
};

export function useHostContextBridge() {
  const organizationId = useAtomValue(organizationIdAtom);
  const orgKey = organizationId ?? "";
  const contactSessionId = useAtomValue(contactSessionIdAtomFamily(orgKey));
  const [pending, setPending] = useAtom(pendingHostContextAtomFamily(orgKey));
  const patchHostContext = useMutation(api.public.contactSessions.patchHostContext);

  const contactSessionIdRef = useRef(contactSessionId);
  contactSessionIdRef.current = contactSessionId;

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (window.parent === window || event.source !== window.parent) {
        return;
      }
      const data = event.data as {
        type?: string;
        payload?: HostContextPayload;
      };
      if (data?.type !== HOST_CONTEXT_MESSAGE_TYPE || !data.payload) {
        return;
      }
      const { hostPageUrl, hostConsoleLogs } = data.payload;
      const hasUrl = hostPageUrl !== undefined && hostPageUrl.length > 0;
      const hasLogs = hostConsoleLogs !== undefined && hostConsoleLogs.length > 0;
      if (!hasUrl && !hasLogs) {
        return;
      }

      const sessionId = contactSessionIdRef.current;
      if (sessionId) {
        void patchHostContext({
          contactSessionId: sessionId,
          ...(hasUrl ? { hostPageUrl } : {}),
          ...(hasLogs ? { hostConsoleLogs } : {}),
        });
      } else {
        setPending((prev) => ({
          hostPageUrl: hasUrl ? hostPageUrl : prev?.hostPageUrl,
          /** Parent sends full snapshot each time—keep latest, do not concatenate. */
          hostConsoleLogs: hasLogs
            ? (hostConsoleLogs ?? []).slice(-300)
            : prev?.hostConsoleLogs,
        }));
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [patchHostContext, setPending]);

  useEffect(() => {
    if (!contactSessionId || !pending) {
      return;
    }
    const { hostPageUrl, hostConsoleLogs } = pending;
    const hasPayload =
      (hostPageUrl !== undefined && hostPageUrl.length > 0) ||
      (hostConsoleLogs !== undefined && hostConsoleLogs.length > 0);
    if (!hasPayload) {
      return;
    }

    let cancelled = false;
    void patchHostContext({
      contactSessionId,
      ...(hostPageUrl ? { hostPageUrl } : {}),
      ...(hostConsoleLogs?.length ? { hostConsoleLogs } : {}),
    })
      .then(() => {
        if (!cancelled) {
          setPending(null);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [contactSessionId, pending, patchHostContext, setPending]);
}
