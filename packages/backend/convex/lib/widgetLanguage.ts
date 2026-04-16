/**
 * Backend-side BCP-47 language matching for widget translations.
 *
 * Kept separate from the front-end `@workspace/ui/lib/widget-i18n.ts`
 * table (which ships full UI string bundles) — the backend only needs to
 * pick the right authored greeting/suggestions for a given visitor.
 */

function normalizeLanguageTag(tag: string): string {
  const trimmed = tag.trim();
  if (!trimmed) return "";
  const [primary, ...rest] = trimmed.split("-");
  if (!primary) return "";
  if (rest.length === 0) return primary.toLowerCase();
  return `${primary.toLowerCase()}-${rest.join("-").toUpperCase()}`;
}

/**
 * Pick the best matching tag from `available` for `requested`. Match
 * order mirrors the client helper: exact match → primary-subtag match →
 * `fallback` → first available entry.
 */
export function pickBestLanguage(
  requested: readonly string[] | string | null | undefined,
  available: readonly string[],
  fallback?: string,
): string | undefined {
  if (available.length === 0) return fallback;

  const canonicalAvailable = available.map((a) => ({
    raw: a,
    canonical: normalizeLanguageTag(a),
  }));
  const byCanonical = new Map(
    canonicalAvailable.map((a) => [a.canonical, a.raw]),
  );
  const byPrimary = new Map<string, string>();
  for (const a of canonicalAvailable) {
    const primary = a.canonical.split("-")[0] ?? a.canonical;
    if (!byPrimary.has(primary)) byPrimary.set(primary, a.raw);
  }

  const requestedList = Array.isArray(requested)
    ? requested
    : requested
    ? [requested]
    : [];

  for (const raw of requestedList) {
    const canonical = normalizeLanguageTag(raw);
    if (!canonical) continue;
    const exact = byCanonical.get(canonical);
    if (exact) return exact;
    const primary = canonical.split("-")[0] ?? canonical;
    const primaryMatch = byPrimary.get(primary);
    if (primaryMatch) return primaryMatch;
  }

  if (fallback) {
    const canonicalFb = normalizeLanguageTag(fallback);
    const exact = byCanonical.get(canonicalFb);
    if (exact) return exact;
    const primary = canonicalFb.split("-")[0] ?? canonicalFb;
    const primaryMatch = byPrimary.get(primary);
    if (primaryMatch) return primaryMatch;
  }

  return available[0];
}

type SessionMetadata =
  | {
      language?: string;
      languages?: string;
    }
  | null
  | undefined;

/** Parse the visitor's stored language + languages into an ordered list. */
export function languagesFromSessionMetadata(
  metadata: SessionMetadata,
): string[] {
  if (!metadata) return [];
  const list: string[] = [];
  if (metadata.languages) {
    for (const part of metadata.languages.split(",")) {
      const trimmed = part.trim();
      if (trimmed) list.push(trimmed);
    }
  }
  if (metadata.language) {
    list.push(metadata.language);
  }
  return list;
}

type WidgetGreetingSource = {
  defaultLanguage?: string;
  greetMessage?: string;
  defaultSuggestions?: {
    suggestion1?: string;
    suggestion2?: string;
    suggestion3?: string;
  };
  translations?: ReadonlyArray<{
    language: string;
    greetMessage: string;
    defaultSuggestions: {
      suggestion1?: string;
      suggestion2?: string;
      suggestion3?: string;
    };
  }>;
};

/**
 * Pick the appropriate greetMessage from widget settings for a visitor.
 * Falls back to the default-language greeting when no translation matches.
 */
export function pickGreetMessageForLanguages(
  settings: WidgetGreetingSource | null | undefined,
  requestedLanguages: readonly string[],
): string | undefined {
  if (!settings) return undefined;

  const defaultLang = settings.defaultLanguage || "en";
  const available = [
    defaultLang,
    ...(settings.translations?.map((t) => t.language) ?? []),
  ];

  const best = pickBestLanguage(requestedLanguages, available, defaultLang);
  if (!best || best === defaultLang) return settings.greetMessage;

  const match = settings.translations?.find((t) => t.language === best);
  return match?.greetMessage ?? settings.greetMessage;
}
