import type { Doc } from "../../_generated/dataModel";

/**
 * Formats contact session + device/locale/display metadata for the support agent system prompt.
 */
export function formatVisitorContextForAgent(
  contactSession: Doc<"contactSessions">,
): string {
  const blocks: string[] = [];

  const identityLines: string[] = [
    `- Name: ${contactSession.name}`,
    `- Email: ${contactSession.email}`,
  ];
  blocks.push("## Visitor identity\n" + identityLines.join("\n"));

  const m = contactSession.metadata;

  if (!m) {
    blocks.push(
      "## Device & environment\n- No device metadata on file (session may predate telemetry).",
    );
    return blocks.join("\n\n");
  }

  const deviceLines: string[] = [];
  if (m.userAgent) {
    deviceLines.push(`- User agent (raw): ${m.userAgent}`);
  }
  if (m.platform) {
    deviceLines.push(`- Platform / OS hint (navigator.platform): ${m.platform}`);
  }
  if (m.vendor) {
    deviceLines.push(`- Browser vendor (navigator.vendor): ${m.vendor}`);
  }
  if (m.cookieEnabled !== undefined) {
    deviceLines.push(`- Cookies enabled (navigator.cookieEnabled): ${m.cookieEnabled}`);
  }
  if (deviceLines.length > 0) {
    blocks.push("## Device & browser\n" + deviceLines.join("\n"));
  }

  const localeLines: string[] = [];
  if (m.language) {
    localeLines.push(`- Primary language (navigator.language): ${m.language}`);
  }
  if (m.languages) {
    localeLines.push(`- Preferred languages (navigator.languages): ${m.languages}`);
  }
  if (m.timezone) {
    localeLines.push(`- IANA timezone: ${m.timezone}`);
  }
  if (m.timezoneOffset !== undefined) {
    localeLines.push(
      `- Timezone offset from UTC (minutes, Date.getTimezoneOffset): ${m.timezoneOffset}`,
    );
  }
  if (localeLines.length > 0) {
    blocks.push("## Locale & time\n" + localeLines.join("\n"));
  }

  const displayLines: string[] = [];
  if (m.screenResolution) {
    displayLines.push(`- Physical screen (approx.): ${m.screenResolution}`);
  }
  if (m.viewportSize) {
    displayLines.push(`- Browser viewport (inner width×height): ${m.viewportSize}`);
  }
  if (displayLines.length > 0) {
    blocks.push("## Display\n" + displayLines.join("\n"));
  }

  const urlLines: string[] = [];
  if (m.referrer) {
    urlLines.push(`- Referrer: ${m.referrer}`);
  }
  if (m.currentUrl) {
    urlLines.push(`- Widget iframe URL: ${m.currentUrl}`);
  }
  if (m.hostPageUrl) {
    urlLines.push(`- Customer site URL (host page, when embed reports it): ${m.hostPageUrl}`);
  }
  if (urlLines.length > 0) {
    blocks.push("## URLs & navigation\n" + urlLines.join("\n"));
  }

  if (m.hostConsoleLogs && m.hostConsoleLogs.length > 0) {
    /** Prompt cap; Convex stores more (see patchHostContext). Lines are verbatim embed capture. */
    const logLines = m.hostConsoleLogs.slice(-80).map((line) => `  ${line}`);
    blocks.push(
      "## Host page console (recent)\n" +
        "One string per console invocation on the host page (same text the embed records for that call; uncaught errors add a synthetic summary line).\n" +
        logLines.join("\n"),
    );
  }

  const hasDeviceOrLocale =
    deviceLines.length > 0 ||
    localeLines.length > 0 ||
    displayLines.length > 0 ||
    urlLines.length > 0;

  if (!hasDeviceOrLocale && !(m.hostConsoleLogs && m.hostConsoleLogs.length)) {
    blocks.push(
      "## Device & environment\n- Extended device/locale/display fields were not captured for this session.",
    );
  }

  return blocks.join("\n\n");
}
