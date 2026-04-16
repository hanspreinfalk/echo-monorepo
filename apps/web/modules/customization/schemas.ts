import { z } from "zod";
import { WIDGET_THEME_DEFAULT_HEX } from "@workspace/ui/lib/widget-default-appearance-hex";
import type { Doc } from "@workspace/backend/_generated/dataModel";

const optionalHex = z
  .string()
  .refine(
    (v) => v === "" || /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(v),
    "Use #RGB or #RRGGBB",
  );

const widgetAppearanceSchema = z.object({
  primaryColor: optionalHex,
  primaryGradientEndColor: optionalHex,
  headerForegroundColor: optionalHex,
  backgroundColor: optionalHex,
  foregroundColor: optionalHex,
  mutedColor: optionalHex,
  mutedForegroundColor: optionalHex,
  borderColor: optionalHex,
  launcherButtonColor: optionalHex,
});

export const widgetSettingsSchema = z.object({
  greetMessage: z.string().min(1, "Greeting message is required"),
  showLogo: z.boolean(),
  defaultSuggestions: z.object({
    suggestion1: z.string().optional(),
    suggestion2: z.string().optional(),
    suggestion3: z.string().optional(),
  }),
  appearance: widgetAppearanceSchema,
});

export type WidgetAppearanceForm = z.infer<typeof widgetAppearanceSchema>;

const HEX_VALID = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

const APPEARANCE_KEYS = [
  "primaryColor",
  "primaryGradientEndColor",
  "headerForegroundColor",
  "backgroundColor",
  "foregroundColor",
  "mutedColor",
  "mutedForegroundColor",
  "borderColor",
] as const satisfies readonly (keyof WidgetAppearanceForm)[];

function hexMatchesDefault(key: (typeof APPEARANCE_KEYS)[number], v: string) {
  const def = WIDGET_THEME_DEFAULT_HEX[key];
  return v.toLowerCase() === def.toLowerCase();
}

export type ConvexAppearanceFields = Partial<
  Record<(typeof APPEARANCE_KEYS)[number] | "launcherButtonColor", string>
>;

/** Strips empty strings and theme-default hex values (Convex stores only overrides). */
export function appearanceForConvex(
  appearance: WidgetAppearanceForm | undefined,
): ConvexAppearanceFields {
  if (!appearance) {
    return {};
  }
  const out: ConvexAppearanceFields = {};
  for (const key of APPEARANCE_KEYS) {
    const v = appearance[key];
    if (!v || !HEX_VALID.test(v)) {
      continue;
    }
    if (hexMatchesDefault(key, v)) {
      continue;
    }
    out[key] = v;
  }
  const launcher = appearance.launcherButtonColor?.trim();
  if (launcher && HEX_VALID.test(launcher)) {
    out.launcherButtonColor = launcher;
  }
  return out;
}

/** Form defaults: theme hex, overridden by any valid hex saved on the org. */
export function mergeAppearanceForForm(
  saved: Doc<"widgetSettings">["appearance"] | undefined,
): WidgetAppearanceForm {
  const out: WidgetAppearanceForm = { ...WIDGET_THEME_DEFAULT_HEX };
  if (!saved) {
    return out;
  }
  for (const key of APPEARANCE_KEYS) {
    const v = saved[key];
    if (typeof v === "string" && HEX_VALID.test(v)) {
      out[key] = v;
    }
  }
  const lv = saved.launcherButtonColor;
  if (typeof lv === "string" && HEX_VALID.test(lv)) {
    out.launcherButtonColor = lv;
  }
  return out;
}
