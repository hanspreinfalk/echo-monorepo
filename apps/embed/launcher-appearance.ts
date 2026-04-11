export type EmbedWidgetAppearance = {
  foregroundColor?: string;
  primaryColor?: string;
  headerForegroundColor?: string;
  backgroundColor?: string;
} | undefined;

const HEX_RE = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

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
  if (!rgb) return `rgba(59, 130, 246, ${alpha})`;
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

/** Launcher fill uses saved `foregroundColor`, else `primaryColor`, else default blue. */
export function resolveLauncherButtonColors(appearance: EmbedWidgetAppearance): {
  background: string;
  color: string;
  boxShadow: string;
} {
  const fg = appearance?.foregroundColor;
  if (fg && HEX_RE.test(fg)) {
    return {
      background: fg,
      color: pickIconColor(fg, appearance),
      boxShadow: `0 4px 24px ${hexToRgba(fg, 0.35)}`,
    };
  }
  const primary = appearance?.primaryColor;
  if (primary && HEX_RE.test(primary)) {
    return {
      background: primary,
      color: pickIconColor(primary, appearance),
      boxShadow: `0 4px 24px ${hexToRgba(primary, 0.35)}`,
    };
  }
  const fallback = "#3b82f6";
  return {
    background: fallback,
    color: "#ffffff",
    boxShadow: `0 4px 24px ${hexToRgba(fallback, 0.35)}`,
  };
}

export async function fetchWidgetAppearanceForLauncher(
  convexSiteUrl: string,
  organizationId: string,
): Promise<EmbedWidgetAppearance> {
  const base = convexSiteUrl.replace(/\/$/, "");
  try {
    const res = await fetch(
      `${base}/embed/widget-appearance?organizationId=${encodeURIComponent(organizationId)}`,
    );
    if (!res.ok) return undefined;
    const data = (await res.json()) as { appearance?: EmbedWidgetAppearance };
    return data.appearance ?? undefined;
  } catch {
    return undefined;
  }
}
