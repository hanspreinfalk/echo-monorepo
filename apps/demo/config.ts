export const EMBED_CONFIG = {
  WIDGET_URL: import.meta.env.VITE_WIDGET_URL || "http://localhost:3001",
  /** Convex site URL (same host as `/embed/openai/...`). Used to load widget appearance for the launcher. */
  CONVEX_SITE_URL:
    import.meta.env.VITE_CONVEX_SITE_URL || "https://wandering-beagle-503.convex.site",
  DEFAULT_ORG_ID: "org_3CQBgW3E4y5oI5UsfCBg2UHt46h",
  DEFAULT_POSITION: "bottom-right" as const,
};