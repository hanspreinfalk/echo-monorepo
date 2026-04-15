"use client";

import { api } from "@workspace/backend/_generated/api";
import type { Doc, Id } from "@workspace/backend/_generated/dataModel";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { InfiniteScrollTrigger } from "@workspace/ui/components/infinite-scroll-trigger";
import { Input } from "@workspace/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { useInfiniteScroll } from "@workspace/ui/hooks/use-infinite-scroll";
import { useAction, useMutation, usePaginatedQuery, useQuery } from "convex/react";
import { format } from "date-fns";
import { Loader2Icon, MoreHorizontalIcon, SearchIcon, XIcon } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

const PAGE_SIZE = 15;

/** Shared padding for every admin table search / filter row (all tabs). */
const ADMIN_TABLE_SEARCH_ROW =
  "flex flex-wrap items-center gap-2 border-b border-border px-4 py-3";

type SubscriptionStatusFilter =
  | "all"
  | "active"
  | "cancelled"
  | "expired"
  | "past_due"
  | "unpaid";

type TransactionStatusFilter = "all" | "pending" | "succeeded" | "failed";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatMoney(amount: number, currency: string) {
  const code = currency.toUpperCase();
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: code }).format(amount);
  } catch {
    return `${amount} ${code}`;
  }
}

function formatStripeMoney(amountSmallestUnit: number, currency: string) {
  return formatMoney(amountSmallestUnit / 100, currency);
}

function formatTs(ms: number | undefined) {
  if (ms === undefined) return "—";
  return format(ms, "PPp");
}

type SubStatus = Doc<"subscriptions">["status"];
type TxStatus = Doc<"transactions">["status"];
type PlanValue = NonNullable<Doc<"subscriptions">["plan"]>;

function planLabel(plan: PlanValue | null | undefined): string {
  if (!plan) return "Free";
  return plan.charAt(0).toUpperCase() + plan.slice(1);
}

function PlanBadge({ plan }: { plan: PlanValue | null | undefined }) {
  const label = planLabel(plan);
  if (!plan || plan === "free") {
    return (
      <Badge variant="outline" className="border-border text-muted-foreground">
        {label}
      </Badge>
    );
  }
  // pro
  return (
    <Badge
      variant="outline"
      className="border-violet-400/40 bg-violet-500/10 text-violet-600 dark:text-violet-400"
    >
      {label}
    </Badge>
  );
}

function SubStatusBadge({ status }: { status: SubStatus }) {
  if (!status) return <span className="text-muted-foreground">—</span>;
  const map: Record<
    NonNullable<SubStatus>,
    { label: string; className: string }
  > = {
    active: {
      label: "Active",
      className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    },
    cancelled: {
      label: "Cancelled",
      className: "bg-red-500/15 text-red-600 dark:text-red-400",
    },
    expired: {
      label: "Expired",
      className: "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400",
    },
    past_due: {
      label: "Past due",
      className: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    },
    unpaid: {
      label: "Unpaid",
      className: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
    },
  };
  const cfg = map[status];
  return (
    <Badge variant="outline" className={cfg.className}>
      {cfg.label}
    </Badge>
  );
}

function TxStatusBadge({ status }: { status: TxStatus }) {
  const map: Record<TxStatus, { label: string; className: string }> = {
    succeeded: {
      label: "Succeeded",
      className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    },
    pending: {
      label: "Pending",
      className: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    },
    failed: {
      label: "Failed",
      className: "bg-red-500/15 text-red-600 dark:text-red-400",
    },
  };
  const cfg = map[status];
  return (
    <Badge variant="outline" className={cfg.className}>
      {cfg.label}
    </Badge>
  );
}

// ---------------------------------------------------------------------------
// Three-dot menu (right-aligned submenus)
// ---------------------------------------------------------------------------

function ThreeDotMenu({ children }: { children: React.ReactNode }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8"
          aria-label="Actions"
        >
          <MoreHorizontalIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="bottom" sideOffset={4} className="w-48">
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Force submenus to always open to the right
function RightSubContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <DropdownMenuSubContent className={className}>
      {children}
    </DropdownMenuSubContent>
  );
}

// ---------------------------------------------------------------------------
// User actions dropdown
// ---------------------------------------------------------------------------

function AdminUserActionsMenu({
  user,
  effectiveRole,
  onRoleChange,
}: {
  user: Doc<"users">;
  effectiveRole: "admin" | "user";
  onRoleChange: (role: "admin" | "user") => void;
}) {
  const listClerkOrgs = useAction(api.public.admin.listClerkOrganizationsForUser);
  const startProCheckout = useAction(api.public.admin.startProCheckoutForOrganization);
  const scheduleCancelAtPeriodEnd = useAction(
    api.public.admin.scheduleSubscriptionCancelAtPeriodEnd,
  );

  const [orgs, setOrgs] = useState<
    { organizationId: string; name: string }[] | null
  >(null);
  const [orgsLoading, setOrgsLoading] = useState(false);

  const handleSubscriptionSubOpen = useCallback(
    (open: boolean) => {
      if (!open || !user.clerkUserId) return;
      setOrgs(null);
      setOrgsLoading(true);
      void listClerkOrgs({ clerkUserId: user.clerkUserId })
        .then((rows) => setOrgs(rows))
        .catch(() => {
          toast.error("Could not load Clerk organizations for this user.");
          setOrgs([]);
        })
        .finally(() => setOrgsLoading(false));
    },
    [user.clerkUserId, listClerkOrgs],
  );

  const handleUpgrade = useCallback(
    async (organizationId: string) => {
      if (!user.clerkUserId) return;
      try {
        const url = await startProCheckout({
          organizationId,
          clerkUserId: user.clerkUserId,
        });
        if (url) {
          window.open(url, "_blank", "noopener,noreferrer");
          toast.success("Stripe checkout opened in a new tab.");
        } else {
          toast.error("Checkout did not return a URL.");
        }
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Could not start checkout.");
      }
    },
    [user.clerkUserId, startProCheckout],
  );

  const handleDowngrade = useCallback(
    async (organizationId: string) => {
      try {
        await scheduleCancelAtPeriodEnd({ organizationId });
        toast.success("Pro will end after the current billing period.");
      } catch (e) {
        toast.error(
          e instanceof Error ? e.message : "Could not schedule downgrade.",
        );
      }
    },
    [scheduleCancelAtPeriodEnd],
  );

  return (
    <ThreeDotMenu>
      {/* Role submenu */}
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>Role</DropdownMenuSubTrigger>
        <RightSubContent>
          <DropdownMenuLabel>Set role</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup
            value={effectiveRole}
            onValueChange={(value) => {
              if (value === "admin" || value === "user") onRoleChange(value);
            }}
          >
            <DropdownMenuRadioItem value="user">User</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="admin">Admin</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </RightSubContent>
      </DropdownMenuSub>

      {/* Subscription submenu */}
      <DropdownMenuSub onOpenChange={handleSubscriptionSubOpen}>
        <DropdownMenuSubTrigger>Subscription</DropdownMenuSubTrigger>
        <RightSubContent className="max-h-72 overflow-y-auto">
          {!user.clerkUserId ? (
            <DropdownMenuItem disabled>No Clerk user linked</DropdownMenuItem>
          ) : orgsLoading ? (
            <DropdownMenuItem disabled>Loading…</DropdownMenuItem>
          ) : orgs?.length === 0 ? (
            <DropdownMenuItem disabled>No Clerk organizations</DropdownMenuItem>
          ) : (
            orgs?.map((org) => (
              <DropdownMenuSub key={org.organizationId}>
                <DropdownMenuSubTrigger className="max-w-[220px]">
                  <span className="truncate">{org.name}</span>
                </DropdownMenuSubTrigger>
                <RightSubContent>
                  <DropdownMenuItem
                    onSelect={() => void handleUpgrade(org.organizationId)}
                  >
                    Upgrade to Pro
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => void handleDowngrade(org.organizationId)}
                  >
                    Downgrade at period end
                  </DropdownMenuItem>
                </RightSubContent>
              </DropdownMenuSub>
            ))
          )}
        </RightSubContent>
      </DropdownMenuSub>
    </ThreeDotMenu>
  );
}

// Simple three-dot menus for other tables
function OrgActionsMenu({
  organizationId,
}: {
  organizationId: string;
}) {
  const scheduleCancelAtPeriodEnd = useAction(
    api.public.admin.scheduleSubscriptionCancelAtPeriodEnd,
  );
  const startProCheckout = useAction(api.public.admin.startProCheckoutForOrganization);
  // We don't have a clerkUserId here — Stripe checkout needs one.
  // Provide a "View in Clerk" shortcut only.
  return (
    <ThreeDotMenu>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>Subscription</DropdownMenuSubTrigger>
        <RightSubContent>
          <DropdownMenuItem
            onSelect={async () => {
              try {
                await scheduleCancelAtPeriodEnd({ organizationId });
                toast.success("Scheduled downgrade at period end.");
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "Failed.");
              }
            }}
          >
            Downgrade at period end
          </DropdownMenuItem>
        </RightSubContent>
      </DropdownMenuSub>
    </ThreeDotMenu>
  );
}

function SubscriptionActionsMenu({
  organizationId,
  stripeSubscriptionId,
}: {
  organizationId: string;
  stripeSubscriptionId: string | undefined;
}) {
  const scheduleCancelAtPeriodEnd = useAction(
    api.public.admin.scheduleSubscriptionCancelAtPeriodEnd,
  );
  return (
    <ThreeDotMenu>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>Manage</DropdownMenuSubTrigger>
        <RightSubContent>
          <DropdownMenuItem
            disabled={!stripeSubscriptionId}
            onSelect={async () => {
              try {
                await scheduleCancelAtPeriodEnd({ organizationId });
                toast.success("Scheduled downgrade at period end.");
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "Failed.");
              }
            }}
          >
            Downgrade at period end
          </DropdownMenuItem>
        </RightSubContent>
      </DropdownMenuSub>
    </ThreeDotMenu>
  );
}

// ---------------------------------------------------------------------------
// Shared: user rows renderer
// ---------------------------------------------------------------------------
function UserRows({
  users,
  onRoleChange,
}: {
  users: Doc<"users">[];
  onRoleChange: (userId: Id<"users">, role: "admin" | "user") => void;
}) {
  if (users.length === 0) return null;
  return (
    <>
      {users.map((u) => {
        const effective = u.role ?? "user";
        return (
          <TableRow key={u._id}>
            <TableCell className="max-w-[min(24rem,50vw)] min-w-0">
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="font-medium">{u.name}</span>
                {u.email ? (
                  <span className="text-muted-foreground truncate text-sm">{u.email}</span>
                ) : null}
              </div>
            </TableCell>
            <TableCell className="whitespace-nowrap text-xs">
              {formatTs(u._creationTime)}
            </TableCell>
            <TableCell>{effective}</TableCell>
            <TableCell className="text-right">
              <AdminUserActionsMenu
                user={u}
                effectiveRole={effective}
                onRoleChange={(role) => onRoleChange(u._id, role)}
              />
            </TableCell>
          </TableRow>
        );
      })}
    </>
  );
}

// ---------------------------------------------------------------------------
// Tab: Users
// ---------------------------------------------------------------------------
function UsersTab({ isAdmin }: { isAdmin: boolean }) {
  const [rawQuery, setRawQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Debounce: update searchQuery 300 ms after typing stops
  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(rawQuery.trim()), 300);
    return () => clearTimeout(t);
  }, [rawQuery]);

  const isSearching = searchQuery.length > 0;

  // Paginated list (no search)
  const usersPage = usePaginatedQuery(
    api.public.admin.listUsers,
    isAdmin && !isSearching ? {} : "skip",
    { initialNumItems: PAGE_SIZE },
  );

  // Search results (replaces pagination while a query is active)
  const searchResults = useQuery(
    api.public.admin.searchUsers,
    isAdmin && isSearching ? { query: searchQuery } : "skip",
  );

  const { topElementRef, handleLoadMore, canLoadMore, isLoadingFirstPage, isLoadingMore } =
    useInfiniteScroll({
      status: usersPage.status,
      loadMore: usersPage.loadMore,
      loadSize: PAGE_SIZE,
    });

  const setUserRole = useMutation(api.public.admin.setUserRole);

  const handleRole = useCallback(
    async (userId: Id<"users">, role: "admin" | "user") => {
      try {
        await setUserRole({ userId, role });
        toast.success(role === "admin" ? "Granted admin" : "Removed admin");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Could not update role");
      }
    },
    [setUserRole],
  );

  const tableHeader = (
    <TableHeader>
      <TableRow>
        <TableHead>User</TableHead>
        <TableHead>Created</TableHead>
        <TableHead>Role</TableHead>
        <TableHead className="w-[52px] text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );

  return (
    <div>
      {/* Search bar */}
      <div className={ADMIN_TABLE_SEARCH_ROW}>
        <div className="relative min-w-0 flex-1">
          <SearchIcon className="text-muted-foreground absolute left-3 top-1/2 size-3.5 -translate-y-1/2" />
          <Input
            placeholder="Search by name or email…"
            value={rawQuery}
            onChange={(e) => setRawQuery(e.target.value)}
            className="h-8 pl-8 pr-8 text-sm"
          />
          {rawQuery && (
            <button
              type="button"
              onClick={() => { setRawQuery(""); setSearchQuery(""); }}
              className="text-muted-foreground hover:text-foreground absolute right-2.5 top-1/2 -translate-y-1/2"
              aria-label="Clear search"
            >
              <XIcon className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Search mode */}
      {isSearching ? (
        <Table>
          {tableHeader}
          <TableBody>
            {searchResults === undefined ? (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center">
                  <Loader2Icon className="text-muted-foreground mx-auto size-5 animate-spin" />
                </TableCell>
              </TableRow>
            ) : searchResults.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-muted-foreground">
                  No users match &ldquo;{searchQuery}&rdquo;.
                </TableCell>
              </TableRow>
            ) : (
              <UserRows users={searchResults} onRoleChange={(id, role) => void handleRole(id, role)} />
            )}
          </TableBody>
        </Table>
      ) : (
        /* Paginated mode */
        <>
          {isLoadingFirstPage ? (
            <div className="flex items-center justify-center gap-2 py-16">
              <Loader2Icon className="text-muted-foreground size-6 animate-spin" />
              <span className="text-muted-foreground text-sm">Loading users…</span>
            </div>
          ) : (
            <Table>
              {tableHeader}
              <TableBody>
                {usersPage.results.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-muted-foreground">
                      No rows in the <code className="text-xs">users</code> table.
                    </TableCell>
                  </TableRow>
                ) : (
                  <UserRows
                    users={usersPage.results}
                    onRoleChange={(id, role) => void handleRole(id, role)}
                  />
                )}
              </TableBody>
            </Table>
          )}
          <InfiniteScrollTrigger
            canLoadMore={canLoadMore}
            isLoadingMore={isLoadingMore}
            onLoadMore={handleLoadMore}
            ref={topElementRef}
          />
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: Organizations
// ---------------------------------------------------------------------------

type OrgUserInfo = { name: string; email: string | null } | null;

function OrgTableRows({ rows, resolvedNames, orgUsers }: {
  rows: Array<{ organizationId: string; subscription: { plan?: string; status?: string } | null }>;
  resolvedNames: Record<string, string | null>;
  orgUsers: Record<string, OrgUserInfo>;
}) {
  return (
    <>
      {rows.map((o) => {
        const sub = o.subscription;
        const resolved = resolvedNames[o.organizationId] ?? undefined;
        const userEntry = o.organizationId in orgUsers ? orgUsers[o.organizationId] : undefined;
        return (
          <TableRow key={o.organizationId}>
            <TableCell className="font-mono text-xs">{o.organizationId}</TableCell>
            <TableCell>
              {resolved === undefined ? (
                <span className="text-muted-foreground text-xs">…</span>
              ) : (
                resolved ?? <span className="text-muted-foreground">—</span>
              )}
            </TableCell>
            <TableCell className="max-w-[min(18rem,35vw)] min-w-0">
              {userEntry === undefined ? (
                <span className="text-muted-foreground text-xs">…</span>
              ) : userEntry === null ? (
                <span className="text-muted-foreground">—</span>
              ) : (
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="font-medium truncate text-sm">{userEntry.name}</span>
                  {userEntry.email ? (
                    <span className="text-muted-foreground truncate text-xs">{userEntry.email}</span>
                  ) : null}
                </div>
              )}
            </TableCell>
            <TableCell>
              <PlanBadge plan={sub?.plan as "free" | "pro" | null | undefined} />
            </TableCell>
            <TableCell>
              <SubStatusBadge status={sub?.status as Parameters<typeof SubStatusBadge>[0]["status"]} />
            </TableCell>
            <TableCell className="text-right">
              <OrgActionsMenu organizationId={o.organizationId} />
            </TableCell>
          </TableRow>
        );
      })}
    </>
  );
}

type OrgSearchResult = {
  organizationId: string;
  name: string | null;
  subscription: { status?: string; plan?: string; stripeSubscriptionId?: string } | null;
};

function OrganizationsTab({ isAdmin }: { isAdmin: boolean }) {
  const [rawQuery, setRawQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(rawQuery.trim()), 350);
    return () => clearTimeout(t);
  }, [rawQuery]);

  const isSearching = searchQuery.length > 0;

  // ---- Paginated list from Clerk (action-based) ----
  const listOrgsFromClerk = useAction(api.public.admin.listOrganizationsFromClerk);
  const [pagedOrgs, setPagedOrgs] = useState<OrgSearchResult[]>([]);
  const [pagedOffset, setPagedOffset] = useState(0);
  const [pagedHasMore, setPagedHasMore] = useState(false);
  const [pagedLoading, setPagedLoading] = useState(false);
  const [pagedFirstLoad, setPagedFirstLoad] = useState(true);

  const loadPage = useCallback(
    async (offset: number, replace: boolean) => {
      if (!isAdmin) return;
      setPagedLoading(true);
      try {
        const res = await listOrgsFromClerk({ offset, limit: PAGE_SIZE });
        setPagedOrgs((prev) =>
          replace ? (res.organizations as OrgSearchResult[]) : [...prev, ...(res.organizations as OrgSearchResult[])],
        );
        setPagedOffset(offset + res.organizations.length);
        setPagedHasMore(res.hasMore);
      } catch {
        toast.error("Could not load organizations.");
      } finally {
        setPagedLoading(false);
        setPagedFirstLoad(false);
      }
    },
    [isAdmin, listOrgsFromClerk],
  );

  // Initial load
  useEffect(() => {
    if (!isAdmin || isSearching) return;
    setPagedOrgs([]);
    setPagedOffset(0);
    setPagedHasMore(false);
    setPagedFirstLoad(true);
    void loadPage(0, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, isSearching]);

  // Derive a status string compatible with useInfiniteScroll
  const orgsScrollStatus: "LoadingFirstPage" | "CanLoadMore" | "LoadingMore" | "Exhausted" =
    pagedFirstLoad
      ? "LoadingFirstPage"
      : pagedLoading
        ? "LoadingMore"
        : pagedHasMore
          ? "CanLoadMore"
          : "Exhausted";

  const { topElementRef: orgsScrollRef, handleLoadMore: handleOrgsLoadMore,
    canLoadMore: orgsCanLoadMore, isLoadingMore: orgsIsLoadingMore,
    isLoadingFirstPage: orgsIsLoadingFirstPage } = useInfiniteScroll({
    status: orgsScrollStatus,
    loadMore: () => void loadPage(pagedOffset, false),
    loadSize: PAGE_SIZE,
    observerEnabled: !isSearching,
  });

  // ---- Search results (action) ----
  const searchOrgs = useAction(api.public.admin.searchOrganizations);
  const [searchResults, setSearchResults] = useState<OrgSearchResult[] | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    if (!isSearching || !isAdmin) { setSearchResults(null); return; }
    setSearchLoading(true);
    let cancelled = false;
    void searchOrgs({ query: searchQuery })
      .then((r) => { if (!cancelled) setSearchResults(r as OrgSearchResult[]); })
      .catch(() => { if (!cancelled) toast.error("Search failed."); if (!cancelled) setSearchResults([]); })
      .finally(() => { if (!cancelled) setSearchLoading(false); });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, isAdmin]);

  // ---- Primary user resolution (both modes, no org-name fetch needed — Clerk gives us names) ----
  const fetchOrgPrimaryUsers = useAction(api.public.admin.fetchOrgPrimaryUsers);
  const [orgUsers, setOrgUsers] = useState<Record<string, OrgUserInfo>>({});

  const resolveUsers = useCallback(
    (ids: string[]) => {
      const unknown = ids.filter((id) => !(id in orgUsers));
      if (!unknown.length) return;
      void fetchOrgPrimaryUsers({ organizationIds: unknown })
        .then((map) => setOrgUsers((prev) => ({ ...prev, ...(map as Record<string, OrgUserInfo>) })))
        .catch(() => { /* non-fatal */ });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [orgUsers],
  );

  useEffect(() => {
    if (pagedOrgs.length) resolveUsers(pagedOrgs.map((o) => o.organizationId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagedOrgs]);

  useEffect(() => {
    if (searchResults?.length) resolveUsers(searchResults.map((o) => o.organizationId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchResults]);

  const tableHeader = (
    <TableHeader>
      <TableRow>
        <TableHead>Organization id</TableHead>
        <TableHead>Name (Clerk)</TableHead>
        <TableHead>User</TableHead>
        <TableHead>Plan</TableHead>
        <TableHead>Status</TableHead>
        <TableHead className="w-[52px] text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );

  return (
    <div>
      <div className={ADMIN_TABLE_SEARCH_ROW}>
        <div className="relative min-w-0 flex-1">
          <SearchIcon className="text-muted-foreground absolute left-3 top-1/2 size-3.5 -translate-y-1/2" />
          <Input
            placeholder="Search by email, name, org name, or org id…"
            value={rawQuery}
            onChange={(e) => setRawQuery(e.target.value)}
            className="h-8 pl-8 pr-8 text-sm"
          />
          {rawQuery && (
            <button
              type="button"
              onClick={() => { setRawQuery(""); setSearchQuery(""); setSearchResults(null); }}
              className="text-muted-foreground hover:text-foreground absolute right-2.5 top-1/2 -translate-y-1/2"
              aria-label="Clear search"
            >
              <XIcon className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {isSearching ? (
        <Table>
          {tableHeader}
          <TableBody>
            {searchLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center">
                  <Loader2Icon className="text-muted-foreground mx-auto size-5 animate-spin" />
                </TableCell>
              </TableRow>
            ) : !searchResults || searchResults.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground">
                  {searchResults === null ? null : `No organizations found for "${searchQuery}".`}
                </TableCell>
              </TableRow>
            ) : (
              <OrgTableRows
                rows={searchResults}
                resolvedNames={Object.fromEntries(
                  searchResults.map((o) => [o.organizationId, o.name]),
                )}
                orgUsers={orgUsers}
              />
            )}
          </TableBody>
        </Table>
      ) : orgsIsLoadingFirstPage ? (
        <div className="flex items-center justify-center gap-2 py-16">
          <Loader2Icon className="text-muted-foreground size-6 animate-spin" />
          <span className="text-muted-foreground text-sm">Loading organizations…</span>
        </div>
      ) : (
        <>
          <Table>
            {tableHeader}
            <TableBody>
              {pagedOrgs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground">
                    No organizations found.
                  </TableCell>
                </TableRow>
              ) : (
                <OrgTableRows
                  rows={pagedOrgs}
                  resolvedNames={Object.fromEntries(pagedOrgs.map((o) => [o.organizationId, o.name]))}
                  orgUsers={orgUsers}
                />
              )}
            </TableBody>
          </Table>
          <InfiniteScrollTrigger
            canLoadMore={orgsCanLoadMore}
            isLoadingMore={orgsIsLoadingMore}
            onLoadMore={handleOrgsLoadMore}
            ref={orgsScrollRef}
          />
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: Subscriptions
// ---------------------------------------------------------------------------
function SubRows({ rows }: { rows: Doc<"subscriptions">[] }) {
  return (
    <>
      {rows.map((s) => (
        <TableRow key={s._id}>
          <TableCell className="font-mono text-xs">{s.organizationId}</TableCell>
          <TableCell><PlanBadge plan={s.plan} /></TableCell>
          <TableCell><SubStatusBadge status={s.status} /></TableCell>
          <TableCell className="whitespace-nowrap text-xs">{formatTs(s.endDate)}</TableCell>
          <TableCell className="max-w-[10rem] truncate font-mono text-xs">
            {s.stripeSubscriptionId ?? "—"}
          </TableCell>
          <TableCell className="text-right">
            <SubscriptionActionsMenu
              organizationId={s.organizationId}
              stripeSubscriptionId={s.stripeSubscriptionId}
            />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

function SubscriptionsTab({ isAdmin }: { isAdmin: boolean }) {
  const [rawQuery, setRawQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<SubscriptionStatusFilter>("all");

  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(rawQuery.trim()), 350);
    return () => clearTimeout(t);
  }, [rawQuery]);

  const isSearching = searchQuery.length > 0;

  const subsPage = usePaginatedQuery(
    api.public.admin.listSubscriptions,
    isAdmin && !isSearching
      ? statusFilter === "all" ? {} : { status: statusFilter }
      : "skip",
    { initialNumItems: PAGE_SIZE },
  );

  const { topElementRef, handleLoadMore, canLoadMore, isLoadingFirstPage, isLoadingMore } =
    useInfiniteScroll({
      status: subsPage.status,
      loadMore: subsPage.loadMore,
      loadSize: PAGE_SIZE,
    });

  const searchSubs = useAction(api.public.admin.searchSubscriptions);
  const [searchResults, setSearchResults] = useState<Doc<"subscriptions">[] | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    if (!isSearching || !isAdmin) { setSearchResults(null); return; }
    setSearchLoading(true);
    let cancelled = false;
    void searchSubs({ query: searchQuery })
      .then((r) => { if (!cancelled) setSearchResults(r as Doc<"subscriptions">[]); })
      .catch(() => { if (!cancelled) toast.error("Search failed."); if (!cancelled) setSearchResults([]); })
      .finally(() => { if (!cancelled) setSearchLoading(false); });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, isAdmin]);

  const tableHeader = (
    <TableHeader>
      <TableRow>
        <TableHead>Org id</TableHead>
        <TableHead>Plan</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Period end</TableHead>
        <TableHead>Stripe sub</TableHead>
        <TableHead className="w-[52px] text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );

  return (
    <div>
      {/* Search + status bar */}
      <div className={ADMIN_TABLE_SEARCH_ROW}>
        <div className="relative min-w-0 flex-1">
          <SearchIcon className="text-muted-foreground absolute left-3 top-1/2 size-3.5 -translate-y-1/2" />
          <Input
            placeholder="Search by email, name, or org id / name…"
            value={rawQuery}
            onChange={(e) => setRawQuery(e.target.value)}
            className="h-8 pl-8 pr-8 text-sm"
          />
          {rawQuery && (
            <button
              type="button"
              onClick={() => { setRawQuery(""); setSearchQuery(""); setSearchResults(null); }}
              className="text-muted-foreground hover:text-foreground absolute right-2.5 top-1/2 -translate-y-1/2"
              aria-label="Clear"
            >
              <XIcon className="size-3.5" />
            </button>
          )}
        </div>
        {!isSearching && (
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as SubscriptionStatusFilter)}>
            <SelectTrigger size="sm" className="w-[160px] shrink-0">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="past_due">Past due</SelectItem>
              <SelectItem value="unpaid">Unpaid</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {isSearching ? (
        <Table>
          {tableHeader}
          <TableBody>
            {searchLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center">
                  <Loader2Icon className="text-muted-foreground mx-auto size-5 animate-spin" />
                </TableCell>
              </TableRow>
            ) : !searchResults || searchResults.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground">
                  {searchResults === null ? null : `No subscriptions found for "${searchQuery}".`}
                </TableCell>
              </TableRow>
            ) : (
              <SubRows rows={searchResults} />
            )}
          </TableBody>
        </Table>
      ) : isLoadingFirstPage ? (
        <div className="flex items-center justify-center gap-2 py-16">
          <Loader2Icon className="text-muted-foreground size-6 animate-spin" />
          <span className="text-muted-foreground text-sm">Loading subscriptions…</span>
        </div>
      ) : (
        <>
          <Table>
            {tableHeader}
            <TableBody>
              {subsPage.results.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground">
                    No subscriptions for this filter.
                  </TableCell>
                </TableRow>
              ) : (
                <SubRows rows={subsPage.results} />
              )}
            </TableBody>
          </Table>
          <InfiniteScrollTrigger
            canLoadMore={canLoadMore}
            isLoadingMore={isLoadingMore}
            onLoadMore={handleLoadMore}
            ref={topElementRef}
          />
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: Transactions
// ---------------------------------------------------------------------------
function TxRows({ rows }: { rows: Doc<"transactions">[] }) {
  return (
    <>
      {rows.map((t) => (
        <TableRow key={t._id}>
          <TableCell className="font-mono text-xs">{t.organizationId}</TableCell>
          <TableCell>{formatStripeMoney(t.amount, t.currency)}</TableCell>
          <TableCell><TxStatusBadge status={t.status} /></TableCell>
          <TableCell className="font-mono text-xs">{t.subscriptionId}</TableCell>
          <TableCell className="text-right">
            <ThreeDotMenu>
              <DropdownMenuItem disabled className="text-muted-foreground text-xs">
                No actions available
              </DropdownMenuItem>
            </ThreeDotMenu>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

function TransactionsTab({ isAdmin }: { isAdmin: boolean }) {
  const [rawQuery, setRawQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TransactionStatusFilter>("all");

  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(rawQuery.trim()), 350);
    return () => clearTimeout(t);
  }, [rawQuery]);

  const isSearching = searchQuery.length > 0;

  const txPage = usePaginatedQuery(
    api.public.admin.listTransactions,
    isAdmin && !isSearching
      ? statusFilter === "all" ? {} : { status: statusFilter }
      : "skip",
    { initialNumItems: PAGE_SIZE },
  );

  const { topElementRef, handleLoadMore, canLoadMore, isLoadingFirstPage, isLoadingMore } =
    useInfiniteScroll({
      status: txPage.status,
      loadMore: txPage.loadMore,
      loadSize: PAGE_SIZE,
    });

  const searchTxs = useAction(api.public.admin.searchTransactions);
  const [searchResults, setSearchResults] = useState<Doc<"transactions">[] | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    if (!isSearching || !isAdmin) { setSearchResults(null); return; }
    setSearchLoading(true);
    let cancelled = false;
    void searchTxs({ query: searchQuery })
      .then((r) => { if (!cancelled) setSearchResults(r as Doc<"transactions">[]); })
      .catch(() => { if (!cancelled) toast.error("Search failed."); if (!cancelled) setSearchResults([]); })
      .finally(() => { if (!cancelled) setSearchLoading(false); });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, isAdmin]);

  const tableHeader = (
    <TableHeader>
      <TableRow>
        <TableHead>Org id</TableHead>
        <TableHead>Amount</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Subscription id</TableHead>
        <TableHead className="w-[52px] text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );

  return (
    <div>
      {/* Search + status bar */}
      <div className={ADMIN_TABLE_SEARCH_ROW}>
        <div className="relative min-w-0 flex-1">
          <SearchIcon className="text-muted-foreground absolute left-3 top-1/2 size-3.5 -translate-y-1/2" />
          <Input
            placeholder="Search by email, name, or org id / name…"
            value={rawQuery}
            onChange={(e) => setRawQuery(e.target.value)}
            className="h-8 pl-8 pr-8 text-sm"
          />
          {rawQuery && (
            <button
              type="button"
              onClick={() => { setRawQuery(""); setSearchQuery(""); setSearchResults(null); }}
              className="text-muted-foreground hover:text-foreground absolute right-2.5 top-1/2 -translate-y-1/2"
              aria-label="Clear"
            >
              <XIcon className="size-3.5" />
            </button>
          )}
        </div>
        {!isSearching && (
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as TransactionStatusFilter)}>
            <SelectTrigger size="sm" className="w-[160px] shrink-0">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="succeeded">Succeeded</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {isSearching ? (
        <Table>
          {tableHeader}
          <TableBody>
            {searchLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center">
                  <Loader2Icon className="text-muted-foreground mx-auto size-5 animate-spin" />
                </TableCell>
              </TableRow>
            ) : !searchResults || searchResults.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground">
                  {searchResults === null ? null : `No transactions found for "${searchQuery}".`}
                </TableCell>
              </TableRow>
            ) : (
              <TxRows rows={searchResults} />
            )}
          </TableBody>
        </Table>
      ) : isLoadingFirstPage ? (
        <div className="flex items-center justify-center gap-2 py-16">
          <Loader2Icon className="text-muted-foreground size-6 animate-spin" />
          <span className="text-muted-foreground text-sm">Loading transactions…</span>
        </div>
      ) : (
        <>
          <Table>
            {tableHeader}
            <TableBody>
              {txPage.results.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground">
                    No transactions for this filter.
                  </TableCell>
                </TableRow>
              ) : (
                <TxRows rows={txPage.results} />
              )}
            </TableBody>
          </Table>
          <InfiniteScrollTrigger
            canLoadMore={canLoadMore}
            isLoadingMore={isLoadingMore}
            onLoadMore={handleLoadMore}
            ref={topElementRef}
          />
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stats cards
// ---------------------------------------------------------------------------

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
      {sub ? (
        <p className="text-muted-foreground mt-0.5 text-xs">{sub}</p>
      ) : null}
    </div>
  );
}

function StatsSection({ isAdmin }: { isAdmin: boolean }) {
  const stats = useQuery(api.public.admin.getStats, isAdmin ? {} : "skip");
  const rebuildStats = useAction(api.public.admin.rebuildStats);
  const [rebuilding, setRebuilding] = useState(false);

  const handleRebuild = async () => {
    setRebuilding(true);
    try {
      await rebuildStats({});
      toast.success("Stats rebuilt from scratch.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Rebuild failed.");
    } finally {
      setRebuilding(false);
    }
  };

  if (!stats) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="h-[84px] animate-pulse rounded-lg border border-border bg-background"
          />
        ))}
      </div>
    );
  }

  const revenue = stats.totalRevenueSmallestUnit / 100;
  const revenueFormatted = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(revenue);

  return (
    <div className="space-y-2">
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      <StatCard label="Users" value={stats.totalUsers} />
      <StatCard label="Organizations" value={stats.totalOrganizations} />
      <StatCard
        label="Subscriptions"
        value={stats.totalSubscriptions}
        sub={`${stats.subscriptionsByStatus.active} active · ${stats.subscriptionsByStatus.cancelled} cancelled`}
      />
      <StatCard
        label="Transactions"
        value={stats.totalTransactions}
        sub={`${stats.transactionsByStatus.succeeded} succeeded · ${stats.transactionsByStatus.failed} failed`}
      />
      <StatCard
        label="Total Revenue"
        value={revenueFormatted}
        sub="Succeeded transactions"
      />
    </div>
    <div className="flex justify-end">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="text-muted-foreground text-xs"
        disabled={rebuilding}
        onClick={() => void handleRebuild()}
      >
        {rebuilding ? (
          <><Loader2Icon className="mr-1.5 size-3 animate-spin" />Rebuilding…</>
        ) : (
          "Rebuild stats"
        )}
      </Button>
    </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main view
// ---------------------------------------------------------------------------
export function AdminView() {
  const me = useQuery(api.users.getMe);
  const isAdmin = me?.role === "admin";

  if (me === undefined) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-muted p-8">
        <Loader2Icon className="text-muted-foreground size-8 animate-spin" />
        <p className="text-muted-foreground text-sm">Loading…</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col bg-muted p-8">
        <div className="mx-auto w-full max-w-lg rounded-lg border border-border bg-background p-8 shadow-sm">
          <h1 className="text-xl font-semibold">Admin</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            You don&apos;t have access to this area. An existing admin can grant
            you access, or add a row to the Convex{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">users</code>{" "}
            table with your Clerk user id in{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">clerkUserId</code>{" "}
            and <code className="rounded bg-muted px-1 py-0.5 text-xs">role</code>{" "}
            set to <code className="rounded bg-muted px-1 py-0.5 text-xs">admin</code>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted p-6 md:p-8">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Admin</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Users, organizations, subscriptions, and transactions.
          </p>
        </div>

        <StatsSection isAdmin={isAdmin} />

        <Tabs defaultValue="users" className="gap-4">
          <TabsList variant="line" className="w-full flex-wrap justify-start">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="organizations">Organizations</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-0">
            <div className="rounded-lg border border-border bg-background">
              <UsersTab isAdmin={isAdmin} />
            </div>
          </TabsContent>

          <TabsContent value="organizations" className="mt-0">
            <div className="rounded-lg border border-border bg-background">
              <OrganizationsTab isAdmin={isAdmin} />
            </div>
          </TabsContent>

          <TabsContent value="subscriptions" className="mt-0">
            <div className="rounded-lg border border-border bg-background">
              <SubscriptionsTab isAdmin={isAdmin} />
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="mt-0">
            <div className="rounded-lg border border-border bg-background">
              <TransactionsTab isAdmin={isAdmin} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
