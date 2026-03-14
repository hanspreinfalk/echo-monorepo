'use client'

import { WidgetAuthScreen } from "../screens/widget-auth-screen";
import { useAtomValue } from "jotai";
import { screenAtom } from "@/modules/widget/atoms/widget-atoms";
import { WidgetErrorScreen } from "../screens/widget-error-screen";
import { WidgetLoadingScreen } from "../screens/widget-loading-screen";

interface Props {
  organizationId: string | null;
}

export function WidgetView({ organizationId }: Props) {
  const screen = useAtomValue(screenAtom)

  const screenComponents = {
    loading: <WidgetLoadingScreen organizationId={organizationId}/>,
    error: <WidgetErrorScreen />,
    selection: <p>Selection</p>,
    voice: <p>Voice</p>,
    auth: <WidgetAuthScreen />,
    inbox: <p>Inbox</p>,
    chat: <p>Chat</p>,
    contact: <p>Contact</p>
  }

  return (
    <main className="min-h-screen min-w-screen flex h-full w-full flex-col overflow-hidden rounded-xl border bg-muted">
        {screenComponents[screen]}
    </main>
  );
}