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
import { CheckCircle2Icon, ExternalLinkIcon, Loader2Icon, XCircleIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Id } from "@workspace/backend/_generated/dataModel";

export type IssueWorkflowSession = {
    dispatchedAt: string;
    repository: string;
    /** Set after the run is first resolved; reopening uses this for a stable GitHub run. */
    runId: number | null;
    /** Last known run status – used to disable "Fix now" while a run is active. */
    runStatus: string | null;
    runConclusion: string | null;
};

export type WorkflowPollContext = IssueWorkflowSession & {
    /** Omitted when the workflow was started from a manual prompt (not tied to a product issue). */
    issueId?: Id<"issues">;
};

type RunSummary = {
    id: number;
    status: string;
    conclusion: string | null;
    html_url: string;
};

type PullRequestSummary = {
    title: string;
    html_url: string;
};

type WorkflowRunPayload = {
    run: RunSummary | null;
    pullRequest?: PullRequestSummary | null;
    error?: string;
};

type WorkflowRunDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    context: WorkflowPollContext | null;
    /** `issueId` is undefined for custom (manual) dispatches not tied to a product issue. */
    onRunIdResolved?: (
        issueId: Id<"issues"> | undefined,
        runId: number,
    ) => void;
    onStatusChange?: (
        issueId: Id<"issues"> | undefined,
        status: string,
        conclusion: string | null,
    ) => void;
};

const POLL_MS = 3000;

// ─── status helpers ───────────────────────────────────────────────────────────

function statusMessage(run: RunSummary): {
    icon: React.ReactNode;
    heading: string;
    body: string;
} {
    if (run.status !== "completed") {
        return {
            icon: <Loader2Icon className="size-5 animate-spin text-muted-foreground" />,
            heading: "Working on a fix…",
            body: "Claude is analysing the issue and preparing a pull request. This usually takes a couple of minutes.",
        };
    }
    if (run.conclusion === "success") {
        return {
            icon: <CheckCircle2Icon className="size-5 text-green-600 dark:text-green-500" />,
            heading: "Fix ready!",
            body: "A pull request has been opened on GitHub. Review it and merge when you're happy.",
        };
    }
    if (run.conclusion === "cancelled") {
        return {
            icon: <XCircleIcon className="size-5 text-muted-foreground" />,
            heading: "Cancelled",
            body: "The workflow was cancelled before it could finish.",
        };
    }
    return {
        icon: <XCircleIcon className="size-5 text-destructive" />,
        heading: "Something went wrong",
        body: "The workflow didn't complete successfully. Open it on GitHub for more details.",
    };
}

// ─── dialog ───────────────────────────────────────────────────────────────────

export const WorkflowRunDialog = ({
    open,
    onOpenChange,
    context,
    onRunIdResolved,
    onStatusChange,
}: WorkflowRunDialogProps) => {
    const [run, setRun] = useState<RunSummary | null>(null);
    const [pullRequest, setPullRequest] = useState<PullRequestSummary | null>(null);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const resolvedRunIdRef = useRef<number | null>(null);
    const prWaitPollsRef = useRef(0);
    const pollIntervalRef = useRef<number | null>(null);
    const onRunIdResolvedRef = useRef(onRunIdResolved);
    onRunIdResolvedRef.current = onRunIdResolved;
    const onStatusChangeRef = useRef(onStatusChange);
    onStatusChangeRef.current = onStatusChange;

    const clearPoll = useCallback(() => {
        if (pollIntervalRef.current !== null) {
            window.clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
        }
    }, []);

    const resetLocalState = useCallback(() => {
        resolvedRunIdRef.current = null;
        clearPoll();
        setRun(null);
        setPullRequest(null);
        setFetchError(null);
    }, [clearPoll]);

    useEffect(() => {
        if (!open) {
            resetLocalState();
        }
    }, [open, resetLocalState]);

    useEffect(() => {
        if (!open || !context) {
            return;
        }

        resolvedRunIdRef.current = context.runId ?? null;
        prWaitPollsRef.current = 0;
        setRun(null);
        setPullRequest(null);
        setFetchError(null);

        const afterIso = context.dispatchedAt;
        const issueId = context.issueId;
        let cancelled = false;

        const poll = async () => {
            try {
                const params = new URLSearchParams();
                if (resolvedRunIdRef.current !== null) {
                    params.set("runId", String(resolvedRunIdRef.current));
                } else {
                    params.set("after", afterIso);
                }
                const res = await fetch(
                    `/api/github/actions/run?${params.toString()}`,
                );
                const data = (await res.json()) as WorkflowRunPayload;
                if (cancelled) {
                    return;
                }
                if (!res.ok) {
                    setFetchError(data.error ?? "Could not load workflow run.");
                    return;
                }
                setFetchError(null);
                setRun(data.run);
                setPullRequest(data.pullRequest ?? null);
                if (data.run?.id) {
                    const rid = data.run.id;
                    if (resolvedRunIdRef.current === null) {
                        resolvedRunIdRef.current = rid;
                        onRunIdResolvedRef.current?.(issueId, rid);
                    }
                    onStatusChangeRef.current?.(
                        issueId,
                        data.run.status,
                        data.run.conclusion,
                    );
                    if (data.run.status === "completed") {
                        if (
                            data.run.conclusion === "success" &&
                            !data.pullRequest
                        ) {
                            prWaitPollsRef.current += 1;
                            if (prWaitPollsRef.current >= 25) {
                                clearPoll();
                            }
                        } else {
                            prWaitPollsRef.current = 0;
                            clearPoll();
                        }
                    }
                }
            } catch {
                if (!cancelled) {
                    setFetchError("Network error while loading workflow run.");
                }
            }
        };

        void poll();
        clearPoll();
        pollIntervalRef.current = window.setInterval(() => void poll(), POLL_MS);

        return () => {
            cancelled = true;
            clearPoll();
        };
    }, [open, context?.issueId, context?.dispatchedAt, context?.repository, clearPoll]);

    const status = run ? statusMessage(run) : null;
    const tiedToIssue = context?.issueId !== undefined;

    return (
        <Dialog onOpenChange={onOpenChange} open={open}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {tiedToIssue
                            ? "Fixing issue with AI"
                            : "GitHub Actions workflow"}
                    </DialogTitle>
                    <DialogDescription>
                        {tiedToIssue
                            ? "Track the GitHub Actions workflow while a fix is prepared for this issue."
                            : "Track the workflow run for your custom prompt. Progress is not linked to a product issue row."}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {context ? (
                        <div className="rounded-lg border bg-muted/50 p-4">
                            <p className="font-mono text-sm font-medium">{context.repository}</p>
                        </div>
                    ) : null}

                    {fetchError ? (
                        <p className="text-sm text-destructive">{fetchError}</p>
                    ) : status ? (
                        <div className="flex flex-col gap-4">
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 shrink-0">{status.icon}</div>
                                <div className="flex flex-col gap-1">
                                    <p className="font-medium leading-snug">{status.heading}</p>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {status.body}
                                    </p>
                                </div>
                            </div>
                            {pullRequest &&
                            run?.status === "completed" &&
                            run.conclusion === "success" ? (
                                <div className="rounded-lg border bg-muted/50 p-4">
                                    <p className="text-muted-foreground text-xs">Pull request</p>
                                    <a
                                        className="mt-1 inline-flex items-center gap-1.5 font-medium text-foreground underline-offset-4 hover:underline"
                                        href={pullRequest.html_url}
                                        rel="noreferrer"
                                        target="_blank"
                                    >
                                        {pullRequest.title}
                                        <ExternalLinkIcon className="size-3.5 shrink-0 text-muted-foreground" />
                                    </a>
                                </div>
                            ) : null}
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 text-muted-foreground text-sm">
                            <Loader2Icon className="size-4 animate-spin shrink-0" />
                            Waiting for the workflow to start…
                        </div>
                    )}
                </div>

                <DialogFooter>
                    {run?.html_url ? (
                        <Button asChild variant="outline">
                            <a
                                href={run.html_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5"
                            >
                                Open on GitHub
                                <ExternalLinkIcon className="size-3.5" />
                            </a>
                        </Button>
                    ) : null}
                    <Button
                        onClick={() => onOpenChange(false)}
                        type="button"
                        variant="outline"
                    >
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
