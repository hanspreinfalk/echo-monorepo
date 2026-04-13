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
import { CopyIcon, ExternalLinkIcon, Loader2Icon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type GitHubRepo = {
  id: number;
  full_name: string;
  name: string;
  private: boolean;
  default_branch: string;
  html_url: string;
};

function buildEchoProductIssueWorkflowYaml(autoMergePr: boolean): string {
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
          claude_args: "--allowedTools 'Edit,MultiEdit,Write,Read,Glob,Grep,LS,Bash(git:*),Bash(gh:*),Bash(npm:*),Bash(npx:*),Bash(bun:*),Bash(node:*),Bash(pnpm:*),Bash(yarn:*)'"${autoMergeSteps}`;
}

export const GithubIntegrationView = () => {
  const saved = useQuery(api.private.githubIntegration.getOne);
  const setSelectedRepo = useMutation(api.private.githubIntegration.setSelectedRepo);

  const [repos, setRepos] = useState<GitHubRepo[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState<GitHubRepo | null>(null);
  const [saving, setSaving] = useState(false);
  const [workflowAutoMergePr, setWorkflowAutoMergePr] = useState(false);

  const workflowYaml = useMemo(
    () => buildEchoProductIssueWorkflowYaml(workflowAutoMergePr),
    [workflowAutoMergePr],
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
    } catch {
      toast.error("Could not save repository.");
    } finally {
      setSaving(false);
    }
  };

  const isLoadingSaved = saved === undefined;

  return (
    <div className="flex min-h-screen flex-col bg-muted p-8">
      <div className="mx-auto w-full max-w-screen-md space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-4xl">GitHub</h1>
          <p className="text-muted-foreground">
            Choose which repository is linked to the current organization. Load
            your repositories from GitHub when you are ready to pick one.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Linked repository</CardTitle>
            <CardDescription>
              Stored per organization in Convex so it persists across sessions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {isLoadingSaved ? (
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <Loader2Icon className="size-4 animate-spin" />
                Loading saved selection…
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
              <p className="text-muted-foreground text-sm">
                No repository selected yet.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Product issues → Fix now</CardTitle>
            <CardDescription>
              From Product Issues, use <span className="text-foreground font-medium">Fix</span> to
              preview and send the fix prompt via{" "}
              <span className="text-foreground font-medium">repository_dispatch</span>{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">echo_product_issue</code>.
              Add a workflow file like the one below to the linked repository (default branch is
              fine). With <span className="text-foreground font-medium">Auto-merge PR</span>, a step
              runs <code className="rounded bg-muted px-1 py-0.5 text-xs">gh pr merge --auto</code>{" "}
              (GitHub merges when required checks pass—no bot self-approval). Allow squash merge in
              repo settings; adjust branch protection so auto-merge can complete (e.g. do not require
              human approval for these PRs, or use rules that allow GitHub Actions).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Switch
                  checked={workflowAutoMergePr}
                  id="workflow-auto-merge"
                  onCheckedChange={setWorkflowAutoMergePr}
                />
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium" htmlFor="workflow-auto-merge">
                    Auto-merge PR
                  </Label>
                  <p className="text-muted-foreground text-xs">
                    Enables GitHub auto-merge (squash, delete branch) on the PR Claude opened—merge
                    runs when checks pass. Requires the job to end on the PR head branch.
                  </p>
                </div>
              </div>
              <Button
                className="shrink-0 gap-2 sm:self-start"
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

        <Separator />

        <div className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-lg font-medium">Select a repository</h2>
            <p className="text-muted-foreground text-sm">
              Use <span className="text-foreground font-medium">Select repository</span>{" "}
              to load repos from GitHub, then search, pick a row, and save.
            </p>
          </div>

          {repos === null && !loadingRepos && !loadError ? (
            <Button onClick={() => void loadRepos()} type="button">
              Select repository
            </Button>
          ) : null}

          {repos !== null ? (
            <Input
              disabled={loadingRepos || !!loadError}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter repositories…"
              value={filter}
            />
          ) : null}

          {loadingRepos ? (
            <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 py-12 text-sm">
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
              <ScrollArea className="h-[min(420px,50vh)] rounded-md border bg-background">
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
                                "hover:bg-accent flex w-full flex-col items-start gap-0.5 rounded-md px-3 py-2 text-left text-sm transition-colors",
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
      </div>
    </div>
  );
};
