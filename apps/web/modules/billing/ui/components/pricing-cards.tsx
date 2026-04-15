"use client";

import { PRO_PRICE_USD } from "@workspace/backend/convex/pricing";
import { CheckIcon } from "lucide-react";

const proFeatures = [
  "AI Customer Support",
  "Knowledge Base",
  "Team Access",
  "Widget Customization",
  "Custom Tools",
  "Page Control",
  "Github Integration",
];

interface PricingCardsProps {
  activePlan?: "free" | "pro";
  onSwitch?: (plan: "free" | "pro") => void;
  isCheckoutLoading?: boolean;
  /** When true, omits the bottom CTA row (e.g. marketing / landing page). */
  hideFooterActions?: boolean;
  /** When set, a cancellation is scheduled — Free card shows upcoming date, Pro card shows Resubscribe. */
  cancelAtDate?: Date | null;
  /** Called when the user clicks Resubscribe on a scheduled-cancellation Pro card. */
  onResubscribe?: () => void;
}

export const PricingCards = ({
  activePlan = "free",
  onSwitch,
  isCheckoutLoading = false,
  hideFooterActions = false,
  cancelAtDate,
  onResubscribe,
}: PricingCardsProps) => {
  const cancellationScheduled = !!cancelAtDate;

  const formattedCancelDate = cancelAtDate
    ? cancelAtDate.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {/* Free Card */}
      <div className="flex flex-col rounded-lg border border-border bg-background">
        <div className="p-4">
          <div className="flex items-start justify-between">
            <h2 className="text-base font-bold">Free</h2>
            {cancellationScheduled && (
              <span className="rounded-md border border-border px-1.5 py-0.5 text-xs text-muted-foreground">
                Upcoming
              </span>
            )}
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold">$0</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Always free</p>
        </div>
        {!hideFooterActions && (
          <>
            <div className="flex-1" />
            <div className="p-4 pt-0">
              {cancellationScheduled ? (
                <div className="flex h-9 w-full items-center justify-center rounded-md border border-border px-2 text-sm text-muted-foreground">
                  Starts {formattedCancelDate}
                </div>
              ) : activePlan === "free" ? (
                <div className="flex h-9 w-full items-center justify-center rounded-md border border-border px-2 text-sm font-medium">
                  Active
                </div>
              ) : (
                <button
                  type="button"
                  disabled={isCheckoutLoading}
                  onClick={() => onSwitch?.("free")}
                  className="h-9 w-full rounded-md bg-black px-4 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-white/90 dark:hover:opacity-100"
                >
                  Switch to this plan
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Pro Card */}
      <div className="flex flex-col rounded-lg border border-border bg-background">
        <div className="p-4">
          <div className="flex items-start justify-between">
            <h2 className="text-base font-bold">Pro</h2>
            {activePlan === "pro" && (
              <span className="rounded-md bg-black px-1.5 py-0.5 text-xs text-white dark:bg-white dark:text-black">
                Active
              </span>
            )}
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold">${PRO_PRICE_USD}</span>
            <span className="text-xs text-muted-foreground">/month</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Only billed monthly</p>
        </div>

        <div className="border-t border-border px-6 py-5">
          <ul className="space-y-3">
            {proFeatures.map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-sm">
                <CheckIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {!hideFooterActions && (
          <div className="p-4 pt-0">
            {activePlan !== "pro" ? (
              <button
                type="button"
                disabled={isCheckoutLoading}
                onClick={() => onSwitch?.("pro")}
                className="h-9 w-full rounded-md bg-black px-4 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-white/90 dark:hover:opacity-100"
              >
                {isCheckoutLoading ? "Redirecting…" : "Switch to this plan"}
              </button>
            ) : cancellationScheduled ? (
              <button
                type="button"
                onClick={onResubscribe}
                className="h-9 w-full rounded-md bg-black px-4 text-sm font-medium text-white transition-opacity hover:opacity-90 dark:bg-white dark:text-black dark:hover:opacity-90"
              >
                Resubscribe
              </button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};
