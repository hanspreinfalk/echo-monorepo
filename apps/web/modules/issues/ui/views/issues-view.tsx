"use client";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
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
    MoreHorizontalIcon,
    RotateCcwIcon,
    TrashIcon,
} from "lucide-react";
import { Fragment, useCallback, useMemo, useState } from "react";
import { usePaginatedQuery, useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import type { Doc, Id } from "@workspace/backend/_generated/dataModel";
import { useInfiniteScroll } from "@workspace/ui/hooks/use-infinite-scroll";
import { InfiniteScrollTrigger } from "@workspace/ui/components/infinite-scroll-trigger";
import { DeleteIssueDialog } from "../components/delete-issue-dialog";

type IssueCategory =
    | "Bug"
    | "UX"
    | "Performance"
    | "Accessibility"
    | "Security"
    | "Data";

type IssueCriticality = "Critical" | "High" | "Medium" | "Low";

type AffectedSession = {
    /** Anonymized session or user bucket */
    id: string;
    email: string;
    /** ISO 8601 */
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
            email: s.email,
            lastSeen: capturedIso,
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
                    `  ${s.id} · ${s.email} · ${s.browser} · ${s.os}${s.region ? ` · ${s.region}` : ""} · last ${formatIssueDateTime(s.lastSeen)}`,
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

    const [criticalitySort, setCriticalitySort] = useState<"asc" | "desc">(
        "desc",
    );
    const [copiedId, setCopiedId] = useState<Id<"issues"> | null>(null);
    const [copiedSessionKey, setCopiedSessionKey] = useState<string | null>(
        null,
    );
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedIssue, setSelectedIssue] = useState<ProductIssue | null>(
        null,
    );
    const [expandedIssueId, setExpandedIssueId] = useState<Id<"issues"> | null>(
        null,
    );
    const [statusFilter, setStatusFilter] = useState<"open" | "resolved">(
        "open",
    );

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

    const copyPrompt = useCallback(async (issue: ProductIssue) => {
        try {
            await navigator.clipboard.writeText(buildFixPrompt(issue));
            setCopiedId(issue.id);
            window.setTimeout(() => setCopiedId(null), 2000);
        } catch {
            // Clipboard may be unavailable (permissions / non-secure context)
        }
    }, []);

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
            <div className="flex min-h-screen min-w-0 flex-col bg-muted p-8">
                <div className="mx-auto w-full min-w-0 max-w-3xl">
                    <div className="space-y-2">
                        <h1 className="text-2xl md:text-4xl">Product Issues</h1>
                        <p className="text-muted-foreground">
                            Expand a row for console logs, attachments, and
                            affected sessions. Copy prompts for your assistant.
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
                                    <TableHead className="px-6 py-4 font-medium w-[140px] text-right whitespace-nowrap">
                                        Prompt
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
                                                            <span
                                                                className={`min-w-0 flex-1 break-words font-medium leading-snug ${
                                                                    issue.resolved
                                                                        ? "line-through decoration-muted-foreground/70"
                                                                        : ""
                                                                }`}
                                                            >
                                                                {issue.title}
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
                                                        <Button
                                                            className="gap-2"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                copyPrompt(
                                                                    issue,
                                                                );
                                                            }}
                                                            size="sm"
                                                            variant="outline"
                                                        >
                                                            {copiedId === issue.id ? (
                                                                <>
                                                                    <CheckIcon className="size-4" />
                                                                    Copied
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <CopyIcon className="size-4" />
                                                                    Copy
                                                                </>
                                                            )}
                                                        </Button>
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
                                                                        onClick={(
                                                                            e,
                                                                        ) => {
                                                                            e.stopPropagation();
                                                                            setIssueResolved(
                                                                                issue.id,
                                                                                true,
                                                                            );
                                                                        }}
                                                                    >
                                                                        <CheckCircle2Icon className="size-4 mr-2" />
                                                                        Resolved
                                                                    </DropdownMenuItem>
                                                                )}
                                                                <DropdownMenuItem
                                                                    className="text-destructive"
                                                                    onClick={(
                                                                        e,
                                                                    ) => {
                                                                        e.stopPropagation();
                                                                        handleDeleteClick(
                                                                            issue,
                                                                        );
                                                                    }}
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
                                                                <div className="min-w-0">
                                                                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                                                        Steps to reproduce
                                                                    </p>
                                                                    <p
                                                                        className={`mt-1.5 break-words text-sm leading-relaxed [overflow-wrap:anywhere] ${
                                                                            issue.stepsToReproduce?.trim()
                                                                                ? "text-foreground"
                                                                                : "text-muted-foreground italic"
                                                                        }`}
                                                                    >
                                                                        {issue.stepsToReproduce?.trim()
                                                                            ? issue.stepsToReproduce
                                                                            : "Not provided"}
                                                                    </p>
                                                                </div>
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
                                                                    <div className="sm:col-span-2 lg:col-span-3">
                                                                        <dt className="text-muted-foreground">
                                                                            Page URL
                                                                        </dt>
                                                                        <dd
                                                                            className={`mt-1.5 break-all font-mono text-xs ${
                                                                                issue.pageUrl?.trim()
                                                                                    ? "text-foreground"
                                                                                    : "text-muted-foreground italic"
                                                                            }`}
                                                                        >
                                                                            {issue.pageUrl?.trim()
                                                                                ? issue.pageUrl
                                                                                : "Not provided"}
                                                                        </dd>
                                                                    </div>
                                                                </dl>
                                                                <div>
                                                                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                                                        Console logs
                                                                    </p>
                                                                    {issue.consoleLogs &&
                                                                    issue.consoleLogs.length >
                                                                        0 ? (
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
                                                                    ) : (
                                                                        <p className="mt-1.5 text-sm text-muted-foreground italic">
                                                                            Not provided
                                                                        </p>
                                                                    )}
                                                                </div>
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
                                                                                        Email
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
                                                                                                <TableCell className="max-w-[200px] px-3 py-2 break-all text-xs">
                                                                                                    {
                                                                                                        s.email
                                                                                                    }
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
