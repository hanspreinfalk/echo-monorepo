export const EMBED_CONFIG = {
  WIDGET_URL: import.meta.env.VITE_WIDGET_URL || "http://localhost:3001",
  CONVEX_SITE_URL:
    import.meta.env.VITE_CONVEX_SITE_URL || "https://wandering-beagle-503.convex.site",
  DEFAULT_ORG_ID: "org_3Arp0CczSlsryrsBbIqBi5WlaTJ",
  DEFAULT_POSITION: "bottom-right" as const,
};