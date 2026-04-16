"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { Control, FieldPath } from "react-hook-form";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { useRef, useState } from "react";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormDescription,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Separator } from "@workspace/ui/components/separator";
import { Switch } from "@workspace/ui/components/switch";
import { Textarea } from "@workspace/ui/components/textarea";
import { Doc } from "@workspace/backend/_generated/dataModel";
import { useAction, useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { FormSchema } from "../../types";
import { WIDGET_THEME_DEFAULT_HEX } from "@workspace/ui/lib/widget-default-appearance-hex";
import {
  appearanceForConvex,
  mergeAppearanceForForm,
  widgetSettingsSchema,
} from "../../schemas";
import { WidgetAppearancePreview } from "./widget-appearance-preview";
import { ImageIcon, Loader2Icon, Trash2Icon, UploadIcon } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

type WidgetSettings = Doc<"widgetSettings">;

function AppearanceColorField({
  control,
  name,
  label,
  description,
  fallbackHex,
  placeholderHex,
}: {
  control: Control<FormSchema>;
  name: FieldPath<FormSchema>;
  label: string;
  description?: string;
  fallbackHex: string;
  placeholderHex: string;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <div className="flex flex-wrap items-center gap-2">
            <FormControl>
              <input
                aria-label={`${label} color picker`}
                className="h-10 w-14 cursor-pointer rounded-md border border-input bg-background"
                type="color"
                value={
                  typeof field.value === "string" && field.value.startsWith("#")
                    ? field.value
                    : fallbackHex
                }
                onChange={(e) => field.onChange(e.target.value)}
              />
            </FormControl>
            <Input
              className="max-w-[10rem] font-mono text-sm"
              placeholder={placeholderHex}
              {...field}
              value={typeof field.value === "string" ? field.value : ""}
            />
          </div>
          {description ? (
            <FormDescription>{description}</FormDescription>
          ) : null}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

interface LogoUploadProps {
  logoUrl: string | undefined;
  onLogoChange: (url: string | undefined) => void;
}

function LogoUpload({ logoUrl, onLogoChange }: LogoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const uploadLogo = useAction(api.private.widgetSettings.uploadLogo);
  const removeLogo = useMutation(api.private.widgetSettings.removeLogo);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5 MB");
      return;
    }

    setIsUploading(true);
    try {
      const bytes = await file.arrayBuffer();
      const result = await uploadLogo({ bytes, mimeType: file.type });
      onLogoChange(result.logoUrl ?? undefined);
      toast.success("Logo uploaded");
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload logo");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await removeLogo({});
      onLogoChange(undefined);
      toast.success("Logo removed");
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove logo");
    } finally {
      setIsRemoving(false);
    }
  };

  const isBusy = isUploading || isRemoving;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium leading-none">Assistant logo</p>
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted",
            logoUrl && "bg-transparent",
          )}
        >
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt="Logo"
              className="size-full object-contain p-1"
            />
          ) : (
            <ImageIcon className="size-6 text-muted-foreground" />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <input
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            type="file"
            onChange={handleFileChange}
          />
          <Button
            disabled={isBusy}
            onClick={() => fileInputRef.current?.click()}
            size="sm"
            type="button"
            variant="outline"
          >
            {isUploading ? (
              <Loader2Icon className="size-3.5 animate-spin" />
            ) : (
              <UploadIcon className="size-3.5" />
            )}
            {logoUrl ? "Replace" : "Upload image"}
          </Button>
          {logoUrl && (
            <Button
              disabled={isBusy}
              onClick={handleRemove}
              size="sm"
              type="button"
              variant="ghost"
              className="text-destructive hover:text-destructive"
            >
              {isRemoving ? (
                <Loader2Icon className="size-3.5 animate-spin" />
              ) : (
                <Trash2Icon className="size-3.5" />
              )}
              Remove
            </Button>
          )}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        PNG, JPG or SVG · max 5 MB · shown next to assistant messages in the widget.
      </p>
    </div>
  );
}

interface CustomizationFormProps {
  initialData?: WidgetSettings | null;
}

export const CustomizationForm = ({
  initialData,
}: CustomizationFormProps) => {
  const upsertWidgetSettings = useMutation(api.private.widgetSettings.upsert);

  const [logoUrl, setLogoUrl] = useState<string | undefined>(
    initialData?.logoUrl ?? undefined,
  );

  const form = useForm<FormSchema>({
    resolver: zodResolver(widgetSettingsSchema),
    defaultValues: {
      greetMessage:
        initialData?.greetMessage || "Hi! How can I help you today?",
      showLogo: initialData?.showLogo !== false,
      defaultSuggestions: {
        suggestion1: initialData?.defaultSuggestions.suggestion1 || "",
        suggestion2: initialData?.defaultSuggestions.suggestion2 || "",
        suggestion3: initialData?.defaultSuggestions.suggestion3 || "",
      },
      appearance: mergeAppearanceForForm(initialData?.appearance),
    },
  });

  const watchedAppearance = useWatch({
    control: form.control,
    name: "appearance",
  });
  const watchedGreet = useWatch({
    control: form.control,
    name: "greetMessage",
  });
  const watchedSuggestions = useWatch({
    control: form.control,
    name: "defaultSuggestions",
  });
  const onSubmit = async (values: FormSchema) => {
    try {
      await upsertWidgetSettings({
        greetMessage: values.greetMessage,
        showLogo: values.showLogo,
        defaultSuggestions: values.defaultSuggestions,
        appearance: appearanceForConvex(values.appearance),
      });

      toast.success("Widget settings saved");
    } catch(error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>General Chat Settings</CardTitle>
            <CardDescription>
              Configure basic chat widget behavior and messages
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="greetMessage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Greeting Message</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Welcome message shown when chat open"
                      rows={3}
                    />
                  </FormControl>
                  <FormDescription>
                    The first message customers see when they open the chat
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="showLogo"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="mr-4 space-y-1">
                    <FormLabel>Show assistant logo</FormLabel>
                    <FormDescription>
                      Toggle the logo next to assistant messages in the embedded
                      widget
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <LogoUpload logoUrl={logoUrl} onLogoChange={setLogoUrl} />

            <Separator />

            <div className="space-y-4">
              <div>
                <h3 className="mb-4 text-sm">
                  Default Suggestions
                </h3>
                <p className="mb-4 text-muted-foreground text-sm">
                  Quick reply suggestions shown to customers to help guide the
                  conversation
                </p>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="defaultSuggestions.suggestion1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Suggestion 1</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g., How do I get started?"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="defaultSuggestions.suggestion2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Suggestion 2</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g., What are your pricing plans?"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="defaultSuggestions.suggestion3"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Suggestion 3</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g., I need help with my account"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Widget appearance</CardTitle>
            <CardDescription>
              Hex colors (#RGB or #RRGGBB). Theme fields use standard light defaults;
              only values that differ from those defaults are stored. The host-page
              launcher color is saved whenever set—leave it empty to hide the floating
              button until you choose a color.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <WidgetAppearancePreview
              appearance={watchedAppearance ?? WIDGET_THEME_DEFAULT_HEX}
              defaultSuggestions={
                watchedSuggestions ?? {
                  suggestion1: "",
                  suggestion2: "",
                  suggestion3: "",
                }
              }
              greetMessage={
                typeof watchedGreet === "string"
                  ? watchedGreet
                  : form.getValues("greetMessage")
              }
            />
            <Separator />
            <div className="grid gap-6 sm:grid-cols-2">
              <AppearanceColorField
                control={form.control}
                description="Background fill for the round chat button on your website (embed script). The button appears only after this is saved and loaded—leave empty to hide it."
                fallbackHex={WIDGET_THEME_DEFAULT_HEX.launcherButtonColor}
                label="Host-page launcher button"
                name="appearance.launcherButtonColor"
                placeholderHex={WIDGET_THEME_DEFAULT_HEX.launcherButtonColor}
              />
              <AppearanceColorField
                control={form.control}
                description="Header gradient start, primary buttons, user message bubble, and focus rings."
                fallbackHex={WIDGET_THEME_DEFAULT_HEX.primaryColor}
                label="Primary"
                name="appearance.primaryColor"
                placeholderHex={WIDGET_THEME_DEFAULT_HEX.primaryColor}
              />
              <AppearanceColorField
                control={form.control}
                description="Bottom of the header gradient and user message bubble."
                fallbackHex={WIDGET_THEME_DEFAULT_HEX.primaryGradientEndColor}
                label="Primary gradient end"
                name="appearance.primaryGradientEndColor"
                placeholderHex={WIDGET_THEME_DEFAULT_HEX.primaryGradientEndColor}
              />
              <AppearanceColorField
                control={form.control}
                description="Text and icons on the header and in user-sent bubbles."
                fallbackHex={WIDGET_THEME_DEFAULT_HEX.headerForegroundColor}
                label="On-primary text"
                name="appearance.headerForegroundColor"
                placeholderHex={WIDGET_THEME_DEFAULT_HEX.headerForegroundColor}
              />
              <AppearanceColorField
                control={form.control}
                description="Main widget panel and cards."
                fallbackHex={WIDGET_THEME_DEFAULT_HEX.backgroundColor}
                label="Background"
                name="appearance.backgroundColor"
                placeholderHex={WIDGET_THEME_DEFAULT_HEX.backgroundColor}
              />
              <AppearanceColorField
                control={form.control}
                description="Primary text color."
                fallbackHex={WIDGET_THEME_DEFAULT_HEX.foregroundColor}
                label="Foreground"
                name="appearance.foregroundColor"
                placeholderHex={WIDGET_THEME_DEFAULT_HEX.foregroundColor}
              />
              <AppearanceColorField
                control={form.control}
                description="Secondary surfaces (e.g. soft panels)."
                fallbackHex={WIDGET_THEME_DEFAULT_HEX.mutedColor}
                label="Muted surface"
                name="appearance.mutedColor"
                placeholderHex={WIDGET_THEME_DEFAULT_HEX.mutedColor}
              />
              <AppearanceColorField
                control={form.control}
                description="Secondary text and timestamps."
                fallbackHex={WIDGET_THEME_DEFAULT_HEX.mutedForegroundColor}
                label="Muted text"
                name="appearance.mutedForegroundColor"
                placeholderHex={WIDGET_THEME_DEFAULT_HEX.mutedForegroundColor}
              />
              <AppearanceColorField
                control={form.control}
                description="Borders and input outlines."
                fallbackHex={WIDGET_THEME_DEFAULT_HEX.borderColor}
                label="Border"
                name="appearance.borderColor"
                placeholderHex={WIDGET_THEME_DEFAULT_HEX.borderColor}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button disabled={form.formState.isSubmitting} type="submit">
            Save Settings
          </Button>
        </div>
      </form>
    </Form>
  );
};
