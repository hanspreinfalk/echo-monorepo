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

type IssueScreenshot = {
    label: string;
    url: string;
};

type ProductIssue = {
    id: string;
    title: string;
    description: string;
    category: IssueCategory;
    criticality: IssueCriticality;
    occurrences: number;
    /** ISO 8601 — first report in this aggregate */
    date: string;
    resolved: boolean;
    /** Short line describing what end users see */
    userImpact?: string;
    errorMessage?: string;
    stackTrace?: string;
    consoleLogs?: string[];
    screenshots?: IssueScreenshot[];
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

const INITIAL_ISSUES: ProductIssue[] = [
    {
        id: "1",
        title: "Login form shows a generic error on network failure",
        description:
            "When the auth API times out, users only see a vague message with no retry or offline guidance.",
        category: "UX",
        criticality: "Medium",
        occurrences: 47,
        date: "2026-04-02T09:41:00.000Z",
        resolved: false,
        userImpact:
            "Users see “Something went wrong” with no way to retry; several abandoned sign‑ins per day.",
        errorMessage: "AuthError: Network request failed after 30000ms",
        stackTrace: `AuthError: Network request failed after 30000ms
    at signIn (webpack-internal:///(app-pages-browser)/./lib/auth.ts:112:14)
    at async handleSubmit (webpack-internal:///(app-pages-browser)/./components/login-form.tsx:44:9)`,
        consoleLogs: [
            "[info] LoginForm mounted",
            "[warn] auth: preflight to /api/session slow (2.1s)",
            "[error] POST /api/auth/login net::ERR_TIMED_OUT",
            "[error] AuthError: Network request failed after 30000ms",
        ],
        screenshots: [
            {
                label: "Generic error toast after timeout",
                url: "https://placehold.co/720x400/0f172a/94a3b8/png?text=Login+%E2%80%94+Something+went+wrong",
            },
            {
                label: "Network tab — stalled request",
                url: "https://placehold.co/720x400/1e293b/64748b/png?text=DevTools+%E2%80%94+login+pending",
            },
        ],
        affectedSessions: [
            {
                id: "sess_…a3f9",
                email: "lena.mueller@example.com",
                lastSeen: "2026-04-02T10:55:00.000Z",
                browser: "Chrome 134",
                os: "macOS 15",
                region: "DE",
            },
            {
                id: "sess_…91c2",
                email: "jordan.park@example.com",
                lastSeen: "2026-04-02T09:12:00.000Z",
                browser: "Safari 18",
                os: "iOS 18",
                region: "US",
            },
            {
                id: "sess_…7e01",
                email: "sam.oconnor@example.com",
                lastSeen: "2026-04-01T22:40:00.000Z",
                browser: "Firefox 136",
                os: "Windows 11",
                region: "CA",
            },
        ],
        pageUrl: "https://app.example.com/login",
    },
    {
        id: "2",
        title: "Large file uploads block the UI thread",
        description:
            "Uploading multi‑MB documents freezes the tab until processing finishes; progress is unclear.",
        category: "Performance",
        criticality: "High",
        occurrences: 128,
        date: "2026-04-03T18:05:00.000Z",
        resolved: false,
        userImpact:
            "The page becomes unresponsive for 5–20s; users think the upload failed and submit again.",
        errorMessage: "Long task detected: 18420ms (main thread)",
        stackTrace: `Long task detected: 18420ms
    at processFileChunk (webpack-internal:///(app-pages-browser)/./lib/upload.ts:88:21)
    at async onFileSelect (webpack-internal:///(app-pages-browser)/./components/file-upload.tsx:31:5)`,
        consoleLogs: [
            "[info] FileUpload: selected file.pdf (8.2 MB)",
            "[warn] Long task: 18420ms — possible main-thread block",
            "[info] FileUpload: processing complete",
        ],
        screenshots: [
            {
                label: "Frozen UI during upload",
                url: "https://placehold.co/720x400/0f172a/94a3b8/png?text=Upload+spinner+frozen",
            },
        ],
        affectedSessions: [
            {
                id: "sess_…b221",
                email: "priya.shah@example.com",
                lastSeen: "2026-04-03T18:58:00.000Z",
                browser: "Edge 134",
                os: "Windows 11",
                region: "UK",
            },
            {
                id: "sess_…4d88",
                email: "chris.rivera@example.com",
                lastSeen: "2026-04-03T17:10:00.000Z",
                browser: "Chrome 134",
                os: "ChromeOS",
            },
        ],
        pageUrl: "https://app.example.com/inbox/upload",
    },
    {
        id: "3",
        title: "Focus is lost after closing the delete confirmation",
        description:
            "Keyboard users cannot return to the row action menu without tabbing from the top of the page.",
        category: "Accessibility",
        criticality: "Low",
        occurrences: 9,
        date: "2026-03-19T16:30:00.000Z",
        resolved: false,
        userImpact:
            "After Escape or Confirm, focus drops to `<body>`; screen reader users lose context.",
        consoleLogs: [
            "[debug] Dialog closed, restoreFocus target missing",
            "[info] focus moved to document.body",
        ],
        affectedSessions: [
            {
                id: "sess_…c100",
                email: "noah.devries@example.com",
                lastSeen: "2026-03-19T15:02:00.000Z",
                browser: "Safari 18",
                os: "macOS 15",
                region: "NL",
            },
        ],
        pageUrl: "https://app.example.com/issues",
    },
    {
        id: "4",
        title: "Exported CSV includes unsanitized user input",
        description:
            "Cells that start with '=' may be interpreted as formulas when opened in spreadsheet apps.",
        category: "Security",
        criticality: "Critical",
        occurrences: 3,
        date: "2026-03-29T14:12:00.000Z",
        resolved: false,
        userImpact:
            "Opening exports in Excel can trigger formula injection warnings; one enterprise user flagged IT.",
        errorMessage: "SecurityWarning: CSV cell begins with formula prefix '='",
        stackTrace: `SecurityWarning: CSV cell begins with formula prefix '='
    at exportRowsToCsv (webpack-internal:///(app-pages-browser)/./lib/csv.ts:56:11)
    at handleExport (webpack-internal:///(app-pages-browser)/./views/data-table.tsx:203:7)`,
        consoleLogs: [
            "[info] Export started: 1,240 rows",
            "[warn] csv: cell at row 882 escaped as formula risk",
            "[info] Export complete",
        ],
        screenshots: [
            {
                label: "Excel security warning on open",
                url: "https://placehold.co/720x400/450a0a/fca5a5/png?text=Excel+security+notice",
            },
        ],
        affectedSessions: [
            {
                id: "sess_…e900",
                email: "alex.kim@example.com",
                lastSeen: "2026-03-29T14:12:00.000Z",
                browser: "Chrome 134",
                os: "Windows 11",
                region: "US",
            },
        ],
        pageUrl: "https://app.example.com/reports/export",
    },
];

function buildFixPrompt(issue: ProductIssue): string {
    const lines = [
        "You are helping fix a product issue in our application.",
        "",
        `Status: ${issue.resolved ? "Resolved" : "Open"}`,
        `Category: ${issue.category}`,
        `Criticality: ${issue.criticality}`,
        `Occurrences (reported): ${issue.occurrences}`,
        `Date: ${formatIssueDate(issue.date)}`,
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
    if (issue.userImpact) {
        lines.push("", "User impact:", issue.userImpact);
    }
    if (issue.errorMessage) {
        lines.push("", "Error:", issue.errorMessage);
    }
    if (issue.stackTrace) {
        lines.push("", "Stack trace:", issue.stackTrace);
    }
    if (issue.consoleLogs?.length) {
        lines.push("", "Console:", ...issue.consoleLogs.map((l) => `  ${l}`));
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
    const [issues, setIssues] = useState<ProductIssue[]>(INITIAL_ISSUES);
    const [criticalitySort, setCriticalitySort] = useState<"asc" | "desc">(
        "desc",
    );
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedIssue, setSelectedIssue] = useState<ProductIssue | null>(
        null,
    );
    const [expandedIssueId, setExpandedIssueId] = useState<string | null>(
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

    const handleDeleteClick = (issue: ProductIssue) => {
        setSelectedIssue(issue);
        setDeleteDialogOpen(true);
    };

    const setIssueResolved = useCallback((id: string, resolved: boolean) => {
        setIssues((prev) =>
            prev.map((i) => (i.id === id ? { ...i, resolved } : i)),
        );
        setExpandedIssueId((cur) => (cur === id ? null : cur));
    }, []);

    const handleIssueDeleted = useCallback(() => {
        if (!selectedIssue) {
            return;
        }
        const id = selectedIssue.id;
        setIssues((prev) => prev.filter((i) => i.id !== id));
        setExpandedIssueId((cur) => (cur === id ? null : cur));
        setSelectedIssue(null);
    }, [selectedIssue]);

    const colCount = 4;

    return (
        <>
            <DeleteIssueDialog
                issue={
                    selectedIssue
                        ? { id: selectedIssue.id, title: selectedIssue.title }
                        : null
                }
                onDeleted={handleIssueDeleted}
                onOpenChange={setDeleteDialogOpen}
                open={deleteDialogOpen}
            />
            <div className="flex min-h-screen flex-col bg-muted p-8">
                <div className="mx-auto w-full max-w-5xl">
                    <div className="space-y-2">
                        <h1 className="text-2xl md:text-4xl">Product Issues</h1>
                        <p className="text-muted-foreground">
                            Expand a row for logs, screenshots, stack traces, and
                            affected sessions. Copy prompts for your assistant.
                        </p>
                    </div>

                    <div className="mt-8 rounded-lg border bg-background">
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
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="px-6 py-4 font-medium min-w-0">
                                        Issue
                                    </TableHead>
                                    <TableHead className="px-6 py-4 font-medium whitespace-nowrap">
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
                                {visibleIssues.length === 0 ? (
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
                                                    <TableCell className="px-6 py-4 align-middle">
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
                                                                className={`min-w-0 flex-1 font-medium leading-snug ${
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
                                                            className="px-6 py-4 align-top"
                                                            colSpan={colCount}
                                                        >
                                                            <div className="space-y-6 pl-7">
                                                                {issue.userImpact ? (
                                                                    <div>
                                                                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                                                            What users see
                                                                        </p>
                                                                        <p className="mt-1.5 text-sm text-foreground leading-relaxed">
                                                                            {
                                                                                issue.userImpact
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                ) : null}
                                                                <div>
                                                                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                                                        Description
                                                                    </p>
                                                                    <p className="mt-1.5 text-sm text-foreground leading-relaxed">
                                                                        {
                                                                            issue.description
                                                                        }
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
                                                                            Occurrences
                                                                        </dt>
                                                                        <dd className="mt-1.5 tabular-nums font-medium">
                                                                            {issue.occurrences.toLocaleString()}
                                                                        </dd>
                                                                    </div>
                                                                    <div>
                                                                        <dt className="text-muted-foreground">
                                                                            First reported
                                                                        </dt>
                                                                        <dd className="mt-1.5 tabular-nums text-foreground">
                                                                            {formatIssueDate(
                                                                                issue.date,
                                                                            )}
                                                                        </dd>
                                                                    </div>
                                                                    {issue.pageUrl ? (
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
                                                                {issue.errorMessage ||
                                                                issue.stackTrace ? (
                                                                    <div className="space-y-3">
                                                                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                                                            Error & stack
                                                                        </p>
                                                                        {issue.errorMessage ? (
                                                                            <p className="rounded-md border bg-background px-3 py-2 font-mono text-xs text-destructive leading-relaxed">
                                                                                {
                                                                                    issue.errorMessage
                                                                                }
                                                                            </p>
                                                                        ) : null}
                                                                        {issue.stackTrace ? (
                                                                            <ScrollArea className="max-h-40 rounded-md border bg-background">
                                                                                <pre className="p-3 font-mono text-xs text-foreground leading-relaxed whitespace-pre-wrap break-all">
                                                                                    {
                                                                                        issue.stackTrace
                                                                                    }
                                                                                </pre>
                                                                            </ScrollArea>
                                                                        ) : null}
                                                                    </div>
                                                                ) : null}
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
                                                                {issue.screenshots &&
                                                                issue.screenshots
                                                                    .length > 0 ? (
                                                                    <div>
                                                                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                                                            Screenshots
                                                                        </p>
                                                                        <div className="mt-3 grid gap-4 sm:grid-cols-2">
                                                                            {issue.screenshots.map(
                                                                                (
                                                                                    shot,
                                                                                    i,
                                                                                ) => (
                                                                                    <figure
                                                                                        key={`${issue.id}-shot-${i}`}
                                                                                        className="overflow-hidden rounded-lg border bg-background"
                                                                                    >
                                                                                        {/* eslint-disable-next-line @next/next/no-img-element -- external demo URLs */}
                                                                                        <img
                                                                                            alt={
                                                                                                shot.label
                                                                                            }
                                                                                            className="h-auto w-full object-cover"
                                                                                            height={
                                                                                                400
                                                                                            }
                                                                                            loading="lazy"
                                                                                            src={
                                                                                                shot.url
                                                                                            }
                                                                                            width={
                                                                                                720
                                                                                            }
                                                                                        />
                                                                                        <figcaption className="border-t px-3 py-2 text-xs text-muted-foreground">
                                                                                            {
                                                                                                shot.label
                                                                                            }
                                                                                        </figcaption>
                                                                                    </figure>
                                                                                ),
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ) : null}
                                                                {issue.affectedSessions &&
                                                                issue
                                                                    .affectedSessions
                                                                    .length > 0 ? (
                                                                    <div>
                                                                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                                                            Affected sessions
                                                                            (sample)
                                                                        </p>
                                                                        <p className="mt-1 text-xs text-muted-foreground">
                                                                            Session id and
                                                                            account email
                                                                            as captured when
                                                                            the error was
                                                                            reported.
                                                                        </p>
                                                                        <div className="mt-3 overflow-hidden rounded-lg border">
                                                                            <Table>
                                                                                <TableHeader>
                                                                                    <TableRow className="hover:bg-transparent">
                                                                                        <TableHead className="h-10 px-3 text-xs font-medium">
                                                                                            Session
                                                                                        </TableHead>
                                                                                        <TableHead className="h-10 px-3 text-xs font-medium">
                                                                                            Email
                                                                                        </TableHead>
                                                                                        <TableHead className="h-10 px-3 text-xs font-medium">
                                                                                            Last
                                                                                            seen
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
                                                                                    {issue.affectedSessions.map(
                                                                                        (
                                                                                            s,
                                                                                        ) => (
                                                                                            <TableRow
                                                                                                key={`${issue.id}-${s.id}`}
                                                                                            >
                                                                                                <TableCell className="px-3 py-2 font-mono text-xs">
                                                                                                    {
                                                                                                        s.id
                                                                                                    }
                                                                                                </TableCell>
                                                                                                <TableCell className="max-w-[200px] px-3 py-2 break-all text-xs">
                                                                                                    {
                                                                                                        s.email
                                                                                                    }
                                                                                                </TableCell>
                                                                                                <TableCell className="px-3 py-2 tabular-nums text-xs whitespace-nowrap">
                                                                                                    {formatIssueDateTime(
                                                                                                        s.lastSeen,
                                                                                                    )}
                                                                                                </TableCell>
                                                                                                <TableCell className="px-3 py-2 text-xs">
                                                                                                    {
                                                                                                        s.browser
                                                                                                    }
                                                                                                </TableCell>
                                                                                                <TableCell className="px-3 py-2 text-xs">
                                                                                                    {
                                                                                                        s.os
                                                                                                    }
                                                                                                </TableCell>
                                                                                                <TableCell className="px-3 py-2 text-xs text-muted-foreground">
                                                                                                    {s.region ??
                                                                                                        "—"}
                                                                                                </TableCell>
                                                                                            </TableRow>
                                                                                        ),
                                                                                    )}
                                                                                </TableBody>
                                                                            </Table>
                                                                        </div>
                                                                    </div>
                                                                ) : null}
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
                    </div>
                </div>
            </div>
        </>
    );
};
