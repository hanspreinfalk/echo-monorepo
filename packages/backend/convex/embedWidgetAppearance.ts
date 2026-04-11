import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

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

  return new Response(
    JSON.stringify({
      appearance: settings?.appearance ?? null,
    }),
    { status: 200, headers },
  );
});
