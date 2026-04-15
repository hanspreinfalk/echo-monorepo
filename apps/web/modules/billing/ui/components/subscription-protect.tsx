"use client";

import { api } from "@workspace/backend/_generated/api";
import { useQuery } from "convex/react";
import { Loader2Icon } from "lucide-react";

type SubscriptionProtectProps = {
  children: React.ReactNode;
  fallback: React.ReactNode;
};

export const SubscriptionProtect = ({
  children,
  fallback,
}: SubscriptionProtectProps) => {
  const subscription = useQuery(api.public.billing.getSubscription);

  if (subscription === undefined) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2Icon
          aria-hidden
          className="size-8 animate-spin text-muted-foreground"
        />
      </div>
    );
  }

  const hasPro =
    subscription !== null &&
    subscription.status === "active" &&
    subscription.plan === "pro";

  if (!hasPro) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
