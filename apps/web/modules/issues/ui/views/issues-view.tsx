"use client";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@workspace/ui/components/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Textarea } from "@workspace/ui/components/textarea";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@workspace/ui/components/table";
import { format } from "date-fns";
import {
    ArrowDownIcon,
    ArrowUpIcon,
    CheckCircle2Icon,
    CheckIcon,
    ChevronDownIcon,
    ChevronRightIcon,
    CopyIcon,
    EyeIcon,
    Loader2Icon,
    MoreHorizontalIcon,
    RotateCcwIcon,
    TrashIcon,
    WorkflowIcon,
} from "lucide-react";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePaginatedQuery, useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { api } from "@workspace/backend/_generated/api";
import type { Doc, Id } from "@workspace/backend/_generated/dataModel";
import { useInfiniteScroll } from "@workspace/ui/hooks/use-infinite-scroll";
import { InfiniteScrollTrigger } from "@workspace/ui/components/infinite-scroll-trigger";
import { DeleteIssueDialog } from "../components/delete-issue-dialog";
import { ResolveIssueDialog } from "../components/resolve-issue-dialog";
import {
    WorkflowRunDialog,
    type IssueWorkflowSession,
    type WorkflowPollContext,
} from "../components/workflow-run-dialog";

type IssueCategory =
    | "Bug"
    | "UX"
    | "Performance"
    | "Accessibility"
    | "Security"
    | "Data"
    | "Feature Request";

type IssueCriticality = "Critical" | "High" | "Medium" | "Low";

type AffectedSession = {
    id: Id<"contactSessions">;
    name: string;
    email: string;
    /** ISO 8601 — when this contact session was created (per reporter) */
    lastSeen: string;
    browser: string;
    os: string;
    region?: string;
};

type IssueAttachment = {
    url: string;
    filename?: string;
    mimeType?: string;
};

type ProductIssue = {
    id: Id<"issues">;
    title: string;
    description: string;
    stepsToReproduce?: string;
    category: IssueCategory;
    criticality: IssueCriticality;
    /** Length of stored affectedSessions id list */
    affectedSessionsCount: number;
    /** ISO 8601 — first report in this aggregate */
    date: string;
    resolved: boolean;
    consoleLogs?: string[];
    attachments?: IssueAttachment[];
    affectedSessions?: AffectedSession[];
    pageUrl?: string;
};

const CRITICALITY_RANK: Record<IssueCriticality, number> = {
    Critical: 0,
    High: 1,
    Medium: 2,
    Low: 3,
};

function criticalityBadgeVariant(
    criticality: IssueCriticality,
): "destructive" | "default" | "secondary" | "outline" {
    switch (criticality) {
        case "Critical":
            return "destructive";
        case "High":
            return "default";
        case "Medium":
            return "secondary";
        case "Low":
            return "outline";
    }
}

function formatIssueDate(iso: string) {
    return format(new Date(iso), "MMM d, yyyy");
}

function formatIssueDateTime(iso: string) {
    return format(new Date(iso), "MMM d, yyyy · HH:mm");
}

/** Compact date/time for dense tables (e.g. reporter sessions). */
function formatShortCapturedAt(iso: string) {
    return new Date(iso).toLocaleString(undefined, {
        dateStyle: "short",
        timeStyle: "short",
    });
}

function formatBrowserLine(userAgent: string | undefined): string {
    if (!userAgent?.trim()) {
        return "—";
    }
    const u = userAgent.trim();
    const edge = u.match(/Edg(?:e)?\/([\d.]+)/);
    if (edge) {
        return `Edge ${edge[1]}`;
    }
    const chrome = u.match(/Chrome\/([\d.]+)/);
    if (chrome) {
        return `Chrome ${chrome[1]}`;
    }
    const firefox = u.match(/Firefox\/([\d.]+)/);
    if (firefox) {
        return `Firefox ${firefox[1]}`;
    }
    const safari = u.match(/Version\/([\d.]+).*Safari/);
    if (safari && /Safari\//.test(u) && !/Chrome/.test(u)) {
        return `Safari ${safari[1]}`;
    }
    return u.length > 72 ? `${u.slice(0, 69)}…` : u;
}

function attachmentDisplayKind(
    mimeType: string | undefined,
    filename: string | undefined,
): "image" | "video" | "other" {
    const m = (mimeType ?? "").toLowerCase();
    if (m.startsWith("image/")) {
        return "image";
    }
    if (m.startsWith("video/")) {
        return "video";
    }
    const name = filename ?? "";
    if (/\.(png|jpe?g|webp|gif|bmp|svg)$/i.test(name)) {
        return "image";
    }
    if (/\.(mp4|webm|mov|m4v|ogg)$/i.test(name)) {
        return "video";
    }
    return "other";
}

type IssueListRow = Doc<"issues"> & {
    resolvedContactSessions?: Doc<"contactSessions">[];
};

/** Stable object key for per-issue GitHub workflow session state. */
function workflowSessionKey(issueId: Id<"issues">): string {
    return String(issueId);
}

const ACTIVE_RUN_STATUSES = new Set(["queued", "waiting", "in_progress"]);
function isActiveRunStatus(status: string | null): boolean {
    return status !== null && ACTIVE_RUN_STATUSES.has(status);
}

/** Dispatch in flight or GitHub Actions run not finished yet. */
function isIssueGithubWorkflowBusy(
    issueId: Id<"issues">,
    wfSession: IssueWorkflowSession | undefined,
    fixDispatchingIssueId: Id<"issues"> | null,
): boolean {
    return (
        fixDispatchingIssueId === issueId ||
        Boolean(wfSession && isActiveRunStatus(wfSession.runStatus))
    );
}

/** User-facing summary for persisted GitHub workflow state (table + expanded row). */
function workflowFixSummary(session: IssueWorkflowSession): string {
    if (isActiveRunStatus(session.runStatus)) {
        return "Fix in progress";
    }
    if (session.runStatus === "completed") {
        if (session.runConclusion === "success") {
            return "Fix ready (PR opened)";
        }
        if (session.runConclusion === "cancelled") {
            return "Fix cancelled";
        }
        return "Fix failed";
    }
    if (session.runStatus === "queued" || session.runStatus === "waiting") {
        return "Fix starting…";
    }
    return "GitHub fix dispatched";
}

/** Run finished without success (failure, cancelled, etc.). */
function isWorkflowFixFailed(session: IssueWorkflowSession): boolean {
    return (
        session.runStatus === "completed" &&
        session.runConclusion !== null &&
        session.runConclusion !== "success"
    );
}

type WorkflowFixTone = "failure" | "progress" | "success";

function workflowFixTone(session: IssueWorkflowSession): WorkflowFixTone {
    if (isWorkflowFixFailed(session)) {
        return "failure";
    }
    if (isActiveRunStatus(session.runStatus)) {
        return "progress";
    }
    return "success";
}

function workflowFixSummaryTextClassName(
    session: IssueWorkflowSession,
): string {
    switch (workflowFixTone(session)) {
        case "failure":
            return "text-red-600 dark:text-red-400";
        case "progress":
            return "text-blue-600 dark:text-blue-400";
        default:
            return "text-green-600 dark:text-green-400";
    }
}

/** Outline Fix-column actions: blue in progress, red failed, green succeeded / idle. */
function workflowFixActionButtonClassName(
    session: IssueWorkflowSession,
): string {
    switch (workflowFixTone(session)) {
        case "failure":
            return "border-red-600/70 text-red-700 hover:bg-red-50 hover:text-red-800 dark:border-red-500 dark:text-red-400 dark:hover:bg-red-950/50 dark:hover:text-red-300";
        case "progress":
            return "border-blue-600/70 text-blue-700 hover:bg-blue-50 hover:text-blue-800 dark:border-blue-500 dark:text-blue-400 dark:hover:bg-blue-950/50 dark:hover:text-blue-300";
        default:
            return "border-green-600/70 text-green-700 hover:bg-green-50 hover:text-green-800 dark:border-green-500 dark:text-green-400 dark:hover:bg-green-950/50 dark:hover:text-green-300";
    }
}

function docToProductIssue(row: IssueListRow): ProductIssue {
    const reportedMs = row.firstReported ?? row._creationTime;
    const capturedIso = new Date(reportedMs).toISOString();
    return {
        id: row._id,
        title: row.title ?? "(Untitled)",
        description: row.description ?? "",
        stepsToReproduce: row.stepsToReproduce,
        category: (row.category ?? "Bug") as IssueCategory,
        criticality: (row.criticality ?? "Medium") as IssueCriticality,
        affectedSessionsCount: row.affectedSessions?.length ?? 0,
        date: capturedIso,
        resolved: row.resolved ?? false,
        consoleLogs: row.consoleLogs,
        pageUrl: row.pageUrl,
        attachments: row.attachments?.map((a) => ({
            url: a.url,
            filename: a.filename,
            mimeType: a.mimeType,
        })),
        affectedSessions: row.resolvedContactSessions?.map((s) => ({
            id: s._id,
            name: s.name,
            email: s.email,
            lastSeen: new Date(s._creationTime).toISOString(),
            browser: formatBrowserLine(s.metadata?.userAgent),
            os: s.metadata?.platform?.trim() ? s.metadata.platform : "—",
            region: s.metadata?.timezone,
        })),
    };
}

function buildFixPrompt(issue: ProductIssue): string {
    const lines = [
        "You are helping fix a product issue in our application.",
        "",
        `Issue ID: ${issue.id}`,
        `Status: ${issue.resolved ? "Resolved" : "Open"}`,
        `Category: ${issue.category}`,
        `Criticality: ${issue.criticality}`,
        `Affected sessions (count): ${issue.affectedSessionsCount}`,
        `First reported: ${formatIssueDateTime(issue.date)}`,
    ];
    if (issue.pageUrl) {
        lines.push(`Page: ${issue.pageUrl}`);
    }
    lines.push(
        "",
        `Issue: ${issue.title}`,
        "",
        "Details:",
        issue.description,
    );
    if (issue.stepsToReproduce?.trim()) {
        lines.push("", "Steps to reproduce:", issue.stepsToReproduce);
    }
    if (issue.consoleLogs?.length) {
        lines.push("", "Console:", ...issue.consoleLogs.map((l) => `  ${l}`));
    }
    if (issue.attachments?.length) {
        lines.push(
            "",
            "Attachments:",
            ...issue.attachments.map(
                (a, i) =>
                    `  ${i + 1}. ${a.filename ?? "file"} — ${a.url}${a.mimeType ? ` (${a.mimeType})` : ""}`,
            ),
        );
    }
    if (issue.affectedSessions?.length) {
        lines.push(
            "",
            "Sample affected sessions:",
            ...issue.affectedSessions.map(
                (s) =>
                    `  ${s.id} · ${s.name} · ${s.email} · ${s.browser} · ${s.os}${s.region ? ` · ${s.region}` : ""} · last ${formatIssueDateTime(s.lastSeen)}`,
            ),
        );
    }
    lines.push(
        "",
        "Please locate the relevant code, implement a fix, and summarize what you changed.",
    );
    return lines.join("\n");
}

export const IssuesView = () => {
    const issuesPage = usePaginatedQuery(
        api.private.issues.list,
        {},
        { initialNumItems: 15 },
    );

    const {
        topElementRef,
        handleLoadMore,
        canLoadMore,
        isLoadingFirstPage,
        isLoadingMore,
    } = useInfiniteScroll({
        status: issuesPage.status,
        loadMore: issuesPage.loadMore,
        loadSize: 15,
    });

    const issues = useMemo(
        () => issuesPage.results.map(docToProductIssue),
        [issuesPage.results],
    );

    const setResolvedMutation = useMutation(api.private.issues.setResolved);
    const recordGithubWorkflowDispatchMutation = useMutation(
        api.private.issues.recordGithubWorkflowDispatch,
    );
    const updateGithubWorkflowRunMutation = useMutation(
        api.private.issues.updateGithubWorkflowRun,
    );
    const githubIntegration = useQuery(api.private.githubIntegration.getOne);

    const [criticalitySort, setCriticalitySort] = useState<"asc" | "desc">(
        "desc",
    );
    const [copiedSessionKey, setCopiedSessionKey] = useState<string | null>(
        null,
    );
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
    const [resolveDialogIssue, setResolveDialogIssue] =
        useState<ProductIssue | null>(null);
    const [selectedIssue, setSelectedIssue] = useState<ProductIssue | null>(
        null,
    );
    const [expandedIssueId, setExpandedIssueId] = useState<Id<"issues"> | null>(
        null,
    );
    const [statusFilter, setStatusFilter] = useState<"open" | "resolved">(
        "open",
    );
    const [githubOAuthConnected, setGithubOAuthConnected] = useState<
        boolean | null
    >(null);
    const [fixPromptDialogOpen, setFixPromptDialogOpen] = useState(false);
    const [fixPromptDialogIssue, setFixPromptDialogIssue] =
        useState<ProductIssue | null>(null);
    const [fixPromptDraft, setFixPromptDraft] = useState("");
    const [fixDispatchingIssueId, setFixDispatchingIssueId] =
        useState<Id<"issues"> | null>(null);
    const [workflowDialogOpen, setWorkflowDialogOpen] = useState(false);
    const [workflowPollContext, setWorkflowPollContext] =
        useState<WorkflowPollContext | null>(null);

    const issueWorkflowByIssueId = useMemo(() => {
        const map: Record<string, IssueWorkflowSession> = {};
        const repoFallback = githubIntegration?.fullName?.trim() ?? "";
        for (const row of issuesPage.results) {
            if (!row.githubWorkflowDispatchedAt) {
                continue;
            }
            const key = workflowSessionKey(row._id);
            const conc = row.githubWorkflowRunConclusion;
            map[key] = {
                dispatchedAt: row.githubWorkflowDispatchedAt,
                repository:
                    row.githubWorkflowRepository?.trim() || repoFallback,
                runId: row.githubWorkflowRunId ?? null,
                runStatus: row.githubWorkflowRunStatus ?? null,
                runConclusion:
                    conc === undefined || conc === "" ? null : conc,
            };
        }
        return map;
    }, [issuesPage.results, githubIntegration?.fullName]);

    const handleWorkflowRunIdResolved = useCallback(
        (issueId: Id<"issues">, runId: number) => {
            void updateGithubWorkflowRunMutation({ issueId, runId });
        },
        [updateGithubWorkflowRunMutation],
    );

    const handleWorkflowStatusChange = useCallback(
        (issueId: Id<"issues">, status: string, conclusion: string | null) => {
            void updateGithubWorkflowRunMutation({
                issueId,
                runStatus: status,
                runConclusion: conclusion,
            });
        },
        [updateGithubWorkflowRunMutation],
    );

    useEffect(() => {
        let cancelled = false;
        void (async () => {
            try {
                const res = await fetch("/api/github/connection");
                const data = (await res.json()) as { connected?: boolean };
                if (cancelled) {
                    return;
                }
                setGithubOAuthConnected(
                    res.ok && data.connected === true,
                );
            } catch {
                if (!cancelled) {
                    setGithubOAuthConnected(false);
                }
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    // Background poll for active runs so "Fix now" stays disabled while the
    // workflow is running even when the dialog is closed.
    const issueWorkflowRef = useRef(issueWorkflowByIssueId);
    issueWorkflowRef.current = issueWorkflowByIssueId;
    const workflowDialogOpenRef = useRef(workflowDialogOpen);
    workflowDialogOpenRef.current = workflowDialogOpen;
    const workflowPollContextRef = useRef(workflowPollContext);
    workflowPollContextRef.current = workflowPollContext;

    const hasActiveSessions = useMemo(
        () =>
            Object.values(issueWorkflowByIssueId).some(
                (s) => s.runId !== null && isActiveRunStatus(s.runStatus),
            ),
        [issueWorkflowByIssueId],
    );

    useEffect(() => {
        if (!hasActiveSessions) {
            return;
        }
        let cancelled = false;
        const bgPoll = async () => {
            const sessions = issueWorkflowRef.current;
            const dialogOpen = workflowDialogOpenRef.current;
            const dialogCtx = workflowPollContextRef.current;
            const dialogKey = dialogCtx
                ? workflowSessionKey(dialogCtx.issueId)
                : null;
            for (const [key, session] of Object.entries(sessions) as [string, IssueWorkflowSession][]) {
                if (cancelled) return;
                if (!isActiveRunStatus(session.runStatus) || session.runId === null)
                    continue;
                // Skip if the open dialog is already polling this issue.
                if (dialogOpen && key === dialogKey) continue;
                try {
                    const res = await fetch(
                        `/api/github/actions/run?runId=${session.runId}`,
                    );
                    if (cancelled || !res.ok) continue;
                    const data = (await res.json()) as {
                        run?: { status: string; conclusion: string | null } | null;
                    };
                    if (cancelled || !data.run) continue;
                    const cur = issueWorkflowRef.current[key];
                    if (!cur) continue;
                    const nextConc = data.run.conclusion ?? "";
                    const curConc = cur.runConclusion ?? "";
                    if (
                        cur.runStatus === data.run.status &&
                        curConc === nextConc
                    ) {
                        continue;
                    }
                    void updateGithubWorkflowRunMutation({
                        issueId: key as Id<"issues">,
                        runStatus: data.run.status,
                        runConclusion: data.run.conclusion,
                    });
                } catch {
                    // ignore – next tick will retry
                }
            }
        };
        void bgPoll();
        const id = window.setInterval(() => void bgPoll(), 8000);
        return () => {
            cancelled = true;
            window.clearInterval(id);
        };
    }, [hasActiveSessions, updateGithubWorkflowRunMutation]);

    const visibleIssues = useMemo(() => {
        const next = issues.filter((i) =>
            statusFilter === "resolved" ? i.resolved : !i.resolved,
        );
        next.sort((a, b) => {
            const diff =
                CRITICALITY_RANK[a.criticality] - CRITICALITY_RANK[b.criticality];
            return criticalitySort === "desc" ? diff : -diff;
        });
        return next;
    }, [issues, criticalitySort, statusFilter]);

    const switchStatusFilter = useCallback((next: "open" | "resolved") => {
        setStatusFilter(next);
        setExpandedIssueId(null);
    }, []);

    const toggleCriticalitySort = useCallback(() => {
        setCriticalitySort((prev) => (prev === "desc" ? "asc" : "desc"));
    }, []);

    const hasLinkedGithubRepo =
        githubIntegration !== undefined &&
        githubIntegration !== null &&
        Boolean(githubIntegration.fullName?.trim());

    const githubDispatchAvailable =
        hasLinkedGithubRepo && githubOAuthConnected === true;

    const openFixPromptDialog = useCallback(
        (issue: ProductIssue) => {
            if (githubIntegration === undefined) {
                return;
            }
            if (
                githubIntegration === null ||
                !githubIntegration.fullName?.trim()
            ) {
                toast.error(
                    "Link a GitHub repository under GitHub in the sidebar first.",
                );
                return;
            }
            if (githubOAuthConnected === null) {
                return;
            }
            if (githubOAuthConnected === false) {
                toast.error(
                    "GitHub not connected. Reconnect your GitHub account, then try again.",
                );
                return;
            }
            if (issue.resolved) {
                return;
            }
            const wfKey = workflowSessionKey(issue.id);
            const session = issueWorkflowByIssueId[wfKey];
            if (isActiveRunStatus(session?.runStatus ?? null)) {
                toast.error(
                    "A workflow is already running for this issue. Wait for it to finish.",
                );
                return;
            }
            setFixPromptDraft(buildFixPrompt(issue));
            setFixPromptDialogIssue(issue);
            setFixPromptDialogOpen(true);
        },
        [
            githubIntegration,
            githubOAuthConnected,
            issueWorkflowByIssueId,
        ],
    );

    const openWorkflowDialogForSession = useCallback(
        (issueId: Id<"issues">, session: IssueWorkflowSession) => {
            setWorkflowPollContext({
                issueId,
                dispatchedAt: session.dispatchedAt,
                repository: session.repository,
                runId: session.runId,
                runStatus: session.runStatus,
                runConclusion: session.runConclusion,
            });
            setWorkflowDialogOpen(true);
        },
        [],
    );

    const dispatchFixToGithub = useCallback(
        async (issue: ProductIssue, prompt: string) => {
            if (githubIntegration === undefined) {
                return;
            }
            if (
                githubIntegration === null ||
                !githubIntegration.fullName?.trim()
            ) {
                return;
            }
            setFixDispatchingIssueId(issue.id);
            try {
                const res = await fetch("/api/github/dispatch", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        prompt,
                        issueId: issue.id,
                    }),
                });
                const data = (await res.json()) as {
                    error?: string;
                    ok?: boolean;
                    truncated?: boolean;
                    repository?: string;
                    dispatchedAt?: string;
                };
                if (!res.ok) {
                    toast.error(data.error ?? "Could not dispatch to GitHub.");
                    return;
                }
                const dispatchedAt =
                    typeof data.dispatchedAt === "string"
                        ? data.dispatchedAt
                        : new Date().toISOString();
                const repository =
                    data.repository ?? githubIntegration.fullName;
                await recordGithubWorkflowDispatchMutation({
                    issueId: issue.id,
                    dispatchedAt,
                    repository,
                });
                const session: IssueWorkflowSession = {
                    dispatchedAt,
                    repository,
                    runId: null,
                    runStatus: "queued",
                    runConclusion: null,
                };
                setFixPromptDialogOpen(false);
                setFixPromptDialogIssue(null);
                setFixPromptDraft("");
                setWorkflowPollContext({
                    issueId: issue.id,
                    ...session,
                });
                setWorkflowDialogOpen(true);
                if (data.truncated) {
                    toast.success(
                        `Dispatched to ${session.repository} (prompt truncated for GitHub).`,
                    );
                } else {
                    toast.success(
                        `Dispatched fix prompt to ${session.repository}.`,
                    );
                }
            } catch (error) {
                console.error(error);
                toast.error("Could not send prompt to GitHub Actions.");
            } finally {
                setFixDispatchingIssueId(null);
            }
        },
        [githubIntegration, recordGithubWorkflowDispatchMutation],
    );

    const copyContactSessionId = useCallback(
        async (sessionId: string, rowKey: string) => {
            try {
                await navigator.clipboard.writeText(sessionId);
                setCopiedSessionKey(rowKey);
                window.setTimeout(() => setCopiedSessionKey(null), 2000);
            } catch {
                /* clipboard unavailable */
            }
        },
        [],
    );

    const handleDeleteClick = (issue: ProductIssue) => {
        setSelectedIssue(issue);
        setDeleteDialogOpen(true);
    };

    const handleResolveClick = (issue: ProductIssue) => {
        setResolveDialogIssue(issue);
        setResolveDialogOpen(true);
    };

    const setIssueResolved = useCallback(
        async (id: Id<"issues">, resolved: boolean) => {
            try {
                await setResolvedMutation({
                    issueId: id,
                    resolved,
                });
                setExpandedIssueId((cur) => (cur === id ? null : cur));
            } catch (error) {
                console.error(error);
            }
        },
        [setResolvedMutation],
    );

    const handleIssueDeleted = useCallback(() => {
        if (!selectedIssue) {
            return;
        }
        const id = selectedIssue.id;
        setExpandedIssueId((cur) => (cur === id ? null : cur));
        setSelectedIssue(null);
    }, [selectedIssue]);

    const handleIssueResolvedFromDialog = useCallback(() => {
        if (!resolveDialogIssue) {
            return;
        }
        const id = resolveDialogIssue.id;
        setExpandedIssueId((cur) => (cur === id ? null : cur));
        setResolveDialogIssue(null);
    }, [resolveDialogIssue]);

    const colCount = 4;

    return (
        <>
            <DeleteIssueDialog
                issue={
                    selectedIssue
                        ? {
                              id: selectedIssue.id,
                              title: selectedIssue.title,
                          }
                        : null
                }
                onDeleted={handleIssueDeleted}
                onOpenChange={setDeleteDialogOpen}
                open={deleteDialogOpen}
            />
            <ResolveIssueDialog
                issue={
                    resolveDialogIssue
                        ? {
                              id: resolveDialogIssue.id,
                              title: resolveDialogIssue.title,
                              affectedSessions:
                                  resolveDialogIssue.affectedSessions?.map(
                                      (s) => ({
                                          id: s.id,
                                          name: s.name,
                                          email: s.email,
                                      }),
                                  ) ?? [],
                          }
                        : null
                }
                onOpenChange={(open) => {
                    setResolveDialogOpen(open);
                    if (!open) {
                        setResolveDialogIssue(null);
                    }
                }}
                onResolved={handleIssueResolvedFromDialog}
                open={resolveDialogOpen}
            />
            <WorkflowRunDialog
                context={workflowPollContext}
                onOpenChange={(next) => {
                    setWorkflowDialogOpen(next);
                    if (!next) {
                        setWorkflowPollContext(null);
                    }
                }}
                onRunIdResolved={handleWorkflowRunIdResolved}
                onStatusChange={handleWorkflowStatusChange}
                open={workflowDialogOpen}
            />
            <Dialog
                onOpenChange={(open) => {
                    setFixPromptDialogOpen(open);
                    if (!open) {
                        setFixPromptDialogIssue(null);
                        setFixPromptDraft("");
                    }
                }}
                open={fixPromptDialogOpen}
            >
                <DialogContent className="flex max-h-[85vh] max-w-[calc(100%-2rem)] flex-col gap-4 sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Send fix to GitHub Actions</DialogTitle>
                        <DialogDescription>
                            Starts from this issue&apos;s fields (title, description,
                            sessions, attachments, etc.). Edit the prompt below if you want
                            to add context or change instructions—this exact text is sent
                            to your linked repository workflow.
                        </DialogDescription>
                    </DialogHeader>
                    {fixPromptDialogIssue ? (
                        <div className="flex min-h-0 flex-1 flex-col gap-2">
                            <div className="flex flex-wrap items-center justify-end gap-2">
                                <Button
                                    className="text-muted-foreground h-auto py-1 text-xs"
                                    onClick={() =>
                                        setFixPromptDraft(
                                            buildFixPrompt(fixPromptDialogIssue),
                                        )
                                    }
                                    type="button"
                                    variant="ghost"
                                >
                                    Reset to default
                                </Button>
                            </div>
                            <Textarea
                                className="max-h-[min(65vh,32rem)] min-h-[12rem] w-full min-w-0 resize-y font-mono text-xs leading-relaxed focus-visible:border-input focus-visible:ring-0"
                                onChange={(e) => setFixPromptDraft(e.target.value)}
                                spellCheck={false}
                                value={fixPromptDraft}
                            />
                        </div>
                    ) : (
                        <p className="text-destructive text-sm">
                            Could not build a prompt for this issue.
                        </p>
                    )}
                    <DialogFooter>
                        <Button
                            disabled={fixDispatchingIssueId !== null}
                            onClick={() => setFixPromptDialogOpen(false)}
                            type="button"
                            variant="outline"
                        >
                            Cancel
                        </Button>
                        <Button
                            className="gap-2"
                            disabled={
                                !fixPromptDialogIssue ||
                                !fixPromptDraft.trim() ||
                                fixDispatchingIssueId !== null
                            }
                            onClick={() => {
                                if (fixPromptDialogIssue) {
                                    void dispatchFixToGithub(
                                        fixPromptDialogIssue,
                                        fixPromptDraft.trim(),
                                    );
                                }
                            }}
                            type="button"
                        >
                            {fixDispatchingIssueId !== null ? (
                                <>
                                    <Loader2Icon className="size-4 animate-spin shrink-0" />
                                    Sending…
                                </>
                            ) : (
                                "Send to GitHub"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <div className="flex min-h-screen min-w-0 flex-col bg-muted p-8">
                <div className="mx-auto w-full min-w-0 max-w-3xl">
                    <div className="space-y-2">
                        <h1 className="text-2xl md:text-4xl">Product Issues</h1>
                        <p className="text-muted-foreground">
                            Expand rows.{" "}
                            <span className="text-foreground font-medium">Fix</span>{" "}
                            → Actions (preview, confirm); then{" "}
                            <span className="text-foreground font-medium">
                                Workflow
                            </span>
                            {" / "}
                            <span className="text-foreground font-medium">
                                View workflow
                            </span>{" "}
                            or{" "}
                            <span className="text-foreground font-medium">
                                Fix again
                            </span>{" "}
                            (⋯).
                        </p>
                    </div>

                    <div className="mt-8 min-w-0 overflow-hidden rounded-lg border bg-background">
                        <div className="flex flex-wrap items-center gap-2 border-b px-6 py-4">
                            <Button
                                onClick={() => switchStatusFilter("open")}
                                variant={
                                    statusFilter === "open"
                                        ? "default"
                                        : "outline"
                                }
                            >
                                Open
                            </Button>
                            <Button
                                onClick={() => switchStatusFilter("resolved")}
                                variant={
                                    statusFilter === "resolved"
                                        ? "default"
                                        : "outline"
                                }
                            >
                                Resolved
                            </Button>
                        </div>
                        <Table className="table-fixed">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[45%] min-w-0 px-6 py-4 font-medium">
                                        Issue
                                    </TableHead>
                                    <TableHead className="w-[22%] px-6 py-4 font-medium whitespace-nowrap">
                                        <button
                                            aria-label={`Sort by criticality, ${
                                                criticalitySort === "desc"
                                                    ? "most severe first"
                                                    : "least severe first"
                                            }`}
                                            className="inline-flex items-center gap-1 font-medium hover:text-foreground text-muted-foreground transition-colors"
                                            onClick={toggleCriticalitySort}
                                            type="button"
                                        >
                                            Criticality
                                            {criticalitySort === "desc" ? (
                                                <ArrowDownIcon aria-hidden className="size-4" />
                                            ) : (
                                                <ArrowUpIcon aria-hidden className="size-4" />
                                            )}
                                        </button>
                                    </TableHead>
                                    <TableHead className="px-6 py-4 font-medium w-[140px] min-w-[7.5rem] text-right whitespace-nowrap">
                                        Fix
                                    </TableHead>
                                    <TableHead className="px-6 py-4 font-medium whitespace-nowrap">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoadingFirstPage ? (
                                    <TableRow>
                                        <TableCell
                                            className="h-24 text-center text-muted-foreground"
                                            colSpan={colCount}
                                        >
                                            Loading issues...
                                        </TableCell>
                                    </TableRow>
                                ) : issues.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            className="h-24 text-center text-muted-foreground"
                                            colSpan={colCount}
                                        >
                                            No issues recorded yet
                                        </TableCell>
                                    </TableRow>
                                ) : visibleIssues.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            className="h-24 text-center text-muted-foreground"
                                            colSpan={colCount}
                                        >
                                            {statusFilter === "resolved"
                                                ? "No resolved issues"
                                                : "No open issues"}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    visibleIssues.map((issue) => {
                                        const isExpanded =
                                            expandedIssueId === issue.id;
                                        const rowTone = issue.resolved
                                            ? "opacity-70"
                                            : "";
                                        const wfKey =
                                            workflowSessionKey(issue.id);
                                        const wfSession =
                                            issueWorkflowByIssueId[wfKey];
                                        const githubWorkflowBusy =
                                            isIssueGithubWorkflowBusy(
                                                issue.id,
                                                wfSession,
                                                fixDispatchingIssueId,
                                            );
                                        return (
                                            <Fragment key={issue.id}>
                                                <TableRow
                                                    className={
                                                        isExpanded
                                                            ? `bg-muted/30 hover:bg-muted/40 ${rowTone}`
                                                            : `hover:bg-muted/50 ${rowTone}`
                                                    }
                                                >
                                                    <TableCell className="min-w-0 max-w-full px-6 py-4 align-middle whitespace-normal">
                                                        <button
                                                            aria-expanded={
                                                                isExpanded
                                                            }
                                                            className="flex w-full cursor-pointer items-center gap-2 rounded-md text-left outline-none transition-colors hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background -m-1 p-1"
                                                            onClick={() =>
                                                                setExpandedIssueId(
                                                                    (cur) =>
                                                                        cur ===
                                                                        issue.id
                                                                            ? null
                                                                            : issue.id,
                                                                )
                                                            }
                                                            type="button"
                                                        >
                                                            <span className="inline-flex shrink-0 text-muted-foreground">
                                                                {isExpanded ? (
                                                                    <ChevronDownIcon
                                                                        aria-hidden
                                                                        className="size-4"
                                                                    />
                                                                ) : (
                                                                    <ChevronRightIcon
                                                                        aria-hidden
                                                                        className="size-4"
                                                                    />
                                                                )}
                                                            </span>
                                                            <span className="min-w-0 flex-1 flex flex-col gap-0.5">
                                                                <span
                                                                    className={`break-words font-medium leading-snug ${
                                                                        issue.resolved
                                                                            ? "line-through decoration-muted-foreground/70"
                                                                            : ""
                                                                    }`}
                                                                >
                                                                    {issue.title}
                                                                </span>
                                                                {wfSession ? (
                                                                    <span
                                                                        className={`text-xs font-normal leading-snug ${workflowFixSummaryTextClassName(wfSession)}`}
                                                                    >
                                                                        {workflowFixSummary(
                                                                            wfSession,
                                                                        )}
                                                                    </span>
                                                                ) : null}
                                                            </span>
                                                        </button>
                                                    </TableCell>
                                                    <TableCell className="px-6 py-4 align-middle">
                                                        <Badge
                                                            variant={criticalityBadgeVariant(
                                                                issue.criticality,
                                                            )}
                                                        >
                                                            {issue.criticality}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="px-6 py-4 align-middle text-right">
                                                        {wfSession ? (
                                                            isActiveRunStatus(
                                                                wfSession.runStatus,
                                                            ) ? (
                                                                <Button
                                                                    className={`gap-2 ${workflowFixActionButtonClassName(wfSession)}`}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        openWorkflowDialogForSession(
                                                                            issue.id,
                                                                            wfSession,
                                                                        );
                                                                    }}
                                                                    size="sm"
                                                                    title="Open workflow run status"
                                                                    type="button"
                                                                    variant="outline"
                                                                >
                                                                    <Loader2Icon className="size-4 shrink-0 animate-spin" />
                                                                    Workflow
                                                                </Button>
                                                            ) : (
                                                                <Button
                                                                    className={`gap-2 ${workflowFixActionButtonClassName(wfSession)}`}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        openWorkflowDialogForSession(
                                                                            issue.id,
                                                                            wfSession,
                                                                        );
                                                                    }}
                                                                    size="sm"
                                                                    title="Open workflow run status"
                                                                    type="button"
                                                                    variant="outline"
                                                                >
                                                                    {/* <EyeIcon className="size-4 shrink-0" /> */}
                                                                    View workflow
                                                                </Button>
                                                            )
                                                        ) : (
                                                            <Button
                                                                className="gap-2"
                                                                disabled={
                                                                    !githubDispatchAvailable ||
                                                                    issue.resolved ||
                                                                    fixDispatchingIssueId ===
                                                                        issue.id
                                                                }
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    openFixPromptDialog(
                                                                        issue,
                                                                    );
                                                                }}
                                                                size="sm"
                                                                title={
                                                                    issue.resolved
                                                                        ? "Reopen the issue to dispatch a fix"
                                                                        : githubIntegration ===
                                                                            undefined
                                                                          ? "Loading GitHub settings…"
                                                                          : !hasLinkedGithubRepo
                                                                            ? "Link a repository under GitHub in the sidebar"
                                                                            : githubOAuthConnected ===
                                                                                null
                                                                              ? "Checking GitHub connection…"
                                                                              : githubOAuthConnected ===
                                                                                  false
                                                                                ? "GitHub not connected. Reconnect your GitHub account, then try again."
                                                                                : "Preview the prompt and send to GitHub Actions"
                                                                }
                                                                type="button"
                                                                variant="default"
                                                            >
                                                                {fixDispatchingIssueId ===
                                                                issue.id ? (
                                                                    <>
                                                                        <Loader2Icon className="size-4 animate-spin shrink-0" />
                                                                        Sending…
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <WorkflowIcon className="size-4 shrink-0" />
                                                                        Fix
                                                                    </>
                                                                )}
                                                            </Button>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="px-6 py-4 align-middle">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger
                                                                asChild
                                                            >
                                                                <Button
                                                                    className="size-8 p-0"
                                                                    size="sm"
                                                                    variant="ghost"
                                                                >
                                                                    <MoreHorizontalIcon />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                {wfSession ? (
                                                                    <>
                                                                        <DropdownMenuItem
                                                                            className="items-start gap-2 py-1.5"
                                                                            disabled={
                                                                                !githubDispatchAvailable ||
                                                                                issue.resolved ||
                                                                                isActiveRunStatus(
                                                                                    wfSession.runStatus,
                                                                                ) ||
                                                                                fixDispatchingIssueId ===
                                                                                    issue.id
                                                                            }
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                openFixPromptDialog(
                                                                                    issue,
                                                                                );
                                                                            }}
                                                                            title={
                                                                                issue.resolved
                                                                                    ? "Reopen the issue to dispatch again"
                                                                                    : isActiveRunStatus(
                                                                                          wfSession.runStatus,
                                                                                      )
                                                                                      ? "Wait until the current workflow finishes"
                                                                                      : githubIntegration ===
                                                                                        undefined
                                                                                        ? "Loading GitHub settings…"
                                                                                        : !hasLinkedGithubRepo
                                                                                          ? "Link a repository under GitHub in the sidebar"
                                                                                          : githubOAuthConnected ===
                                                                                              null
                                                                                            ? "Checking GitHub connection…"
                                                                                            : githubOAuthConnected ===
                                                                                                false
                                                                                              ? "GitHub not connected"
                                                                                              : "Dispatch another fix to GitHub Actions"
                                                                            }
                                                                        >
                                                                            <WorkflowIcon className="mt-0.5 size-4 shrink-0" />
                                                                            <div className="flex min-w-0 flex-col gap-0 leading-tight">
                                                                                <span>
                                                                                    Fix again
                                                                                </span>
                                                                                <span className="text-muted-foreground text-xs font-normal">
                                                                                    GitHub Actions
                                                                                </span>
                                                                            </div>
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuSeparator />
                                                                    </>
                                                                ) : null}
                                                                {issue.resolved ? (
                                                                    <DropdownMenuItem
                                                                        onClick={(
                                                                            e,
                                                                        ) => {
                                                                            e.stopPropagation();
                                                                            setIssueResolved(
                                                                                issue.id,
                                                                                false,
                                                                            );
                                                                        }}
                                                                    >
                                                                        <RotateCcwIcon className="size-4 mr-2" />
                                                                        Reopen
                                                                    </DropdownMenuItem>
                                                                ) : (
                                                                    <DropdownMenuItem
                                                                        disabled={
                                                                            githubWorkflowBusy
                                                                        }
                                                                        onClick={(
                                                                            e,
                                                                        ) => {
                                                                            e.stopPropagation();
                                                                            handleResolveClick(
                                                                                issue,
                                                                            );
                                                                        }}
                                                                        title={
                                                                            githubWorkflowBusy
                                                                                ? "Wait until the GitHub workflow finishes"
                                                                                : undefined
                                                                        }
                                                                    >
                                                                        <CheckCircle2Icon className="size-4 mr-2" />
                                                                        Resolved
                                                                    </DropdownMenuItem>
                                                                )}
                                                                <DropdownMenuItem
                                                                    disabled={
                                                                        githubWorkflowBusy
                                                                    }
                                                                    variant="destructive"
                                                                    onClick={(
                                                                        e,
                                                                    ) => {
                                                                        e.stopPropagation();
                                                                        handleDeleteClick(
                                                                            issue,
                                                                        );
                                                                    }}
                                                                    title={
                                                                        githubWorkflowBusy
                                                                            ? "Wait until the GitHub workflow finishes"
                                                                            : undefined
                                                                    }
                                                                >
                                                                    <TrashIcon className="size-4 mr-2" />
                                                                    Delete
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                                {isExpanded ? (
                                                    <TableRow
                                                        className={`bg-muted/20 hover:bg-muted/25 border-t border-border/60 ${rowTone}`}
                                                    >
                                                        <TableCell
                                                            className="min-w-0 max-w-full px-6 py-4 align-top whitespace-normal"
                                                            colSpan={colCount}
                                                        >
                                                            <div className="min-w-0 max-w-full space-y-6 pl-7 pr-1">
                                                                {wfSession ? (
                                                                    <div className="min-w-0 rounded-lg border bg-muted/40 p-4">
                                                                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                                                            GitHub Actions fix
                                                                        </p>
                                                                        <p className="mt-1.5 text-sm">
                                                                            <span
                                                                                className={`font-medium ${workflowFixSummaryTextClassName(wfSession)}`}
                                                                            >
                                                                                {workflowFixSummary(
                                                                                    wfSession,
                                                                                )}
                                                                            </span>
                                                                            {wfSession.runId !==
                                                                            null ? (
                                                                                <span className="text-muted-foreground">
                                                                                    {" "}
                                                                                    · run #
                                                                                    {
                                                                                        wfSession.runId
                                                                                    }
                                                                                </span>
                                                                            ) : null}
                                                                        </p>
                                                                        <p className="mt-1 font-mono text-muted-foreground text-xs [overflow-wrap:anywhere]">
                                                                            {
                                                                                wfSession.repository
                                                                            }
                                                                        </p>
                                                                        <Button
                                                                            className={`mt-3 gap-2 ${workflowFixActionButtonClassName(wfSession)}`}
                                                                            onClick={(
                                                                                e,
                                                                            ) => {
                                                                                e.stopPropagation();
                                                                                openWorkflowDialogForSession(
                                                                                    issue.id,
                                                                                    wfSession,
                                                                                );
                                                                            }}
                                                                            size="sm"
                                                                            variant="outline"
                                                                        >
                                                                            <EyeIcon className="size-4 shrink-0" />
                                                                            View workflow
                                                                        </Button>
                                                                    </div>
                                                                ) : null}
                                                                <div className="min-w-0">
                                                                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                                                        Description
                                                                    </p>
                                                                    <p
                                                                        className={`mt-1.5 break-words text-sm leading-relaxed [overflow-wrap:anywhere] ${
                                                                            issue.description.trim()
                                                                                ? "text-foreground"
                                                                                : "text-muted-foreground italic"
                                                                        }`}
                                                                    >
                                                                        {issue.description.trim()
                                                                            ? issue.description
                                                                            : "Not provided"}
                                                                    </p>
                                                                </div>
                                                                {issue.stepsToReproduce?.trim() ? (
                                                                    <div className="min-w-0">
                                                                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                                                            Steps to reproduce
                                                                        </p>
                                                                        <p className="mt-1.5 break-words text-sm leading-relaxed text-foreground [overflow-wrap:anywhere]">
                                                                            {
                                                                                issue.stepsToReproduce
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                ) : null}
                                                                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 text-sm">
                                                                    <div>
                                                                        <dt className="text-muted-foreground">
                                                                            Category
                                                                        </dt>
                                                                        <dd className="mt-1.5">
                                                                            <Badge variant="outline">
                                                                                {
                                                                                    issue.category
                                                                                }
                                                                            </Badge>
                                                                        </dd>
                                                                    </div>
                                                                    <div>
                                                                        <dt className="text-muted-foreground">
                                                                            Affected
                                                                            sessions
                                                                        </dt>
                                                                        <dd className="mt-1.5 tabular-nums font-medium">
                                                                            {issue.affectedSessionsCount.toLocaleString()}
                                                                        </dd>
                                                                    </div>
                                                                    <div>
                                                                        <dt className="text-muted-foreground">
                                                                            First reported
                                                                        </dt>
                                                                        <dd className="mt-1.5 whitespace-normal text-foreground">
                                                                            {formatIssueDateTime(
                                                                                issue.date,
                                                                            )}
                                                                        </dd>
                                                                    </div>
                                                                    {issue.pageUrl?.trim() ? (
                                                                        <div className="sm:col-span-2 lg:col-span-3">
                                                                            <dt className="text-muted-foreground">
                                                                                Page URL
                                                                            </dt>
                                                                            <dd className="mt-1.5 break-all font-mono text-xs text-foreground">
                                                                                {
                                                                                    issue.pageUrl
                                                                                }
                                                                            </dd>
                                                                        </div>
                                                                    ) : null}
                                                                </dl>
                                                                {issue.consoleLogs &&
                                                                issue.consoleLogs.length >
                                                                    0 ? (
                                                                    <div>
                                                                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                                                            Console logs
                                                                        </p>
                                                                        <ScrollArea className="mt-1.5 max-h-48 rounded-md border bg-background">
                                                                            <ul className="space-y-1 p-3 font-mono text-xs leading-relaxed">
                                                                                {issue.consoleLogs.map(
                                                                                    (
                                                                                        line,
                                                                                        i,
                                                                                    ) => (
                                                                                        <li
                                                                                            key={`${issue.id}-log-${i}`}
                                                                                            className="break-all text-foreground"
                                                                                        >
                                                                                            {
                                                                                                line
                                                                                            }
                                                                                        </li>
                                                                                    ),
                                                                                )}
                                                                            </ul>
                                                                        </ScrollArea>
                                                                    </div>
                                                                ) : null}
                                                                {issue.attachments &&
                                                                issue.attachments
                                                                    .length > 0 ? (
                                                                    <div>
                                                                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                                                            Attachments
                                                                        </p>
                                                                        <div className="mt-3 grid gap-4 sm:grid-cols-2">
                                                                            {issue.attachments.map(
                                                                                (
                                                                                    att,
                                                                                    i,
                                                                                ) => {
                                                                                    const kind =
                                                                                        attachmentDisplayKind(
                                                                                            att.mimeType,
                                                                                            att.filename,
                                                                                        );
                                                                                    const caption =
                                                                                        att.filename ??
                                                                                        `Attachment ${i + 1}`;
                                                                                    return (
                                                                                        <figure
                                                                                            key={`${issue.id}-att-${i}`}
                                                                                            className="overflow-hidden rounded-lg border bg-background"
                                                                                        >
                                                                                            {kind ===
                                                                                            "image" ? (
                                                                                                <a
                                                                                                    className="block cursor-pointer outline-none ring-offset-background transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                                                                                    href={
                                                                                                        att.url
                                                                                                    }
                                                                                                    rel="noopener noreferrer"
                                                                                                    target="_blank"
                                                                                                >
                                                                                                    {/* eslint-disable-next-line @next/next/no-img-element -- Convex / user URLs */}
                                                                                                    <img
                                                                                                        alt={
                                                                                                            caption
                                                                                                        }
                                                                                                        className="h-auto max-h-80 w-full object-contain bg-muted/30"
                                                                                                        loading="lazy"
                                                                                                        src={
                                                                                                            att.url
                                                                                                        }
                                                                                                    />
                                                                                                </a>
                                                                                            ) : null}
                                                                                            {kind ===
                                                                                            "video" ? (
                                                                                                <div>
                                                                                                    <div className="flex justify-end border-b bg-muted/20 px-2 py-1.5">
                                                                                                        <Button
                                                                                                            asChild
                                                                                                            size="sm"
                                                                                                            variant="ghost"
                                                                                                            className="h-8 text-xs"
                                                                                                        >
                                                                                                            <a
                                                                                                                href={
                                                                                                                    att.url
                                                                                                                }
                                                                                                                rel="noopener noreferrer"
                                                                                                                target="_blank"
                                                                                                            >
                                                                                                                Open
                                                                                                                in new
                                                                                                                tab
                                                                                                            </a>
                                                                                                        </Button>
                                                                                                    </div>
                                                                                                    <video
                                                                                                        className="max-h-80 w-full bg-black"
                                                                                                        controls
                                                                                                        preload="metadata"
                                                                                                        src={
                                                                                                            att.url
                                                                                                        }
                                                                                                    />
                                                                                                </div>
                                                                                            ) : null}
                                                                                            {kind ===
                                                                                            "other" ? (
                                                                                                <div className="flex flex-col gap-2 p-4">
                                                                                                    <p className="text-sm text-foreground">
                                                                                                        {
                                                                                                            caption
                                                                                                        }
                                                                                                    </p>
                                                                                                    <Button
                                                                                                        asChild
                                                                                                        size="sm"
                                                                                                        variant="outline"
                                                                                                    >
                                                                                                        <a
                                                                                                            href={
                                                                                                                att.url
                                                                                                            }
                                                                                                            rel="noopener noreferrer"
                                                                                                            target="_blank"
                                                                                                        >
                                                                                                            Open
                                                                                                            file
                                                                                                        </a>
                                                                                                    </Button>
                                                                                                </div>
                                                                                            ) : null}
                                                                                            <figcaption className="border-t px-3 py-2 text-xs text-muted-foreground break-all">
                                                                                                {caption}
                                                                                                {att.mimeType
                                                                                                    ? ` · ${att.mimeType}`
                                                                                                    : ""}
                                                                                            </figcaption>
                                                                                        </figure>
                                                                                    );
                                                                                },
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ) : null}
                                                                <div>
                                                                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                                                        Reporter sessions
                                                                    </p>
                                                                    <div className="mt-3 overflow-hidden rounded-lg border">
                                                                        <Table>
                                                                            <TableHeader>
                                                                                <TableRow className="hover:bg-transparent">
                                                                                    <TableHead className="h-10 max-w-[140px] px-3 text-xs font-medium">
                                                                                        Session
                                                                                    </TableHead>
                                                                                    <TableHead className="h-10 px-3 text-xs font-medium">
                                                                                        User
                                                                                    </TableHead>
                                                                                    <TableHead className="h-10 px-3 text-xs font-medium whitespace-nowrap">
                                                                                        Captured
                                                                                    </TableHead>
                                                                                    <TableHead className="h-10 px-3 text-xs font-medium">
                                                                                        Browser
                                                                                    </TableHead>
                                                                                    <TableHead className="h-10 px-3 text-xs font-medium">
                                                                                        OS
                                                                                    </TableHead>
                                                                                    <TableHead className="h-10 px-3 text-xs font-medium">
                                                                                        Region
                                                                                    </TableHead>
                                                                                </TableRow>
                                                                            </TableHeader>
                                                                            <TableBody>
                                                                                {issue
                                                                                    .affectedSessions &&
                                                                                issue
                                                                                    .affectedSessions
                                                                                    .length >
                                                                                    0 ? (
                                                                                    issue.affectedSessions.map(
                                                                                        (
                                                                                            s,
                                                                                        ) => (
                                                                                            <TableRow
                                                                                                key={`${issue.id}-${s.id}`}
                                                                                            >
                                                                                                <TableCell className="px-3 py-2 whitespace-normal">
                                                                                                    <Button
                                                                                                        className="h-8 gap-1.5 px-2"
                                                                                                        onClick={() =>
                                                                                                            void copyContactSessionId(
                                                                                                                s.id,
                                                                                                                `${issue.id}:${s.id}`,
                                                                                                            )
                                                                                                        }
                                                                                                        size="sm"
                                                                                                        type="button"
                                                                                                        variant="outline"
                                                                                                    >
                                                                                                        {copiedSessionKey ===
                                                                                                        `${issue.id}:${s.id}` ? (
                                                                                                            <>
                                                                                                                <CheckIcon className="size-3.5 shrink-0" />
                                                                                                                Copied
                                                                                                            </>
                                                                                                        ) : (
                                                                                                            <>
                                                                                                                <CopyIcon className="size-3.5 shrink-0" />
                                                                                                                Copy ID
                                                                                                            </>
                                                                                                        )}
                                                                                                    </Button>
                                                                                                </TableCell>
                                                                                                <TableCell className="max-w-[min(14rem,100%)] px-3 py-2 whitespace-normal">
                                                                                                    <span className="block text-xs leading-snug font-medium text-foreground">
                                                                                                        {s.name?.trim() ||
                                                                                                            "Visitor"}
                                                                                                    </span>
                                                                                                    <span className="text-muted-foreground mt-0.5 block break-all text-xs leading-snug">
                                                                                                        {s.email?.trim() ||
                                                                                                            "—"}
                                                                                                    </span>
                                                                                                </TableCell>
                                                                                                <TableCell className="px-3 py-2 tabular-nums text-xs whitespace-normal">
                                                                                                    {formatShortCapturedAt(
                                                                                                        s.lastSeen,
                                                                                                    )}
                                                                                                </TableCell>
                                                                                                <TableCell className="max-w-[min(12rem,100%)] px-3 py-2 text-xs break-words whitespace-normal">
                                                                                                    {
                                                                                                        s.browser
                                                                                                    }
                                                                                                </TableCell>
                                                                                                <TableCell className="px-3 py-2 text-xs whitespace-normal">
                                                                                                    {
                                                                                                        s.os
                                                                                                    }
                                                                                                </TableCell>
                                                                                                <TableCell className="px-3 py-2 text-xs text-muted-foreground whitespace-normal">
                                                                                                    {s.region ??
                                                                                                        "—"}
                                                                                                </TableCell>
                                                                                            </TableRow>
                                                                                        ),
                                                                                    )
                                                                                ) : (
                                                                                    <TableRow>
                                                                                        <TableCell
                                                                                            className="px-3 py-6 text-center text-sm text-muted-foreground italic"
                                                                                            colSpan={
                                                                                                6
                                                                                            }
                                                                                        >
                                                                                            No
                                                                                            session
                                                                                            snapshot
                                                                                            on
                                                                                            file
                                                                                            (older
                                                                                            issues
                                                                                            or
                                                                                            manual
                                                                                            data)
                                                                                        </TableCell>
                                                                                    </TableRow>
                                                                                )}
                                                                            </TableBody>
                                                                        </Table>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ) : null}
                                            </Fragment>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                        {!isLoadingFirstPage && issues.length > 0 ? (
                            <div className="border-t">
                                <InfiniteScrollTrigger
                                    canLoadMore={canLoadMore}
                                    isLoadingMore={isLoadingMore}
                                    onLoadMore={handleLoadMore}
                                    ref={topElementRef}
                                />
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </>
    );
};
