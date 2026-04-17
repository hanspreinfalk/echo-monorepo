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

const SNIPPETS = {
  html: `<!-- 1) Load the embed script with data-hide-launcher="true"
     so the default floating button never appears. -->
<script
  src="${SCRIPT_SRC}"
  data-organization-id="{{ORGANIZATION_ID}}"
  data-hide-launcher="true"
></script>

<!-- 2) Add your own button anywhere on the page. -->
<button onclick="Bryan.toggle()">Chat with us</button>

<!-- Or use separate open / close controls: -->
<button onclick="Bryan.show()">Open chat</button>
<button onclick="Bryan.hide()">Close chat</button>`,
  react: `// components/BryanWidget.tsx
import { useEffect, useCallback } from "react";

declare global {
  interface Window {
    Bryan?: {
      show: () => void;
      hide: () => void;
      toggle: () => void;
      setUser: (user: {
        name: string;
        email: string;
        pictureUrl?: string;
      }) => void;
      clearUser: () => void;
    };
  }
}

const SCRIPT_ID = "bryan-widget-script";

export function BryanWidget() {
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
    s.setAttribute("data-hide-launcher", "true");
    document.body.appendChild(s);
  }, []);

  return null;
}

// Use this hook in any component that needs
// to open or close the chat.
export function useBryanChat() {
  const open = useCallback(() => window.Bryan?.show(), []);
  const close = useCallback(() => window.Bryan?.hide(), []);
  const toggle = useCallback(() => window.Bryan?.toggle(), []);
  return { open, close, toggle };
}

// Usage:
// function ContactButton() {
//   const { toggle } = useBryanChat();
//   return <button onClick={toggle}>Chat with us</button>;
// }`,
  nextjs: `// app/bryan-widget.tsx
"use client";

import Script from "next/script";
import { useCallback } from "react";

declare global {
  interface Window {
    Bryan?: {
      show: () => void;
      hide: () => void;
      toggle: () => void;
      setUser: (user: {
        name: string;
        email: string;
        pictureUrl?: string;
      }) => void;
      clearUser: () => void;
    };
  }
}

export function BryanWidget() {
  return (
    <Script
      src="${SCRIPT_SRC}"
      data-organization-id="{{ORGANIZATION_ID}}"
      data-hide-launcher="true"
      strategy="afterInteractive"
    />
  );
}

export function useBryanChat() {
  const open = useCallback(() => window.Bryan?.show(), []);
  const close = useCallback(() => window.Bryan?.hide(), []);
  const toggle = useCallback(() => window.Bryan?.toggle(), []);
  return { open, close, toggle };
}

// app/layout.tsx
// import { BryanWidget } from "./bryan-widget";
// <BryanWidget />

// Any component:
// import { useBryanChat } from "./bryan-widget";
// function HelpButton() {
//   const { toggle } = useBryanChat();
//   return <button onClick={toggle}>Need help?</button>;
// }`,
  javascript: `// Vanilla JS — works with Vue, Svelte, Angular,
// or any framework.

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
  s.setAttribute("data-hide-launcher", "true");
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
export function openChat() {
  loadBryan();
  whenBryanReady((bryan) => bryan.show());
}

export function closeChat() {
  whenBryanReady((bryan) => bryan.hide());
}

export function toggleChat() {
  loadBryan();
  whenBryanReady((bryan) => bryan.toggle());
}

// Example: wire up a button
// document.querySelector("#my-chat-btn")
//   .addEventListener("click", toggleChat);`,
} as const;

type SnippetKey = keyof typeof SNIPPETS;

const TABS: { id: SnippetKey; label: string; hint: string }[] = [
  {
    id: "html",
    label: "HTML",
    hint: "Add data-hide-launcher=\"true\" to the script tag and call Bryan.show(), Bryan.hide(), or Bryan.toggle() from your own button.",
  },
  {
    id: "react",
    label: "React",
    hint: "Mount <BryanWidget /> near the root. Use the useBryanChat() hook from any component to open, close, or toggle the chat panel.",
  },
  {
    id: "nextjs",
    label: "Next.js",
    hint: "App Router with next/script. Render <BryanWidget /> in app/layout.tsx and use the useBryanChat() hook in any client component.",
  },
  {
    id: "javascript",
    label: "JavaScript",
    hint: "Framework-agnostic. Use this with Vue, Svelte, Angular, or any vanilla JS app. Wire toggleChat() to any click handler.",
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

interface BryanCustomLauncherTutorialDialogProps {
  trigger?: React.ReactNode;
}

export function BryanCustomLauncherTutorialDialog({
  trigger,
}: BryanCustomLauncherTutorialDialogProps) {
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
            View custom launcher guide
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="flex max-h-[min(90vh,44rem)] max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <div className="flex shrink-0 flex-col gap-2 pl-4 pr-12 pt-4">
          <DialogHeader className="space-y-2 text-left">
            <DialogTitle>Use your own button to open Bryan</DialogTitle>
            <DialogDescription>
              Hide the default floating launcher and open the chat panel from
              any element on your page — a nav link, a help button, a banner
              CTA, or anything else.
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
            <p className="text-xs font-medium">Available methods</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-4 text-muted-foreground text-xs leading-relaxed">
              <li>
                <code className="rounded bg-background px-1">Bryan.show()</code>{" "}
                — opens the chat panel.
              </li>
              <li>
                <code className="rounded bg-background px-1">Bryan.hide()</code>{" "}
                — closes the chat panel.
              </li>
              <li>
                <code className="rounded bg-background px-1">Bryan.toggle()</code>{" "}
                — opens if closed, closes if open.
              </li>
              <li>
                You can combine this with{" "}
                <code className="rounded bg-background px-1">
                  Bryan.setUser()
                </code>{" "}
                to identify the visitor and skip the login screen.
              </li>
            </ul>
          </div>

          <div className="rounded-md border bg-muted/40 p-3">
            <p className="text-xs font-medium">How it works</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-4 text-muted-foreground text-xs leading-relaxed">
              <li>
                Adding{" "}
                <code className="rounded bg-background px-1">
                  data-hide-launcher=&quot;true&quot;
                </code>{" "}
                to the embed script tag prevents the floating button from rendering.
              </li>
              <li>
                The chat iframe is still created in the background, so{" "}
                <code className="rounded bg-background px-1">Bryan.show()</code>{" "}
                opens instantly when called.
              </li>
              <li>
                All other features (user identification, page agent, console
                forwarding) work exactly the same.
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
