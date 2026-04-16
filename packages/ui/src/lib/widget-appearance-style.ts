import type { CSSProperties } from "react";
import { WIDGET_THEME_DEFAULT_HEX } from "./widget-default-appearance-hex";

/** Mirrors Convex `widgetSettings.appearance` (optional fields). */
export type WidgetAppearance = {
  primaryColor?: string;
  primaryGradientEndColor?: string;
  headerForegroundColor?: string;
  backgroundColor?: string;
  foregroundColor?: string;
  mutedColor?: string;
  mutedForegroundColor?: string;
  borderColor?: string;
  /** Host-page floating launcher (embed script only). */
  launcherButtonColor?: string;
};

/**
 * Theme defaults plus non-empty form/saved fields — same merge the widget iframe uses
 * ({@link widgetAppearanceToStyle}).
 */
export function mergeWidgetAppearance(
  appearance: WidgetAppearance | undefined,
): WidgetAppearance {
  const merged: WidgetAppearance = { ...WIDGET_THEME_DEFAULT_HEX };
  if (appearance) {
    for (const key of Object.keys(appearance) as (keyof WidgetAppearance)[]) {
      const v = appearance[key];
      if (typeof v === "string" && v !== "") {
        merged[key] = v;
      }
    }
  }
  return merged;
}

export function widgetAppearanceToStyle(
  appearance: WidgetAppearance | undefined,
): CSSProperties | undefined {
  const merged = mergeWidgetAppearance(appearance);
  const s: Record<string, string> = {};
  if (merged.primaryColor) {
    s["--primary"] = merged.primaryColor;
    s["--ring"] = merged.primaryColor;
    s["--chat-bubble-outbound-from"] = merged.primaryColor;
    // Text on outbound bubbles should use the header foreground (contrast against primary).
    // Fall back to --primary-foreground via the CSS variable chain in AIMessageContent.
    s["--chat-bubble-outbound-text"] = "var(--primary-foreground)";
  }
  if (merged.primaryGradientEndColor) {
    s["--widget-gradient-end"] = merged.primaryGradientEndColor;
    s["--chat-bubble-outbound-to"] = merged.primaryGradientEndColor;
  } else if (merged.primaryColor) {
    s["--chat-bubble-outbound-to"] = merged.primaryColor;
  }
  if (merged.headerForegroundColor) {
    s["--primary-foreground"] = merged.headerForegroundColor;
  }
  if (merged.backgroundColor) {
    s["--background"] = merged.backgroundColor;
    s["--card"] = merged.backgroundColor;
    s["--popover"] = merged.backgroundColor;
    s["--muted"] = `color-mix(in oklch, ${merged.backgroundColor} 88%, white 12%)`;
    s["--sidebar"] = `color-mix(in oklch, ${merged.backgroundColor} 92%, white 8%)`;
    s["--sidebar-accent"] = `color-mix(in oklch, ${merged.backgroundColor} 78%, white 22%)`;
    /** Inbound / assistant bubbles ({@link AIMessageContent}) */
    s["--chat-bubble-inbound-bg"] = merged.backgroundColor;
  }
  if (merged.mutedColor) {
    s["--muted"] = merged.mutedColor;
  }
  if (merged.foregroundColor) {
    s["--foreground"] = merged.foregroundColor;
    s["--card-foreground"] = merged.foregroundColor;
    s["--popover-foreground"] = merged.foregroundColor;
  }
  if (merged.mutedForegroundColor) {
    s["--muted-foreground"] = merged.mutedForegroundColor;
  }
  if (merged.borderColor) {
    s["--border"] = merged.borderColor;
    s["--input"] = merged.borderColor;
    s["--chat-bubble-inbound-border"] = merged.borderColor;
  }
  return s as CSSProperties;
}
