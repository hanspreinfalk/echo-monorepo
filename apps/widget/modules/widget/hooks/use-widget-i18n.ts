"use client";

import { useAtomValue } from "jotai";
import { useEffect, useMemo, useState } from "react";
import {
  DEFAULT_WIDGET_LANGUAGE,
  formatWidgetString,
  getWidgetStringsForLanguage,
  pickBestLanguage,
  type WidgetStringKey,
} from "@workspace/ui/lib/widget-i18n";
import { widgetSettingsAtom } from "@/modules/widget/atoms/widget-atoms";

/**
 * Returns the list of BCP-47 language tags reported by the browser.
 *
 * Re-runs on `languagechange` so the widget responds if the user flips
 * their preferred language without a reload. Safe in SSR — returns
 * `[DEFAULT_WIDGET_LANGUAGE]` when `navigator` is unavailable.
 */
function useNavigatorLanguages(): string[] {
  const [languages, setLanguages] = useState<string[]>(() => {
    if (typeof navigator === "undefined") {
      return [DEFAULT_WIDGET_LANGUAGE];
    }
    if (Array.isArray(navigator.languages) && navigator.languages.length > 0) {
      return [...navigator.languages];
    }
    return [navigator.language || DEFAULT_WIDGET_LANGUAGE];
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = () => {
      if (Array.isArray(navigator.languages) && navigator.languages.length > 0) {
        setLanguages([...navigator.languages]);
      } else {
        setLanguages([navigator.language || DEFAULT_WIDGET_LANGUAGE]);
      }
    };
    window.addEventListener("languagechange", handler);
    return () => window.removeEventListener("languagechange", handler);
  }, []);

  return languages;
}

/**
 * The resolved language the widget should use for UI chrome + admin-authored
 * greetings. Picked from the browser's preferred languages, falling back to
 * the organization's defaultLanguage (from widgetSettings), then to English.
 */
export function useWidgetLanguage(): string {
  const widgetSettings = useAtomValue(widgetSettingsAtom);
  const languages = useNavigatorLanguages();

  const settingsDefault =
    widgetSettings?.defaultLanguage?.trim() || DEFAULT_WIDGET_LANGUAGE;

  // Available = default language + any configured translations.
  const availableAuthoredTags = useMemo(() => {
    const set = new Set<string>([settingsDefault]);
    (widgetSettings?.translations ?? []).forEach((t) => {
      if (t.language) set.add(t.language);
    });
    return Array.from(set);
  }, [settingsDefault, widgetSettings?.translations]);

  return useMemo(
    () => pickBestLanguage(languages, availableAuthoredTags, settingsDefault),
    [languages, availableAuthoredTags, settingsDefault],
  );
}

/**
 * Accessor for widget UI chrome strings. The returned `t` function looks
 * up the current language's string table (with English fallback) and
 * interpolates `{name}`-style placeholders.
 */
export function useWidgetStrings() {
  // The widget's UI chrome uses the browser's language directly — not the
  // org's defaultLanguage — so that a German visitor sees "Hallo" even if
  // the org admin authored the greeting only in English.
  const navLanguages = useNavigatorLanguages();
  const settings = useAtomValue(widgetSettingsAtom);
  const uiLanguage = useMemo(() => {
    const fallback = settings?.defaultLanguage || DEFAULT_WIDGET_LANGUAGE;
    return (
      navLanguages[0] ??
      settings?.defaultLanguage ??
      DEFAULT_WIDGET_LANGUAGE ??
      fallback
    );
  }, [navLanguages, settings?.defaultLanguage]);

  const strings = useMemo(
    () => getWidgetStringsForLanguage(uiLanguage),
    [uiLanguage],
  );

  const t = useMemo(
    () =>
      (key: WidgetStringKey, vars?: Record<string, string | number>) => {
        const template = strings[key];
        return vars ? formatWidgetString(template, vars) : template;
      },
    [strings],
  );

  return { t, language: uiLanguage };
}

/**
 * Picks the best admin-authored greeting + suggestions for the current
 * browser language. Falls back to the default-language values stored at
 * the top level of `widgetSettings`.
 */
export function useAuthoredContent() {
  const widgetSettings = useAtomValue(widgetSettingsAtom);
  const language = useWidgetLanguage();

  return useMemo(() => {
    if (!widgetSettings) {
      return {
        greetMessage: "",
        defaultSuggestions: {
          suggestion1: undefined as string | undefined,
          suggestion2: undefined as string | undefined,
          suggestion3: undefined as string | undefined,
        },
        language,
      };
    }

    const defaultLanguage =
      widgetSettings.defaultLanguage?.trim() || DEFAULT_WIDGET_LANGUAGE;

    if (language === defaultLanguage) {
      return {
        greetMessage: widgetSettings.greetMessage,
        defaultSuggestions: widgetSettings.defaultSuggestions,
        language,
      };
    }

    const match = (widgetSettings.translations ?? []).find(
      (t) => t.language === language,
    );
    if (match) {
      return {
        greetMessage: match.greetMessage,
        defaultSuggestions: match.defaultSuggestions,
        language,
      };
    }

    // Shouldn't happen — useWidgetLanguage() only returns available tags —
    // but guard anyway to keep the fallback explicit.
    return {
      greetMessage: widgetSettings.greetMessage,
      defaultSuggestions: widgetSettings.defaultSuggestions,
      language: defaultLanguage,
    };
  }, [widgetSettings, language]);
}
