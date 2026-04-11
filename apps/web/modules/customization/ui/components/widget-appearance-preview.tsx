import { widgetAppearanceToStyle } from "@workspace/ui/lib/widget-appearance-style";
import { cn } from "@workspace/ui/lib/utils";
import type { FormSchema } from "../../types";

type PreviewProps = {
  appearance: FormSchema["appearance"];
  greetMessage: string;
  showLogo?: boolean;
  suggestionSample?: string;
  className?: string;
};

export function WidgetAppearancePreview({
  appearance,
  greetMessage,
  showLogo = true,
  suggestionSample,
  className,
}: PreviewProps) {
  const themeStyle = widgetAppearanceToStyle(appearance);

  const greeting =
    greetMessage.trim() ||
    "Hi! How can I help you today?";

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-muted-foreground text-sm font-medium">Preview</p>
      <div
        className="mx-auto w-full max-w-[320px] overflow-hidden rounded-xl border border-border bg-background text-foreground shadow-md"
        style={themeStyle}
      >
        <header
          className={cn(
            "bg-linear-to-b from-primary to-[var(--widget-gradient-end)]",
            "px-3 py-3 text-primary-foreground",
          )}
        >
          <p className="text-sm font-semibold leading-tight">Chat</p>
          <p className="mt-1 line-clamp-2 text-xs leading-snug opacity-95">
            {greeting}
          </p>
        </header>

        <div className="flex max-h-[220px] min-h-[140px] flex-col gap-2 overflow-hidden p-3 text-sm">
          <div
            className={cn(
              "flex justify-start gap-2",
              showLogo ? "items-end" : "items-start",
            )}
          >
            {showLogo ? (
              <div
                aria-hidden
                className="size-6 shrink-0 rounded-full border border-border bg-muted"
              />
            ) : null}
            <div
              className={cn(
                "max-w-[88%] rounded-lg border border-border px-2.5 py-2 text-xs leading-snug",
                "bg-background text-foreground",
              )}
            >
              Thanks for reaching out—how can we help?
            </div>
          </div>
          <div className="flex justify-end">
            <div
              className={cn(
                "max-w-[88%] rounded-lg px-2.5 py-2 text-xs leading-snug",
                "bg-linear-to-b from-primary to-[var(--widget-gradient-end)]",
                "text-primary-foreground",
              )}
            >
              I have a question about pricing.
            </div>
          </div>
          {suggestionSample ? (
            <div className="flex flex-wrap justify-end gap-1.5 pt-0.5">
              <span
                className={cn(
                  "rounded-full border border-border bg-background px-2.5 py-1",
                  "text-foreground text-[11px] font-medium",
                )}
              >
                {suggestionSample}
              </span>
            </div>
          ) : null}
        </div>

        <div
          className={cn(
            "flex items-center gap-2 border-t border-border px-2 py-2",
            "bg-background",
          )}
        >
          <div
            className={cn(
              "h-8 min-w-0 flex-1 rounded-md border border-input px-2",
              "text-muted-foreground text-xs leading-8",
            )}
          >
            Type a message…
          </div>
          <div
            className={cn(
              "shrink-0 rounded-md bg-primary px-2.5 py-1.5",
              "text-primary-foreground text-xs font-medium",
            )}
          >
            Send
          </div>
        </div>
      </div>
      <p className="text-muted-foreground text-xs">
        Updates as you edit colors and the greeting above.
      </p>
    </div>
  );
}
