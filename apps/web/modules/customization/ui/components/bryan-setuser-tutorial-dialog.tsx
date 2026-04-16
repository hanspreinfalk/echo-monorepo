"use client";

import { useMemo, useState } from "react";
import { useOrganization } from "@clerk/nextjs";
import { CheckIcon, CopyIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";

const SCRIPT_SRC = "https://widget.bryan.chat/widget.js";

/** Snippets are templates with `{{ORGANIZATION_ID}}` placeholders so the dialog can fill the user's real org id. */
const SNIPPETS = {
  html: `<!-- 1) Drop the embed script into your page (e.g. before </body>). -->
<script
  src="${SCRIPT_SRC}"
  data-organization-id="{{ORGANIZATION_ID}}"
></script>

<!-- 2) Identify the signed-in visitor.
     The script exposes window.Bryan once it loads. -->
<script>
  // If you load the embed in <head>, wrap this in
  // window.addEventListener('load', ...).
  window.Bryan?.setUser({
    name: "Ada Lovelace",
    email: "ada@example.com",
    pictureUrl: "https://i.pravatar.cc/100?u=ada",
  });
</script>`,
  react: `// components/BryanWidget.tsx
import { useEffect } from "react";

type BryanUser = {
  name: string;
  email: string;
  pictureUrl?: string;
};

declare global {
  interface Window {
    Bryan?: {
      setUser: (user: BryanUser) => void;
      clearUser: () => void;
    };
  }
}

const SCRIPT_ID = "bryan-widget-script";

export function BryanWidget({
  user,
}: {
  user: BryanUser | null;
}) {
  // Load the embed script once.
  useEffect(() => {
    if (document.getElementById(SCRIPT_ID)) return;
    const s = document.createElement("script");
    s.id = SCRIPT_ID;
    s.src = "${SCRIPT_SRC}";
    s.async = true;
    s.setAttribute(
      "data-organization-id",
      "{{ORGANIZATION_ID}}",
    );
    document.body.appendChild(s);
  }, []);

  // Push the current user (or sign them out)
  // whenever it changes.
  useEffect(() => {
    let cancelled = false;
    const apply = () => {
      if (cancelled || !window.Bryan) return false;
      if (user) window.Bryan.setUser(user);
      else window.Bryan.clearUser();
      return true;
    };
    if (apply()) return;
    // Bryan may not exist yet — poll briefly while
    // the script finishes loading.
    const id = window.setInterval(() => {
      if (apply()) window.clearInterval(id);
    }, 100);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [user]);

  return null;
}

// Usage:
// <BryanWidget user={currentUser ?? null} />`,
  nextjs: `// app/bryan-widget.tsx
"use client";

import Script from "next/script";
import { useEffect } from "react";

type BryanUser = {
  name: string;
  email: string;
  pictureUrl?: string;
};

declare global {
  interface Window {
    Bryan?: {
      setUser: (user: BryanUser) => void;
      clearUser: () => void;
    };
  }
}

export function BryanWidget({
  user,
}: {
  user: BryanUser | null;
}) {
  useEffect(() => {
    let cancelled = false;
    const apply = () => {
      if (cancelled || !window.Bryan) return false;
      if (user) window.Bryan.setUser(user);
      else window.Bryan.clearUser();
      return true;
    };
    if (apply()) return;
    const id = window.setInterval(() => {
      if (apply()) window.clearInterval(id);
    }, 100);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [user]);

  return (
    <Script
      src="${SCRIPT_SRC}"
      data-organization-id="{{ORGANIZATION_ID}}"
      strategy="afterInteractive"
    />
  );
}

// app/layout.tsx
// import { BryanWidget } from "./bryan-widget";
//
// const user = await getCurrentUser();
// <BryanWidget
//   user={user ? {
//     name: user.name,
//     email: user.email,
//     pictureUrl: user.image,
//   } : null}
// />`,
  javascript: `// Vanilla JS — works with Vue, Svelte, Angular,
// or any framework. Drop this in your app entry point.

const ORG_ID = "{{ORGANIZATION_ID}}";
const SCRIPT_SRC = "${SCRIPT_SRC}";

function loadBryan() {
  if (document.getElementById("bryan-widget-script")) {
    return;
  }
  const s = document.createElement("script");
  s.id = "bryan-widget-script";
  s.src = SCRIPT_SRC;
  s.async = true;
  s.setAttribute("data-organization-id", ORG_ID);
  document.body.appendChild(s);
}

// Wait for window.Bryan to exist, then run cb.
function whenBryanReady(cb) {
  if (window.Bryan) return cb(window.Bryan);
  const id = setInterval(() => {
    if (window.Bryan) {
      clearInterval(id);
      cb(window.Bryan);
    }
  }, 100);
}

// Public helpers your app can call.
export function identifyUser(user) {
  loadBryan();
  whenBryanReady((bryan) => bryan.setUser(user));
}

export function signOutUser() {
  whenBryanReady((bryan) => bryan.clearUser());
}

// Example
// identifyUser({
//   name: "Ada Lovelace",
//   email: "ada@example.com",
//   pictureUrl: "https://i.pravatar.cc/100?u=ada",
// });`,
} as const;

type SnippetKey = keyof typeof SNIPPETS;

const TABS: { id: SnippetKey; label: string; hint: string }[] = [
  {
    id: "html",
    label: "HTML",
    hint: "Place the second <script> after the embed. If you load the embed in <head>, wait for window 'load' before calling setUser.",
  },
  {
    id: "react",
    label: "React",
    hint: "Mount near the root and pass user from your auth provider (Clerk, Auth.js, Supabase…). Pass null on sign-out.",
  },
  {
    id: "nextjs",
    label: "Next.js",
    hint: "App Router with next/script. Render <BryanWidget /> in app/layout.tsx so it's available on every route.",
  },
  {
    id: "javascript",
    label: "JavaScript",
    hint: "Framework-agnostic. Use this with Vue, Svelte, Angular, or any vanilla JS app.",
  },
];

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Copied to clipboard");
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <div className="group relative min-w-0">
      <pre className="max-h-[320px] min-w-0 overflow-auto whitespace-pre rounded-md bg-foreground p-3 pr-10 font-mono text-secondary text-xs leading-relaxed">
        <code>{code}</code>
      </pre>
      <Button
        aria-label="Copy snippet"
        className="absolute top-2 right-2 size-7 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
        onClick={handleCopy}
        size="icon"
        variant="secondary"
        type="button"
      >
        {copied ? (
          <CheckIcon className="size-3.5" />
        ) : (
          <CopyIcon className="size-3.5" />
        )}
      </Button>
    </div>
  );
}

interface BryanSetUserTutorialDialogProps {
  /** Optional custom trigger button. When omitted, renders a default outline button. */
  trigger?: React.ReactNode;
}

/**
 * Walkthrough for `Bryan.setUser(...)` in HTML / React / Next.js.
 *
 * Snippets are filled with the current Clerk org id so the user can copy and
 * paste straight into their app. If the org isn't loaded yet (e.g. the user
 * hasn't picked one), `{{ORGANIZATION_ID}}` is left as a placeholder.
 *
 * Layout follows `github-integration-guide-dialog.tsx`: a fixed header,
 * scrollable body, and footer in a flex column with `min-w-0` everywhere so
 * long lines inside the code block scroll horizontally instead of stretching
 * the dialog.
 */
export function BryanSetUserTutorialDialog({
  trigger,
}: BryanSetUserTutorialDialogProps) {
  const [open, setOpen] = useState(false);
  const { organization } = useOrganization();
  const orgId = organization?.id ?? "{{ORGANIZATION_ID}}";

  const snippets = useMemo(
    () =>
      Object.fromEntries(
        (Object.entries(SNIPPETS) as [SnippetKey, string][]).map(
          ([key, value]) => [key, value.replaceAll("{{ORGANIZATION_ID}}", orgId)],
        ),
      ) as Record<SnippetKey, string>,
    [orgId],
  );

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button type="button" variant="outline" size="sm">
            View setup guide
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="flex max-h-[min(90vh,44rem)] max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <div className="flex shrink-0 flex-col gap-2 pl-4 pr-12 pt-4">
          <DialogHeader className="space-y-2 text-left">
            <DialogTitle>Identify users with Bryan.setUser(…)</DialogTitle>
            <DialogDescription>
              Skip the manual login screen by passing the signed-in visitor
              straight from your app. The widget reuses an existing contact
              session for that email or creates a new one.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-4 py-4">
          <Tabs defaultValue="html" className="min-w-0">
            <TabsList className="w-full">
              {TABS.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {TABS.map((tab) => (
              <TabsContent
                key={tab.id}
                value={tab.id}
                className="mt-3 min-w-0 space-y-2"
              >
                <CodeBlock code={snippets[tab.id]} />
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {tab.hint}
                </p>
              </TabsContent>
            ))}
          </Tabs>

          <div className="rounded-md border bg-muted/40 p-3">
            <p className="text-xs font-medium">How identification works</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-4 text-muted-foreground text-xs leading-relaxed">
              <li>
                Email is the unique key per organization — calling{" "}
                <code className="rounded bg-background px-1">setUser</code>{" "}
                twice with the same email reuses the same contact session.
              </li>
              <li>
                Combine with{" "}
                <strong>Show launcher only for identified users</strong> to
                hide the widget from anonymous visitors entirely.
              </li>
              <li>
                Call{" "}
                <code className="rounded bg-background px-1">
                  Bryan.clearUser()
                </code>{" "}
                on sign-out to drop the local session.
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter className="mx-0 mb-0 flex shrink-0 flex-row flex-wrap items-center justify-end gap-2 rounded-b-xl border-t bg-muted/50 px-4 py-3 sm:flex-row sm:justify-end">
          <Button
            onClick={() => setOpen(false)}
            type="button"
            variant="outline"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
