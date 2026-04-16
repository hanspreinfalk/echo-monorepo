import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

/** Matches embed `resolveLauncherButtonColors` — host launcher only uses valid #hex. */
const LAUNCHER_HEX_RE = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
const DEFAULT_EMBED_LAUNCHER_BUTTON = "#020202";

function normalizedLauncherColor(raw: string | undefined): string | undefined {
  if (typeof raw !== "string") return undefined;
  const t = raw.trim();
  if (!t || !LAUNCHER_HEX_RE.test(t)) return undefined;
  return t;
}

const corsHeaders = (): Record<string, string> => ({
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
});

export const embedWidgetAppearanceOptions = httpAction(async () => {
  return new Response(null, { status: 204, headers: corsHeaders() });
});

/** Public appearance payload for the host-page launcher (no auth). */
export const embedWidgetAppearanceGet = httpAction(async (ctx, request) => {
  const headers = { "Content-Type": "application/json", ...corsHeaders() };
  const url = new URL(request.url);
  const organizationId = url.searchParams.get("organizationId")?.trim();
  if (!organizationId) {
    return new Response(JSON.stringify({ error: "organizationId is required" }), {
      status: 400,
      headers,
    });
  }

  const settings = await ctx.runQuery(api.public.widgetSettings.getByOrganizationId, {
    organizationId,
  });

  if (!settings) {
    return new Response(JSON.stringify({ appearance: null }), { status: 200, headers });
  }

  const saved = settings.appearance;
  const base =
    saved !== null && saved !== undefined && typeof saved === "object" ? { ...saved } : {};
  const appearance = {
    ...base,
    launcherButtonColor:
      normalizedLauncherColor(
        "launcherButtonColor" in base
          ? (base as { launcherButtonColor?: string }).launcherButtonColor
          : undefined,
      ) ?? DEFAULT_EMBED_LAUNCHER_BUTTON,
  };

  return new Response(JSON.stringify({ appearance }), { status: 200, headers });
});
