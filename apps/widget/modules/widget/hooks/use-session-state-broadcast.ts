"use client";

import { useEffect, useRef } from "react";
import { useAtomValue } from "jotai";
import {
  contactSessionIdAtomFamily,
  organizationIdAtom,
  screenAtom,
} from "@/modules/widget/atoms/widget-atoms";
import { WIDGET_SESSION_STATE_MESSAGE_TYPE } from "@/modules/widget/constants";

/**
 * Posts the current contact-session state to the parent embed.
 *
 * The embed uses this to gate the launcher when
 * `widgetSettings.requireActiveSession` is on. We treat the session as
 * "active" once the widget has finished loading (`screen` left `"loading"` or
 * `"error"`) and a `contactSessionId` is present. This avoids reporting a
 * stale id that hasn't been validated yet.
 */
export function useSessionStateBroadcast() {
  const organizationId = useAtomValue(organizationIdAtom);
  const orgKey = organizationId ?? "";
  const contactSessionId = useAtomValue(contactSessionIdAtomFamily(orgKey));
  const screen = useAtomValue(screenAtom);

  const lastReportedRef = useRef<boolean | null>(null);

  useEffect(() => {
    if (window.parent === window) return;

    // Don't broadcast while still loading — organizationId and the contact
    // session haven't been validated yet, so any "inactive" signal would be
    // premature and cause the embed to re-post a setUser identity into a
    // widget that can't process it (organizationId is still null).
    const ready = screen !== "loading" && screen !== "error";
    if (!ready) return;

    const active = Boolean(contactSessionId);

    if (lastReportedRef.current === active) return;
    lastReportedRef.current = active;

    try {
      window.parent.postMessage(
        {
          type: WIDGET_SESSION_STATE_MESSAGE_TYPE,
          payload: { active },
        },
        "*",
      );
    } catch {
      /* ignore */
    }
  }, [contactSessionId, screen]);
}
