import type { CSSProperties } from "react";

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
};

export function widgetAppearanceToStyle(
  appearance: WidgetAppearance | undefined,
): CSSProperties | undefined {
  if (!appearance) {
    return undefined;
  }
  const s: Record<string, string> = {};
  if (appearance.primaryColor) {
    s["--primary"] = appearance.primaryColor;
    s["--ring"] = appearance.primaryColor;
  }
  if (appearance.primaryGradientEndColor) {
    s["--widget-gradient-end"] = appearance.primaryGradientEndColor;
  }
  if (appearance.headerForegroundColor) {
    s["--primary-foreground"] = appearance.headerForegroundColor;
  }
  if (appearance.backgroundColor) {
    s["--background"] = appearance.backgroundColor;
    s["--card"] = appearance.backgroundColor;
    s["--popover"] = appearance.backgroundColor;
  }
  if (appearance.mutedColor) {
    s["--muted"] = appearance.mutedColor;
  }
  if (appearance.foregroundColor) {
    s["--foreground"] = appearance.foregroundColor;
    s["--card-foreground"] = appearance.foregroundColor;
    s["--popover-foreground"] = appearance.foregroundColor;
  }
  if (appearance.mutedForegroundColor) {
    s["--muted-foreground"] = appearance.mutedForegroundColor;
  }
  if (appearance.borderColor) {
    s["--border"] = appearance.borderColor;
    s["--input"] = appearance.borderColor;
  }
  return Object.keys(s).length ? (s as CSSProperties) : undefined;
}
