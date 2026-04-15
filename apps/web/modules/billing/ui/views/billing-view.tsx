"use client";

import { api } from "@workspace/backend/_generated/api";
import { useAction, useQuery } from "convex/react";
import { Button } from "@workspace/ui/components/button";
import { CreditCardIcon, Loader2Icon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { PricingCards } from "../components/pricing-cards";

export const BillingView = () => {
  const subscription = useQuery(api.public.billing.getSubscription);
  const pay = useAction(api.stripe.pay);
  const openBillingPortal = useAction(api.stripe.billingPortal);

  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [isPortalLoading, setIsPortalLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") {
      toast.success("Subscription activated");
      window.history.replaceState({}, "", window.location.pathname);
    }
    if (params.get("cancel") === "true") {
      toast.message("Checkout canceled");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const activePlan =
    subscription === undefined
      ? undefined
      : subscription?.status === "active" && subscription?.plan === "pro"
        ? ("pro" as const)
        : ("free" as const);

  const hasActiveSubscription = subscription?.status === "active";

  const cancelAtDate =
    subscription?.cancelAt != null ? new Date(subscription.cancelAt) : null;

  const handlePlanSwitch = useCallback(
    async (plan: "free" | "pro") => {
      if (plan === "pro") {
        setIsCheckoutLoading(true);
        try {
          const url = await pay({ plan: "pro" });
          if (url) {
            window.location.assign(url);
          } else {
            toast.error("Could not start checkout");
          }
        } catch (error) {
          console.error(error);
          const message =
            error instanceof Error ? error.message : "Could not start checkout";
          toast.error(message);
        } finally {
          setIsCheckoutLoading(false);
        }
        return;
      }

      toast.message(
        "To move to Free, open the billing portal and cancel your Pro subscription.",
      );
    },
    [pay],
  );

  const handleManageBilling = useCallback(async () => {
    setIsPortalLoading(true);
    try {
      const url = await openBillingPortal();
      if (url) {
        window.location.assign(url);
      } else {
        toast.error("Could not open billing portal");
      }
    } catch (error) {
      console.error(error);
      const message =
        error instanceof Error ? error.message : "Could not open billing portal";
      toast.error(message);
    } finally {
      setIsPortalLoading(false);
    }
  }, [openBillingPortal]);

  if (activePlan === undefined) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-muted p-8">
        <Loader2Icon className="text-muted-foreground size-8 animate-spin" />
        <p className="text-muted-foreground text-sm">Loading plans…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted p-8">
      <div className="mx-auto w-full max-w-screen-md">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-4xl">Plans & Billing</h1>
            <p className="text-muted-foreground">
              Choose the plan that&apos;s right for you
            </p>
          </div>
          {hasActiveSubscription && (
            <Button
              type="button"
              variant="outline"
              disabled={isPortalLoading || isCheckoutLoading}
              onClick={handleManageBilling}
              className="shrink-0 gap-2"
            >
              {isPortalLoading ? (
                <>
                  <Loader2Icon className="size-4 animate-spin" />
                  Opening…
                </>
              ) : (
                <>
                  <CreditCardIcon className="size-4" />
                  Billing
                </>
              )}
            </Button>
          )}
        </div>

        <div className="mt-8">
          <PricingCards
            activePlan={activePlan}
            onSwitch={handlePlanSwitch}
            isCheckoutLoading={isCheckoutLoading}
            cancelAtDate={cancelAtDate}
            onResubscribe={handleManageBilling}
          />
        </div>
      </div>
    </div>
  );
};
