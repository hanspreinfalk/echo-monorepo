'use client'

import { WidgetAuthScreen } from "../screens/widget-auth-screen";
import { useAtomValue } from "jotai";
import { useMemo } from "react";
import { screenAtom, widgetSettingsAtom } from "@/modules/widget/atoms/widget-atoms";
import { useHostContextBridge } from "@/modules/widget/hooks/use-host-context-bridge";
import { widgetAppearanceToStyle } from "@workspace/ui/lib/widget-appearance-style";
import { WidgetErrorScreen } from "../screens/widget-error-screen";
import { WidgetLoadingScreen } from "../screens/widget-loading-screen";
import { WidgetSelectionScreen } from "../screens/widget-selection-screen";
import { WidgetChatScreen } from "../screens/widget-chat-screen";

interface Props {
  organizationId: string | null;
}

export function WidgetView({ organizationId }: Props) {
  const screen = useAtomValue(screenAtom)
  const widgetSettings = useAtomValue(widgetSettingsAtom);
  const themeStyle = useMemo(
    () => widgetAppearanceToStyle(widgetSettings?.appearance),
    [widgetSettings?.appearance],
  );
  useHostContextBridge();

  const screenComponents = {
    loading: <WidgetLoadingScreen organizationId={organizationId}/>,
    error: <WidgetErrorScreen />,
    selection: <WidgetSelectionScreen />,
    voice: <p>Voice</p>,
    auth: <WidgetAuthScreen />,
    chat: <WidgetChatScreen />,
    contact: <p>Contact</p>
  }

  return (
    <main
      className="flex h-dvh max-h-dvh w-full min-h-0 flex-col overflow-hidden rounded-2xl bg-background"
      style={themeStyle}
    >
        {screenComponents[screen]}
    </main>
  );
}