"use client";

import type { ChatMessageAttribution } from "@workspace/ui/lib/agent-thread-chat-rows";
import { cn } from "@workspace/ui/lib/utils";

export interface MessageSenderBadgeProps {
  attribution: ChatMessageAttribution;
  className?: string;
}

function labelFor(attribution: ChatMessageAttribution): string {
  switch (attribution.kind) {
    case "system":
      return "System";
    case "bot":
      return "Bot";
    case "human":
      return "Human";
    default: {
      const _x: never = attribution;
      return _x;
    }
  }
}

function titleFor(attribution: ChatMessageAttribution): string | undefined {
  if (attribution.kind === "human") {
    return attribution.name ? `Human · ${attribution.name}` : "Human";
  }
  return undefined;
}

export function MessageSenderBadge({
  attribution,
  className,
}: MessageSenderBadgeProps) {
  const tone =
    attribution.kind === "human"
      ? "border-emerald-500/35 bg-emerald-500/[0.12] text-emerald-900 dark:text-emerald-100"
      : attribution.kind === "bot"
        ? "border-border/80 bg-muted/70 text-muted-foreground"
        : "border-border/60 bg-muted/40 text-muted-foreground";

  return (
    <span
      title={titleFor(attribution)}
      className={cn(
        "inline-flex w-fit max-w-full shrink-0 items-center rounded-md border px-1.5 py-0.5 text-[10px] font-semibold leading-none tracking-wide uppercase",
        tone,
        className,
      )}
    >
      {labelFor(attribution)}
    </span>
  );
}
