"use client";

import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { ExternalLinkIcon } from "lucide-react";
import Image from "next/image";

export type GithubIntegrationGuideKind =
  | "github-setup"
  | "auto-merge"
  | "supabase"
  | "convex"
  | "vercel"
  | "sentry";

const GUIDE_META: Record<
  GithubIntegrationGuideKind,
  { title: string; description: string }
> = {
  "github-setup": {
    title: "GitHub repository setup",
    description:
      "Required once per repository so Actions can open PRs and call Anthropic.",
  },
  "auto-merge": {
    title: "Auto-merge PR",
    description:
      "Optional workflow step that enables GitHub auto-merge on the PR Claude opens.",
  },
  supabase: {
    title: "Supabase MCP",
    description:
      "HTTP MCP server and repository secrets for project ref and access token.",
  },
  convex: {
    title: "Convex MCP",
    description: "Stdio MCP via npx; authenticate with a deploy key in Actions.",
  },
  vercel: {
    title: "Vercel MCP",
    description:
      "Stdio MCP via @vercel/sdk; authenticate with a Vercel token in repository secrets.",
  },
  sentry: {
    title: "Sentry MCP",
    description:
      "Stdio MCP with GitHub Actions secrets—token auth, not OAuth in the generated workflow.",
  },
};

const FOOTER_EXTERNAL: Partial<
  Record<GithubIntegrationGuideKind, { href: string; label: string }>
> = {
  supabase: { href: "https://supabase.com/dashboard", label: "Open Supabase" },
  convex: { href: "https://dashboard.convex.dev", label: "Open Convex" },
  vercel: {
    href: "https://vercel.com/account/tokens",
    label: "Vercel tokens",
  },
  sentry: { href: "https://docs.sentry.io/ai/mcp/", label: "Sentry MCP docs" },
};

type GithubIntegrationGuideDialogProps = {
  kind: GithubIntegrationGuideKind | null;
  onOpenChange: (open: boolean) => void;
};

export function GithubIntegrationGuideDialog({
  kind,
  onOpenChange,
}: GithubIntegrationGuideDialogProps) {
  const open = kind !== null;
  const meta = kind ? GUIDE_META[kind] : null;
  const external = kind ? FOOTER_EXTERNAL[kind] : undefined;

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="flex max-h-[min(90vh,44rem)] max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        {meta ? (
          <>
            <div className="flex shrink-0 flex-col gap-2 pl-4 pr-12 pt-4">
              <DialogHeader className="space-y-2 text-left">
                <DialogTitle>{meta.title}</DialogTitle>
                <DialogDescription>{meta.description}</DialogDescription>
              </DialogHeader>
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-4 py-4">
              {kind === "github-setup" ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="rounded-md bg-accent p-2 text-sm">
                      1. Workflow permissions
                    </div>
                    <p className="text-muted-foreground text-sm">
                      In the repository on GitHub, go to{" "}
                      <span className="text-foreground font-medium">Settings</span> →{" "}
                      <span className="text-foreground font-medium">Actions</span> →{" "}
                      <span className="text-foreground font-medium">General</span>. Under{" "}
                      <span className="text-foreground font-medium">Workflow permissions</span>,
                      enable{" "}
                      <span className="text-foreground font-medium">
                        Allow GitHub Actions to create and approve pull requests
                      </span>
                      , then save.
                    </p>
                    <Image
                      alt="GitHub Actions: allow Actions to create and approve pull requests"
                      className="h-auto w-full rounded-md border"
                      height={288}
                      src="/allow-github-actions.png"
                      width={1622}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="rounded-md bg-accent p-2 text-sm">
                      2. Anthropic API secret
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Open{" "}
                      <span className="text-foreground font-medium">Secrets and variables</span> →{" "}
                      <span className="text-foreground font-medium">Actions</span>. Under{" "}
                      <span className="text-foreground font-medium">Repository secrets</span>, add{" "}
                      <code className="rounded bg-muted px-1 py-0.5 text-xs">
                        ANTHROPIC_API_KEY
                      </code>{" "}
                      (the workflow reads{" "}
                      <code className="rounded bg-muted px-1 py-0.5 text-xs">
                        secrets.ANTHROPIC_API_KEY
                      </code>
                      ).
                    </p>
                    <Image
                      alt="GitHub repository Actions secrets including ANTHROPIC_API_KEY"
                      className="h-auto w-full rounded-md border"
                      height={344}
                      src="/repository-secrets.png"
                      width={1628}
                    />
                  </div>
                </div>
              ) : null}

              {kind === "auto-merge" ? (
                <div className="space-y-4">
                  <div className="rounded-md bg-accent p-2 text-sm">What it does</div>
                  <p className="text-muted-foreground text-sm">
                    After Claude opens a PR, a follow-up step runs{" "}
                    <code className="rounded bg-muted px-1 py-0.5 text-xs">
                      gh pr merge --auto --squash --delete-branch
                    </code>
                    . GitHub merges when required checks pass (no bot self-approval).
                  </p>
                  <div className="rounded-md bg-accent p-2 text-sm">Repo settings</div>
                  <p className="text-muted-foreground text-sm">
                    Allow squash merge in the repository. Adjust branch protection so auto-merge can
                    complete (for example, avoid requiring a human approval that blocks Actions-driven
                    PRs, or use rules that allow the workflow to finish).
                  </p>
                </div>
              ) : null}

              {kind === "supabase" ? (
                <div className="space-y-4">
                  <div className="rounded-md bg-accent p-2 text-sm">Repository secrets</div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    In GitHub → <span className="text-foreground font-medium">Secrets and variables</span>{" "}
                    → <span className="text-foreground font-medium">Actions</span>, add{" "}
                    <code className="rounded bg-muted px-1 py-0.5 text-xs">SUPABASE_PROJECT_REF</code>{" "}
                    (project <span className="text-foreground font-medium">Reference ID</span> under
                    Supabase <span className="text-foreground font-medium">Project Settings</span> →{" "}
                    <span className="text-foreground font-medium">General</span>) and{" "}
                    <code className="rounded bg-muted px-1 py-0.5 text-xs">SUPABASE_ACCESS_TOKEN</code>{" "}
                    (personal access token from your Supabase account). If you rename secrets, update the
                    workflow YAML to match.
                  </p>
                </div>
              ) : null}

              {kind === "convex" ? (
                <div className="space-y-4">
                  <div className="rounded-md bg-accent p-2 text-sm">Repository secret</div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    In GitHub → <span className="text-foreground font-medium">Secrets and variables</span>{" "}
                    → <span className="text-foreground font-medium">Actions</span>, add{" "}
                    <code className="rounded bg-muted px-1 py-0.5 text-xs">CONVEX_DEPLOY_KEY</code> so the
                    workflow can run{" "}
                    <code className="rounded bg-muted px-1 py-0.5 text-xs">npx convex mcp start</code>{" "}
                    against your project in the checked-out repo.
                  </p>
                </div>
              ) : null}

              {kind === "vercel" ? (
                <div className="space-y-4">
                  <div className="rounded-md bg-accent p-2 text-sm">Repository secret</div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    In GitHub →{" "}
                    <span className="text-foreground font-medium">Secrets and variables</span> →{" "}
                    <span className="text-foreground font-medium">Actions</span>, add{" "}
                    <code className="rounded bg-muted px-1 py-0.5 text-xs">VERCEL_ACCESS_TOKEN</code>{" "}
                    with a{" "}
                    <a
                      className="text-primary font-medium underline-offset-4 hover:underline"
                      href="https://vercel.com/account/tokens"
                      rel="noreferrer"
                      target="_blank"
                    >
                      Vercel account token
                    </a>
                    . The generated workflow runs the local MCP via{" "}
                    <code className="rounded bg-muted px-1 py-0.5 text-xs">npx</code> and{" "}
                    <code className="rounded bg-muted px-1 py-0.5 text-xs">@vercel/sdk</code>, passing{" "}
                    <code className="rounded bg-muted px-1 py-0.5 text-xs">
                      {"--bearer-token ${{ secrets.VERCEL_ACCESS_TOKEN }}"}
                    </code>{" "}
                    (no OAuth in CI).
                  </p>
                </div>
              ) : null}

              {kind === "sentry" ? (
                <div className="space-y-4">
                  <div className="rounded-md bg-accent p-2 text-sm">Repository secrets</div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    The sample runs{" "}
                    <code className="rounded bg-muted px-1 py-0.5 text-xs">
                      npx @sentry/mcp-server@latest
                    </code>{" "}
                    over stdio and injects{" "}
                    <code className="rounded bg-muted px-1 py-0.5 text-xs">SENTRY_ACCESS_TOKEN</code>,{" "}
                    <code className="rounded bg-muted px-1 py-0.5 text-xs">EMBEDDED_AGENT_PROVIDER=anthropic</code>, and{" "}
                    <code className="rounded bg-muted px-1 py-0.5 text-xs">ANTHROPIC_API_KEY</code> (from{" "}
                    <code className="rounded bg-muted px-1 py-0.5 text-xs">secrets.SENTRY_ACCESS_TOKEN</code> and{" "}
                    <code className="rounded bg-muted px-1 py-0.5 text-xs">secrets.ANTHROPIC_API_KEY</code>).
                    Create the token in Sentry under{" "}
                    <span className="text-foreground font-medium">User Settings → Auth Tokens</span> (or your
                    org’s policy) with the scopes you need—see the{" "}
                    <a
                      className="text-primary font-medium underline-offset-4 hover:underline"
                      href="https://docs.sentry.io/ai/mcp/"
                      rel="noreferrer"
                      target="_blank"
                    >
                      Sentry MCP docs
                    </a>{" "}
                    (stdio and environment variables). For{" "}
                    <span className="text-foreground font-medium">self-hosted</span>, add{" "}
                    <code className="rounded bg-muted px-1 py-0.5 text-xs">SENTRY_HOST</code> (and related
                    env) to the MCP <code className="rounded bg-muted px-1 py-0.5 text-xs">env</code> in the
                    YAML, backed by repository secrets.
                  </p>
                  <div className="rounded-md bg-accent p-2 text-sm">AI search tools</div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Natural-language <code className="rounded bg-muted px-1 py-0.5 text-xs">search_events</code> /{" "}
                    <code className="rounded bg-muted px-1 py-0.5 text-xs">search_issues</code> use the embedded agent;
                    the generated workflow sets{" "}
                    <code className="rounded bg-muted px-1 py-0.5 text-xs">EMBEDDED_AGENT_PROVIDER=anthropic</code> and{" "}
                    <code className="rounded bg-muted px-1 py-0.5 text-xs">ANTHROPIC_API_KEY</code>. To use OpenAI
                    instead, change the provider and swap in{" "}
                    <code className="rounded bg-muted px-1 py-0.5 text-xs">OPENAI_API_KEY</code> per{" "}
                    <a
                      className="text-primary font-medium underline-offset-4 hover:underline"
                      href="https://github.com/getsentry/sentry-mcp/blob/main/docs/embedded-agents.md"
                      rel="noreferrer"
                      target="_blank"
                    >
                      Sentry embedded-agents docs
                    </a>
                    .
                  </p>
                </div>
              ) : null}

            </div>

            <DialogFooter className="mx-0 mb-0 flex shrink-0 flex-row flex-wrap items-center justify-end gap-2 rounded-b-xl border-t bg-muted/50 px-4 py-4 sm:flex-row sm:justify-end">
              {external ? (
                <Button asChild className="gap-2" variant="outline">
                  <a href={external.href} rel="noreferrer" target="_blank">
                    {external.label}
                    <ExternalLinkIcon className="size-4" />
                  </a>
                </Button>
              ) : null}
              <Button onClick={() => onOpenChange(false)} type="button" variant="outline">
                Close
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
