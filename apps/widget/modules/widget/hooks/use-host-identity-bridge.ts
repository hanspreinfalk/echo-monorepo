"use client";

import { useEffect, useRef } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import {
  contactSessionIdAtomFamily,
  conversationIdAtom,
  organizationIdAtom,
  screenAtom,
} from "@/modules/widget/atoms/widget-atoms";
import {
  HOST_CLEAR_IDENTITY_MESSAGE_TYPE,
  HOST_IDENTITY_MESSAGE_TYPE,
} from "@/modules/widget/constants";

type HostIdentityPayload = {
  name?: string;
  email?: string;
  pictureUrl?: string;
};

/**
 * Receives `Bryan.setUser(...)` from the parent embed. On a valid identity we
 * call `findOrCreateByIdentity` and write the resulting contact session id
 * into the same atom the manual auth form populates — so the widget skips the
 * auth screen and the user lands straight in the selection view (or stays in
 * whatever screen they were on if they were already authed under the same
 * identity).
 *
 * Also handles `Bryan.clearUser()` which resets the local session.
 */
export function useHostIdentityBridge() {
  const organizationId = useAtomValue(organizationIdAtom);
  const orgKey = organizationId ?? "";
  const setContactSessionId = useSetAtom(contactSessionIdAtomFamily(orgKey));
  const setConversationId = useSetAtom(conversationIdAtom);
  const setScreen = useSetAtom(screenAtom);
  const findOrCreateByIdentity = useMutation(
    api.public.contactSessions.findOrCreateByIdentity,
  );

  const organizationIdRef = useRef(organizationId);
  organizationIdRef.current = organizationId;

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (window.parent === window || event.source !== window.parent) {
        return;
      }
      const data = event.data as {
        type?: string;
        payload?: HostIdentityPayload;
      };

      if (data?.type === HOST_CLEAR_IDENTITY_MESSAGE_TYPE) {
        setContactSessionId(null);
        setConversationId(null);
        setScreen("auth");
        return;
      }

      if (data?.type !== HOST_IDENTITY_MESSAGE_TYPE || !data.payload) {
        return;
      }

      const orgId = organizationIdRef.current;
      if (!orgId) return;

      const name = (data.payload.name ?? "").trim();
      const email = (data.payload.email ?? "").trim();
      const pictureUrl = data.payload.pictureUrl?.trim();
      if (!name || !email) return;

      void findOrCreateByIdentity({
        name,
        email,
        organizationId: orgId,
        ...(pictureUrl ? { pictureUrl } : {}),
      })
        .then((sessionId) => {
          setContactSessionId(sessionId);
          // Route past the auth screen. If the user was already on chat we
          // leave them there — the new session id replaces the prior one.
          setScreen((current) =>
            current === "auth" || current === "loading" ? "selection" : current,
          );
        })
        .catch((err) => {
          // Identity sync failures shouldn't break the widget — surface in
          // console and let the user fall back to the manual auth screen.
          // eslint-disable-next-line no-console
          console.error("Bryan.setUser failed:", err);
        });
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [findOrCreateByIdentity, setContactSessionId, setConversationId, setScreen]);
}
