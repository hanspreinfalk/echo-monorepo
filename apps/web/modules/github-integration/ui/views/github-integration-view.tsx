"use client";

import { api } from "@workspace/backend/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Separator } from "@workspace/ui/components/separator";
import { Switch } from "@workspace/ui/components/switch";
import { cn } from "@workspace/ui/lib/utils";
import { BookOpen, CopyIcon, ExternalLinkIcon, Loader2Icon } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  GithubIntegrationGuideDialog,
  type GithubIntegrationGuideKind,
} from "../components/github-integration-guide-dialog";

type GitHubRepo = {
  id: number;
  full_name: string;
  name: string;
  private: boolean;
  default_branch: string;
  html_url: string;
};

function buildEchoProductIssueWorkflowYaml(
  autoMergePr: boolean,
  enableSupabaseMcp: boolean,
  enableConvexMcp: boolean,
  enableVercelMcp: boolean,
  enableSentryMcp: boolean,
): string {
  const autoMergeSteps = autoMergePr
    ? `
      - name: Enable auto-merge for Claude PR
        run: |
          set -euo pipefail
          HEAD=$(git rev-parse --abbrev-ref HEAD)
          PR_NUM=$(gh pr list --head "$HEAD" --state open --json number -q '.[0].number')
          if [ -z "$PR_NUM" ] || [ "$PR_NUM" = "null" ]; then
            echo "::error::No open PR for branch '$HEAD'. The Claude step should leave the repo on the PR head branch."
            exit 1
          fi
          gh pr merge "$PR_NUM" --auto --squash --delete-branch
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}`
    : "";

  const allowedToolsList = [
    "Edit",
    "MultiEdit",
    "Write",
    "Read",
    "Glob",
    "Grep",
    "LS",
    "WebFetch",
    "WebSearch",
    "Bash(git:*)",
    "Bash(gh:*)",
    "Bash(npm:*)",
    "Bash(npx:*)",
    "Bash(bun:*)",
    "Bash(node:*)",
    "Bash(pnpm:*)",
    "Bash(yarn:*)",
    ...(enableSupabaseMcp ? ["mcp__supabase__*"] : []),
    ...(enableConvexMcp ? ["mcp__convex__*"] : []),
    ...(enableVercelMcp ? ["mcp__vercel__*"] : []),
    ...(enableSentryMcp ? ["mcp__sentry__*"] : []),
  ].join(",");

  const hasMcp =
    enableSupabaseMcp ||
    enableConvexMcp ||
    enableVercelMcp ||
    enableSentryMcp;
  let claudeArgsYaml: string;
  if (!hasMcp) {
    claudeArgsYaml = `          claude_args: "--allowedTools '${allowedToolsList}'"`;
  } else {
    const mcpServers: Record<string, unknown> = {};
    if (enableSupabaseMcp) {
      mcpServers.supabase = {
        type: "http",
        url: "https://mcp.supabase.com/mcp?project_ref=${{ secrets.SUPABASE_PROJECT_REF }}",
        headers: {
          Authorization: "Bearer ${{ secrets.SUPABASE_ACCESS_TOKEN }}",
        },
      };
    }
    if (enableConvexMcp) {
      mcpServers.convex = {
        type: "stdio",
        command: "npx",
        args: ["-y", "convex@latest", "mcp", "start"],
        env: {
          CONVEX_DEPLOY_KEY: "${{ secrets.CONVEX_DEPLOY_KEY }}",
        },
      };
    }
    if (enableVercelMcp) {
      mcpServers.vercel = {
        type: "stdio",
        command: "npx",
        args: [
          "-y",
          "--package",
          "@vercel/sdk",
          "mcp",
          "start",
          "--bearer-token",
          "${{ secrets.VERCEL_ACCESS_TOKEN }}",
        ],
      };
    }
    if (enableSentryMcp) {
      mcpServers.sentry = {
        type: "stdio",
        command: "npx",
        args: ["-y", "@sentry/mcp-server@latest"],
        env: {
          SENTRY_ACCESS_TOKEN: "${{ secrets.SENTRY_ACCESS_TOKEN }}",
          EMBEDDED_AGENT_PROVIDER: "anthropic",
          ANTHROPIC_API_KEY: "${{ secrets.ANTHROPIC_API_KEY }}",
        },
      };
    }
    const prettyMcpJson = JSON.stringify({ mcpServers }, null, 2);
    const jsonLines = prettyMcpJson.split("\n");
    const argIndent = "            ";

    const mcpConfigLines =
      jsonLines.length <= 1
        ? [`${argIndent}--mcp-config '${prettyMcpJson}'`]
        : [
            `${argIndent}--mcp-config '${jsonLines[0]}`,
            ...jsonLines.slice(1, -1).map((line) => `${argIndent}  ${line}`),
            `${argIndent}  ${jsonLines[jsonLines.length - 1]}'`,
          ];

    claudeArgsYaml = `          claude_args: |
${mcpConfigLines.join("\n")}
${argIndent}--allowedTools '${allowedToolsList}'`;
  }

  return `name: Echo product issue

on:
  repository_dispatch:
    types: [echo_product_issue]

permissions:
  contents: write
  pull-requests: write
  issues: write
  id-token: write

jobs:
  claude-fix:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
          ref: \${{ github.event.client_payload.defaultBranch || github.event.repository.default_branch }}

      - name: Run Claude Code and open PR
        uses: anthropics/claude-code-action@v1
        with:
          github_token: \${{ secrets.GITHUB_TOKEN }}
          anthropic_api_key: \${{ secrets.ANTHROPIC_API_KEY }}
          show_full_output: true
          base_branch: \${{ github.event.client_payload.defaultBranch || github.event.repository.default_branch }}
          prompt: |
            Echo product issue (issue id: \${{ github.event.client_payload.issueId }})
            Repository: \${{ github.event.client_payload.repository }}

            Implement the fix in this repository. Commit your changes to a new branch and open a pull request against the base branch. Put a concise summary of the change in the PR description.

            ---

            \${{ github.event.client_payload.prompt }}
${claudeArgsYaml}${autoMergeSteps}`;
}

export const GithubIntegrationView = () => {
  const saved = useQuery(api.private.githubIntegration.getOne);
  const workflowPrefs = useQuery(api.private.githubIntegration.getWorkflowPrefs);
  const setSelectedRepo = useMutation(api.private.githubIntegration.setSelectedRepo);
  const setWorkflowPrefs = useMutation(api.private.githubIntegration.setWorkflowPrefs);

  const [repos, setRepos] = useState<GitHubRepo[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState<GitHubRepo | null>(null);
  const [saving, setSaving] = useState(false);
  const [showRepoPicker, setShowRepoPicker] = useState(false);
  const [guideKind, setGuideKind] = useState<GithubIntegrationGuideKind | null>(null);

  const workflowAutoMergePr = workflowPrefs?.autoMergePr ?? false;
  const workflowSupabaseMcp = workflowPrefs?.supabaseMcp ?? false;
  const workflowConvexMcp = workflowPrefs?.convexMcp ?? false;
  const workflowVercelMcp = workflowPrefs?.vercelMcp ?? false;
  const workflowSentryMcp = workflowPrefs?.sentryMcp ?? false;

  const workflowYaml = useMemo(
    () =>
      buildEchoProductIssueWorkflowYaml(
        workflowAutoMergePr,
        workflowSupabaseMcp,
        workflowConvexMcp,
        workflowVercelMcp,
        workflowSentryMcp,
      ),
    [
      workflowAutoMergePr,
      workflowSupabaseMcp,
      workflowConvexMcp,
      workflowVercelMcp,
      workflowSentryMcp,
    ],
  );

  const persistWorkflowPrefs = useCallback(
    async (next: {
      autoMergePr: boolean;
      supabaseMcp: boolean;
      convexMcp: boolean;
      vercelMcp: boolean;
      sentryMcp: boolean;
    }) => {
      try {
        await setWorkflowPrefs(next);
      } catch {
        toast.error("Could not save workflow preferences.");
      }
    },
    [setWorkflowPrefs],
  );

  const copyWorkflowYaml = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(workflowYaml);
      toast.success("Workflow YAML copied to clipboard");
    } catch {
      toast.error("Could not copy to clipboard");
    }
  }, [workflowYaml]);

  const loadRepos = useCallback(async () => {
    setLoadingRepos(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/github/repos");
      const data = (await res.json()) as {
        repos?: GitHubRepo[];
        error?: string;
      };
      if (!res.ok) {
        setRepos(null);
        setLoadError(data.error ?? "Could not load repositories.");
        return;
      }
      setRepos(data.repos ?? []);
    } catch {
      setRepos(null);
      setLoadError("Could not load repositories.");
    } finally {
      setLoadingRepos(false);
    }
  }, []);

  useEffect(() => {
    if (!repos || selected !== null || saved === undefined) {
      return;
    }
    if (!saved) {
      return;
    }
    const match = repos.find((r) => r.id === saved.githubRepoId);
    if (match) {
      setSelected(match);
    }
  }, [repos, saved, selected]);

  const filtered = useMemo(() => {
    if (repos === null) {
      return [];
    }
    const q = filter.trim().toLowerCase();
    if (!q) {
      return repos;
    }
    return repos.filter((r) => r.full_name.toLowerCase().includes(q));
  }, [repos, filter]);

  const handleSave = async () => {
    if (!selected) {
      toast.error("Select a repository first.");
      return;
    }
    setSaving(true);
    try {
      await setSelectedRepo({
        fullName: selected.full_name,
        githubRepoId: selected.id,
        defaultBranch: selected.default_branch,
        htmlUrl: selected.html_url,
      });
      toast.success("Repository saved for this organization.");
      setShowRepoPicker(false);
    } catch {
      toast.error("Could not save repository.");
    } finally {
      setSaving(false);
    }
  };

  const isLoadingSaved = saved === undefined;
  const prefsLoading = workflowPrefs === undefined;

  const openRepoPicker = () => {
    setShowRepoPicker(true);
    if (repos === null && !loadingRepos) {
      void loadRepos();
    }
  };

  return (
    <>
      <GithubIntegrationGuideDialog
        kind={guideKind}
        onOpenChange={(open) => {
          if (!open) {
            setGuideKind(null);
          }
        }}
      />
      <div className="flex flex-1 flex-col bg-muted p-8">
      <div className="mx-auto w-full max-w-screen-md space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-4xl">GitHub</h1>
          <p className="text-muted-foreground">
            Link a repository to this organization, then add the workflow so Product Issues can open
            fix PRs via <code className="rounded bg-muted px-1 py-0.5 text-xs">repository_dispatch</code>.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Linked repository</CardTitle>
            <CardDescription>
              Saved per organization. Used when you run Fix from Product Issues.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingSaved ? (
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <Loader2Icon className="size-4 animate-spin" />
                Loading…
              </div>
            ) : saved ? (
              <div className="space-y-1">
                <p className="font-mono text-sm font-medium">{saved.fullName}</p>
                <p className="text-muted-foreground text-xs">
                  Default branch: {saved.defaultBranch}
                </p>
                {saved.htmlUrl ? (
                  <a
                    className="text-primary inline-flex items-center gap-1 text-sm hover:underline"
                    href={saved.htmlUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Open on GitHub
                    <ExternalLinkIcon className="size-3.5" />
                  </a>
                ) : null}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No repository linked yet.</p>
            )}

            <div className="flex flex-wrap gap-2">
              <Button
                className="gap-2"
                onClick={() => openRepoPicker()}
                type="button"
                variant={saved ? "outline" : "default"}
              >
                {saved ? "Change repository" : "Select repository"}
              </Button>
            </div>

            {showRepoPicker ? (
              <div className="space-y-4 border-t pt-4">
                {repos !== null ? (
                  <Input
                    disabled={loadingRepos || !!loadError}
                    onChange={(e) => setFilter(e.target.value)}
                    placeholder="Filter repositories…"
                    value={filter}
                  />
                ) : null}

                {loadingRepos ? (
                  <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 py-8 text-sm">
                    <Loader2Icon className="size-6 animate-spin" />
                    Loading repositories from GitHub…
                  </div>
                ) : loadError ? (
                  <div className="space-y-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                    <p className="text-destructive text-sm">{loadError}</p>
                    <Button onClick={() => void loadRepos()} size="sm" variant="outline">
                      Try again
                    </Button>
                  </div>
                ) : repos !== null ? (
                  <>
                    <ScrollArea className="h-[min(360px,45vh)] rounded-md border bg-background">
                      <div className="p-1">
                        {repos.length === 0 ? (
                          <p className="text-muted-foreground p-4 text-sm">
                            No repositories were returned from GitHub.
                          </p>
                        ) : filtered.length === 0 ? (
                          <p className="text-muted-foreground p-4 text-sm">
                            No repositories match your filter.
                          </p>
                        ) : (
                          <ul className="flex flex-col gap-0.5">
                            {filtered.map((repo) => {
                              const isActive = selected?.id === repo.id;
                              return (
                                <li key={repo.id}>
                                  <button
                                    className={cn(
                                      "hover:bg-accent flex w-full flex-col items-start gap-0.5 rounded-md px-3 py-2 text-left text-sm transition-colors outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0",
                                      isActive && "bg-accent",
                                    )}
                                    onClick={() => setSelected(repo)}
                                    type="button"
                                  >
                                    <span className="font-mono font-medium">
                                      {repo.full_name}
                                    </span>
                                    <span className="text-muted-foreground text-xs">
                                      {repo.private ? "Private" : "Public"} ·{" "}
                                      {repo.default_branch}
                                    </span>
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>
                    </ScrollArea>

                    <div className="flex flex-wrap items-center gap-3">
                      <Button
                        disabled={!selected || saving}
                        onClick={() => void handleSave()}
                        type="button"
                      >
                        {saving ? (
                          <>
                            <Loader2Icon className="mr-2 size-4 animate-spin" />
                            Saving…
                          </>
                        ) : (
                          "Save for organization"
                        )}
                      </Button>
                      {selected ? (
                        <span className="text-muted-foreground text-sm">
                          Selected:{" "}
                          <span className="text-foreground font-mono">
                            {selected.full_name}
                          </span>
                        </span>
                      ) : null}
                    </div>
                  </>
                ) : null}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Product issues → Fix now</CardTitle>
            <CardDescription>
              Add this workflow to the linked repo (default branch is fine). From Product Issues,{" "}
              <span className="text-foreground font-medium">Fix</span> sends{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">echo_product_issue</code>. Use{" "}
              <span className="text-foreground font-medium">Instructions</span> on each option for setup
              details; toggles update the sample YAML below.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4 rounded-lg border bg-background/60 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-1">
                  <h3 className="text-sm font-medium">Setup checklist</h3>
                  <p className="text-muted-foreground text-xs">
                    Required once per repository so Actions can open PRs and call Anthropic.
                  </p>
                </div>
                <Button
                  className="shrink-0 gap-2"
                  onClick={() => setGuideKind("github-setup")}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  <BookOpen className="size-4" />
                  Instructions
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-base">Workflow options</Label>
                <p className="text-muted-foreground text-sm">
                  Toggles update the sample YAML and are saved for your organization.
                </p>
              </div>

              <div
                className={cn(
                  "flex flex-col gap-3 rounded-lg border bg-background p-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4",
                  prefsLoading && "opacity-60",
                )}
              >
                <div className="min-w-0 flex-1 space-y-2">
                  <p className="text-sm font-medium">Auto-merge PR</p>
                  <p className="text-muted-foreground text-xs">
                    Adds a workflow step to enable GitHub auto-merge (squash, delete branch) on the PR
                    Claude opens when checks pass.
                  </p>
                  <Button
                    className="gap-2"
                    onClick={() => setGuideKind("auto-merge")}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    <BookOpen className="size-4" />
                    Instructions
                  </Button>
                </div>
                <Switch
                  checked={workflowAutoMergePr}
                  className="shrink-0 sm:mt-1"
                  disabled={prefsLoading}
                  id="workflow-auto-merge"
                  onCheckedChange={(checked) => {
                    if (workflowPrefs === undefined) {
                      return;
                    }
                    void persistWorkflowPrefs({
                      autoMergePr: checked,
                      supabaseMcp: workflowPrefs.supabaseMcp,
                      convexMcp: workflowPrefs.convexMcp,
                      vercelMcp: workflowPrefs.vercelMcp,
                      sentryMcp: workflowPrefs.sentryMcp,
                    });
                  }}
                />
              </div>

              <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2">
                <div
                  className={cn(
                    "flex flex-col gap-3 rounded-lg border bg-background p-4 text-left",
                    prefsLoading && "pointer-events-none opacity-60",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="bg-muted relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md p-1.5">
                        <Image
                          alt="Supabase"
                          className="object-contain"
                          height={28}
                          src="/supabase-logo.svg"
                          width={28}
                        />
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <p className="text-sm font-medium">Supabase MCP</p>
                        <p className="text-muted-foreground text-xs">
                          HTTP MCP + <code className="text-[0.7rem]">mcp__supabase__*</code>. Enable to add
                          it to the sample YAML.
                        </p>
                      </div>
                    </div>
                    <Switch
                      aria-label="Supabase MCP"
                      checked={workflowSupabaseMcp}
                      disabled={prefsLoading}
                      onCheckedChange={(checked) => {
                        if (workflowPrefs === undefined) {
                          return;
                        }
                        void persistWorkflowPrefs({
                          autoMergePr: workflowPrefs.autoMergePr,
                          supabaseMcp: checked,
                          convexMcp: workflowPrefs.convexMcp,
                          vercelMcp: workflowPrefs.vercelMcp,
                          sentryMcp: workflowPrefs.sentryMcp,
                        });
                      }}
                    />
                  </div>
                  <Button
                    className="w-full gap-2 sm:w-auto"
                    onClick={() => setGuideKind("supabase")}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    <BookOpen className="size-4" />
                    Instructions
                  </Button>
                </div>

                <div
                  className={cn(
                    "flex flex-col gap-3 rounded-lg border bg-background p-4 text-left",
                    prefsLoading && "pointer-events-none opacity-60",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="bg-muted relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md p-1.5">
                        <Image
                          alt="Convex"
                          className="object-contain"
                          height={28}
                          src="/convex-logo.webp"
                          width={28}
                        />
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <p className="text-sm font-medium">Convex MCP</p>
                        <p className="text-muted-foreground text-xs">
                          Stdio MCP + <code className="text-[0.7rem]">mcp__convex__*</code>. Enable to add it
                          to the sample YAML.
                        </p>
                      </div>
                    </div>
                    <Switch
                      aria-label="Convex MCP"
                      checked={workflowConvexMcp}
                      disabled={prefsLoading}
                      onCheckedChange={(checked) => {
                        if (workflowPrefs === undefined) {
                          return;
                        }
                        void persistWorkflowPrefs({
                          autoMergePr: workflowPrefs.autoMergePr,
                          supabaseMcp: workflowPrefs.supabaseMcp,
                          convexMcp: checked,
                          vercelMcp: workflowPrefs.vercelMcp,
                          sentryMcp: workflowPrefs.sentryMcp,
                        });
                      }}
                    />
                  </div>
                  <Button
                    className="w-full gap-2 sm:w-auto"
                    onClick={() => setGuideKind("convex")}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    <BookOpen className="size-4" />
                    Instructions
                  </Button>
                </div>

                <div
                  className={cn(
                    "flex flex-col gap-3 rounded-lg border bg-background p-4 text-left",
                    prefsLoading && "pointer-events-none opacity-60",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="bg-muted text-foreground relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md p-1.5">
                        <svg
                          aria-hidden
                          className="size-7 shrink-0"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M12 1 1 22h22L12 1Z" />
                        </svg>
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <p className="text-sm font-medium">Vercel MCP</p>
                        <p className="text-muted-foreground text-xs">
                          Stdio MCP via <code className="text-[0.7rem]">@vercel/sdk</code> +{" "}
                          <code className="text-[0.7rem]">mcp__vercel__*</code>; add{" "}
                          <code className="text-[0.7rem]">VERCEL_ACCESS_TOKEN</code> in Actions secrets.
                        </p>
                      </div>
                    </div>
                    <Switch
                      aria-label="Vercel MCP"
                      checked={workflowVercelMcp}
                      disabled={prefsLoading}
                      onCheckedChange={(checked) => {
                        if (workflowPrefs === undefined) {
                          return;
                        }
                        void persistWorkflowPrefs({
                          autoMergePr: workflowPrefs.autoMergePr,
                          supabaseMcp: workflowPrefs.supabaseMcp,
                          convexMcp: workflowPrefs.convexMcp,
                          vercelMcp: checked,
                          sentryMcp: workflowPrefs.sentryMcp,
                        });
                      }}
                    />
                  </div>
                  <Button
                    className="w-full gap-2 sm:w-auto"
                    onClick={() => setGuideKind("vercel")}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    <BookOpen className="size-4" />
                    Instructions
                  </Button>
                </div>

                <div
                  className={cn(
                    "flex flex-col gap-3 rounded-lg border bg-background p-4 text-left",
                    prefsLoading && "pointer-events-none opacity-60",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="bg-muted relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md p-1.5">
                        <Image
                          alt="Sentry"
                          className="object-contain"
                          height={28}
                          src="/sentry-logo.png"
                          width={28}
                        />
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <p className="text-sm font-medium">Sentry MCP</p>
                        <p className="text-muted-foreground text-xs">
                          Stdio MCP + <code className="text-[0.7rem]">mcp__sentry__*</code> with{" "}
                          <code className="text-[0.7rem]">SENTRY_ACCESS_TOKEN</code>,{" "}
                          <code className="text-[0.7rem]">EMBEDDED_AGENT_PROVIDER=anthropic</code>, and{" "}
                          <code className="text-[0.7rem]">ANTHROPIC_API_KEY</code> (same secret as the Claude step).
                        </p>
                      </div>
                    </div>
                    <Switch
                      aria-label="Sentry MCP"
                      checked={workflowSentryMcp}
                      disabled={prefsLoading}
                      onCheckedChange={(checked) => {
                        if (workflowPrefs === undefined) {
                          return;
                        }
                        void persistWorkflowPrefs({
                          autoMergePr: workflowPrefs.autoMergePr,
                          supabaseMcp: workflowPrefs.supabaseMcp,
                          convexMcp: workflowPrefs.convexMcp,
                          vercelMcp: workflowPrefs.vercelMcp,
                          sentryMcp: checked,
                        });
                      }}
                    />
                  </div>
                  <Button
                    className="w-full gap-2 sm:w-auto"
                    onClick={() => setGuideKind("sentry")}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    <BookOpen className="size-4" />
                    Instructions
                  </Button>
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-muted-foreground text-sm">
                Commit as{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-xs">
                  .github/workflows/echo-product-issue.yml
                </code>{" "}
                (or similar) on the default branch.
              </p>
              <Button
                className="shrink-0 gap-2"
                onClick={() => void copyWorkflowYaml()}
                size="sm"
                type="button"
                variant="outline"
              >
                <CopyIcon className="size-4" />
                Copy YAML
              </Button>
            </div>
            <pre className="max-h-[min(520px,60vh)] overflow-auto rounded-md border bg-muted/50 p-3 font-mono text-xs leading-relaxed whitespace-pre">
              {workflowYaml}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
};
