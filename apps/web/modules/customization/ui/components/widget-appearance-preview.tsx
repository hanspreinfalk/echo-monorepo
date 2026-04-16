"use client";

import { AISuggestion, AISuggestions } from "@workspace/ui/components/ai/suggestion";
import {
  AIConversation,
  AIConversationContent,
} from "@workspace/ui/components/ai/conversation";
import {
  AIInput,
  AIInputButton,
  AIInputSubmit,
  AIInputTextarea,
  AIInputToolbar,
  AIInputTools,
} from "@workspace/ui/components/ai/input";
import { AIMessage, AIMessageContent } from "@workspace/ui/components/ai/message";
import { MessageSenderBadge } from "@workspace/ui/components/ai/message-sender-badge";
import { AIResponse } from "@workspace/ui/components/ai/response";
import { Button } from "@workspace/ui/components/button";
import { EmbedChatLauncherIcon } from "@workspace/ui/lib/embed-chat-launcher-icon";
import {
  mergeWidgetAppearance,
  widgetAppearanceToStyle,
} from "@workspace/ui/lib/widget-appearance-style";
import { cn } from "@workspace/ui/lib/utils";
import { ArrowLeftIcon, MenuIcon, PaperclipIcon } from "lucide-react";
import type { FormSchema } from "../../types";

type PreviewProps = {
  appearance: FormSchema["appearance"];
  defaultSuggestions: FormSchema["defaultSuggestions"];
  greetMessage: string;
  className?: string;
};

const HEX = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

function expandHex3(h: string): string {
  if (h.length === 6) return h;
  return h
    .split("")
    .map((c) => c + c)
    .join("");
}

function parseHexRgb(hex: string): [number, number, number] | null {
  const m = hex.trim().match(HEX);
  const cap = m?.[1];
  if (cap === undefined) return null;
  const h = expandHex3(cap);
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function hexToRgba(hex: string, alpha: number): string {
  const rgb = parseHexRgb(hex);
  if (!rgb) return `rgba(0, 0, 0, ${alpha})`;
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
}

function relativeLuminance(r: number, g: number, b: number): number {
  const lin = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * lin[0]! + 0.7152 * lin[1]! + 0.0722 * lin[2]!;
}

function contrastingIconColor(bgHex: string): string {
  const rgb = parseHexRgb(bgHex);
  if (!rgb) return "#ffffff";
  const L = relativeLuminance(rgb[0], rgb[1], rgb[2]);
  return L > 0.45 ? "#171717" : "#ffffff";
}

function pickLauncherIconColor(
  launcherBg: string,
  effective: ReturnType<typeof mergeWidgetAppearance>,
): string {
  const onPrimary = effective.headerForegroundColor?.trim();
  if (onPrimary && HEX.test(onPrimary)) return onPrimary;
  const panelBg = effective.backgroundColor?.trim();
  if (panelBg && HEX.test(panelBg)) return panelBg;
  return contrastingIconColor(launcherBg);
}

/** Same key order as widget chat (`Object.keys` on saved suggestions). */
function suggestionChipsFromForm(
  defaultSuggestions: FormSchema["defaultSuggestions"],
): string[] {
  const keys = ["suggestion1", "suggestion2", "suggestion3"] as const;
  const out: string[] = [];
  for (const key of keys) {
    const raw = defaultSuggestions[key]?.trim();
    if (raw) out.push(raw);
  }
  return out;
}

export function WidgetAppearancePreview({
  appearance,
  defaultSuggestions,
  greetMessage,
  className,
}: PreviewProps) {
  const themeStyle = widgetAppearanceToStyle(appearance);
  const effective = mergeWidgetAppearance(appearance);
  const suggestionChips = suggestionChipsFromForm(defaultSuggestions);

  const greeting =
    greetMessage.trim() ||
    "Hi! How can I help you today?";

  const launcherRaw = appearance.launcherButtonColor?.trim();
  const launcherValid =
    typeof launcherRaw === "string" && HEX.test(launcherRaw);
  const launcherHex = launcherValid ? launcherRaw : undefined;

  const launcherFabStyle = launcherHex
    ? {
        backgroundColor: launcherHex,
        color: pickLauncherIconColor(launcherHex, effective),
        boxShadow: `0 4px 24px ${hexToRgba(launcherHex, 0.35)}`,
      }
    : undefined;

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-muted-foreground text-sm font-medium">Preview</p>
      <div className="overflow-hidden rounded-xl border border-border bg-zinc-200/70 dark:bg-zinc-900/40">
        <p className="border-b border-zinc-300/80 bg-zinc-100/90 px-3 py-1.5 text-[11px] text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-400">
          Host page (neutral) — launcher only on your site; panel matches the widget
        </p>
        <div className="relative min-h-[300px] p-4 sm:min-h-[380px] sm:p-6">
          <div
            className="relative z-10 mx-auto flex h-[min(420px,55vh)] min-h-[320px] w-full max-w-[300px] flex-col overflow-hidden rounded-2xl border border-border bg-background text-foreground shadow-md"
            style={themeStyle}
          >
            {/* Matches {@link WidgetChatScreen} header + {@link WidgetHeader} */}
            <header
              className={cn(
                "bg-linear-to-b from-primary to-[var(--widget-gradient-end)]",
                "flex items-center justify-between p-4 text-primary-foreground",
              )}
            >
              <div className="flex items-center gap-x-2">
                <Button
                  size="icon"
                  type="button"
                  variant="transparent"
                  tabIndex={-1}
                  className="pointer-events-none"
                  aria-hidden
                >
                  <ArrowLeftIcon />
                </Button>
                <p>Chat</p>
              </div>
              <Button
                size="icon"
                type="button"
                variant="transparent"
                tabIndex={-1}
                className="pointer-events-none"
                aria-hidden
              >
                <MenuIcon />
              </Button>
            </header>

            {/* Matches widget: muted column = conversation + suggestions only */}
            <div className="flex min-h-0 flex-1 flex-col bg-muted">
              <AIConversation className="min-h-0 flex-1">
                <AIConversationContent>
                  <AIMessage from="assistant">
                    <div className="flex flex-col gap-2">
                      <MessageSenderBadge
                        attribution={{ kind: "bot" }}
                        className="self-start"
                      />
                      <AIMessageContent>
                        <AIResponse>{greeting}</AIResponse>
                      </AIMessageContent>
                    </div>
                  </AIMessage>
                  <AIMessage from="user">
                    <div className="flex flex-col gap-2">
                      <AIMessageContent>
                        <AIResponse>I have a question about pricing.</AIResponse>
                      </AIMessageContent>
                    </div>
                  </AIMessage>
                </AIConversationContent>
              </AIConversation>

              {suggestionChips.length > 0 ? (
                <AISuggestions className="flex w-full flex-col items-end p-2">
                  {suggestionChips.map((suggestion) => (
                    <AISuggestion
                      key={suggestion}
                      disabled
                      suggestion={suggestion}
                      tabIndex={-1}
                    />
                  ))}
                </AISuggestions>
              ) : null}
            </div>

            {/* Same block order/classes as {@link WidgetChatScreen} composer */}
            <div className="relative">
              <AIInput
                className="rounded-none border-x-0 border-b-0"
                onSubmit={(e) => e.preventDefault()}
              >
                <AIInputTextarea
                  readOnly
                  tabIndex={-1}
                  placeholder="Type your message..."
                  defaultValue=""
                  className="pointer-events-none"
                />
                <AIInputToolbar>
                  <AIInputTools>
                    <AIInputButton
                      type="button"
                      disabled
                      tabIndex={-1}
                      className="pointer-events-none"
                    >
                      <PaperclipIcon />
                      Attach
                    </AIInputButton>
                  </AIInputTools>
                  <AIInputSubmit
                    disabled
                    status="ready"
                    type="submit"
                    tabIndex={-1}
                    className="pointer-events-none"
                  />
                </AIInputToolbar>
              </AIInput>
            </div>
          </div>

          {launcherFabStyle && launcherHex ? (
            <div
              className="pointer-events-none absolute right-4 bottom-4 z-20 flex size-[60px] items-center justify-center rounded-full transition-[background-color,box-shadow,color] duration-150"
              style={launcherFabStyle}
              aria-hidden
            >
              <EmbedChatLauncherIcon className="shrink-0" aria-hidden />
            </div>
          ) : (
            <div
              className="pointer-events-none absolute right-4 bottom-4 z-20 flex size-[3.75rem] flex-col items-center justify-center rounded-full border-2 border-dashed border-zinc-400/50 bg-white/80 text-center text-[9px] font-medium text-zinc-500 leading-tight dark:border-zinc-600 dark:bg-zinc-950/80 dark:text-zinc-400"
              aria-hidden
            >
              No
              <br />
              launcher
            </div>
          )}
        </div>
      </div>
      <p className="text-muted-foreground text-xs">
        Same layout and components as the widget chat screen (header,{" "}
        <code className="rounded bg-muted px-1">AIConversation</code>,{" "}
        <code className="rounded bg-muted px-1">AISuggestions</code>,{" "}
        <code className="rounded bg-muted px-1">AIInput</code>
        ), plus embed FAB.
      </p>
    </div>
  );
}
