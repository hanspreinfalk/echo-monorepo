export type EmbedWidgetAppearance = {
  foregroundColor?: string;
  primaryColor?: string;
  headerForegroundColor?: string;
  backgroundColor?: string;
  launcherButtonColor?: string;
} | undefined;

export type EmbedWidgetSettings = {
  appearance: EmbedWidgetAppearance;
  requireActiveSession: boolean;
};

const HEX_RE = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

/** Keep in sync with `DEFAULT_EMBED_LAUNCHER_BUTTON` in `convex/embedWidgetAppearance.ts`. */
export const DEFAULT_LAUNCHER_BUTTON_COLOR = "#020202";

function expandHex3(h: string): string {
  if (h.length === 6) return h;
  return h
    .split("")
    .map((c) => c + c)
    .join("");
}

export function parseHexRgb(hex: string): [number, number, number] | null {
  const m = hex.trim().match(HEX_RE);
  const cap = m?.[1];
  if (cap === undefined) return null;
  const h = expandHex3(cap);
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function hexToRgba(hex: string, alpha: number): string {
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

function pickIconColor(bgHex: string, appearance: EmbedWidgetAppearance): string {
  const onPrimary = appearance?.headerForegroundColor;
  if (onPrimary && HEX_RE.test(onPrimary)) return onPrimary;
  const panelBg = appearance?.backgroundColor;
  if (panelBg && HEX_RE.test(panelBg)) return panelBg;
  return contrastingIconColor(bgHex);
}

/**
 * Host-page launcher uses only `launcherButtonColor` from widget customization.
 * No default fill — embed waits for settings and omits the button when unset.
 */
export function resolveLauncherButtonColors(
  appearance: EmbedWidgetAppearance,
): { background: string; color: string; boxShadow: string } | null {
  const raw = appearance?.launcherButtonColor?.trim();
  if (!raw || !HEX_RE.test(raw)) {
    return null;
  }
  return {
    background: raw,
    color: pickIconColor(raw, appearance),
    boxShadow: `0 4px 24px ${hexToRgba(raw, 0.35)}`,
  };
}

export async function fetchWidgetAppearanceForLauncher(
  convexSiteUrl: string,
  organizationId: string,
): Promise<EmbedWidgetSettings> {
  const base = convexSiteUrl.replace(/\/$/, "");
  const fallback: EmbedWidgetSettings = {
    appearance: { launcherButtonColor: DEFAULT_LAUNCHER_BUTTON_COLOR },
    requireActiveSession: false,
  };
  try {
    const res = await fetch(
      `${base}/embed/widget-appearance?organizationId=${encodeURIComponent(organizationId)}`,
    );
    if (!res.ok) return fallback;
    const data = (await res.json()) as {
      appearance?: EmbedWidgetAppearance | null;
      requireActiveSession?: boolean;
    };
    return {
      appearance: data.appearance ?? fallback.appearance,
      requireActiveSession: data.requireActiveSession === true,
    };
  } catch {
    return fallback;
  }
}
