"use client";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
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

type ProductIssue = {
    id: string;
    title: string;
    description: string;
    category: IssueCategory;
    criticality: IssueCriticality;
    occurrences: number;
    /** ISO 8601 */
    date: string;
    resolved: boolean;
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
    },
];

function buildFixPrompt(issue: ProductIssue): string {
    return [
        "You are helping fix a product issue in our application.",
        "",
        `Status: ${issue.resolved ? "Resolved" : "Open"}`,
        `Category: ${issue.category}`,
        `Criticality: ${issue.criticality}`,
        `Occurrences (reported): ${issue.occurrences}`,
        `Date: ${formatIssueDate(issue.date)}`,
        "",
        `Issue: ${issue.title}`,
        "",
        "Details:",
        issue.description,
        "",
        "Please locate the relevant code, implement a fix, and summarize what you changed.",
    ].join("\n");
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
                <div className="mx-auto w-full max-w-3xl">
                    <div className="space-y-2">
                        <h1 className="text-2xl md:text-4xl">Issues</h1>
                        <p className="text-muted-foreground">
                            Expand a row for details. Copy prompts for your assistant.
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
                                                            <div className="space-y-4 pl-7">
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
                                                                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3 text-sm">
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
                                                                            Date
                                                                        </dt>
                                                                        <dd className="mt-1.5 tabular-nums text-foreground">
                                                                            {formatIssueDate(
                                                                                issue.date,
                                                                            )}
                                                                        </dd>
                                                                    </div>
                                                                </dl>
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
