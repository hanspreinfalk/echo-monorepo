# Echo monorepo

pnpm + Turborepo monorepo for a customer-support product: an operator **dashboard** (`web`), an embeddable **chat widget** (`widget`), small **Vite bundles** that inject that widget into third-party sites (`embed`, `demo`), and a **Convex** backend (`packages/backend`).

## Requirements

- **Node.js** 20+
- **pnpm** 9 (`packageManager` is pinned in the root `package.json`)

## Install

From the repository root:

```bash
pnpm install
```

## Repository layout

| Path | Role |
|------|------|
| `apps/web` | Next.js **dashboard** for organizations: conversations, admin, billing hooks, Clerk auth, Convex + PostHog. Default dev port **3000**. |
| `apps/widget` | Next.js **chat UI** loaded inside an iframe. The embed script points visitors here. Default dev port **3001**. |
| `apps/embed` | Vite **library build** (`embed.ts` → IIFE `widget.js`) you ship to customers. Dev server port **3002**. |
| `apps/demo` | Same idea as `embed`, separate entry for internal/demo pages; dev server port **3003**. |
| `packages/backend` | **Convex** project: database, queries/mutations, HTTP routes (`/embed/...`, Stripe webhook), AI agent (`@convex-dev/agent`), RAG (`@convex-dev/rag`). |
| `packages/ui` | Shared **React** components and styles (Tailwind, shadcn-style exports). Consumed by `web` and `widget`. |
| `packages/eslint-config` / `packages/typescript-config` | Shared **ESLint** and **TypeScript** presets. |

## How the pieces connect

1. **Dashboard (`web`)** — Operators sign in with **Clerk**. The app uses **Convex** (`ConvexProviderWithClerk`) for data and real-time updates. Some routes call Next.js API routes (for example GitHub-related flows) that need the same Convex deployment URL.

2. **Widget (`widget`)** — A minimal Next app that only needs a Convex **client** URL. It renders the chat experience inside an iframe so it is isolated from the host page’s CSS and JS.

3. **Embed / demo scripts** — Built with Vite as a single IIFE. On the host page they create the launcher UI, open an iframe to `WIDGET_URL`, and pass context via `postMessage`. They call **`CONVEX_SITE_URL`** over HTTP for:
   - widget appearance (`/embed/widget-appearance`),
   - OpenAI-compatible chat proxy (`/embed/openai/v1/...`) used by the embedding flow.

4. **Convex (`packages/backend`)** — Single deployment backing both the dashboard/widget (Convex **`.cloud`** URL — WebSocket client) and embed HTTP features (Convex **`.site`** URL). Auth for Convex uses Clerk JWTs (`auth.config.ts`). Optional **Stripe** and **OpenAI** keys power billing and models.

### Convex URLs (important)

- **`NEXT_PUBLIC_CONVEX_URL`** (used in Next apps) — Deployment URL ending in **`.convex.cloud`**. This is what `ConvexReactClient` uses.
- **`VITE_CONVEX_SITE_URL`** (used when building `embed` / `demo`) — HTTP/Site URL ending in **`.convex.site`**. Same deployment, different hostname for HTTP routes defined in `convex/http.ts`.

Use the values from your Convex dashboard for the same deployment so both match.

## Scripts (root)

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Runs all `dev` tasks via Turborepo (all apps that define `dev`). |
| `pnpm build` | Builds packages and apps in dependency order. |
| `pnpm lint` / `pnpm format` / `pnpm typecheck` | Repo-wide checks. |
| `pnpm deploy` | Deploys Convex (`pnpm --filter @workspace/backend run deploy`). |

Run one app from the root with pnpm filters, for example:

```bash
pnpm --filter web dev
pnpm --filter widget dev
pnpm --filter @workspace/backend dev
pnpm --filter embed dev
pnpm --filter demo dev
```

## Environment variables

Examples for local development are in:

- `apps/demo/.env.example`
- `apps/embed/.env.example`
- `apps/widget/.env.example`
- `packages/backend/.env.example`

Copy to `.env` or `.env.local` as appropriate for each tool (Vite loads `.env`; Next.js prefers `.env.local`). **Convex** secrets for deployed environments are set in the [Convex dashboard](https://dashboard.convex.dev) under your project’s environment variables; `convex dev` syncs a local deployment and can write deployment metadata to `.env.local` under `packages/backend`.

### Dashboard (`web`, not duplicated as `.env.example` here)

Typical variables include `NEXT_PUBLIC_CONVEX_URL`, Clerk’s `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY`, and optional PostHog `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` / `NEXT_PUBLIC_POSTHOG_HOST`. `NEXT_PUBLIC_CONVEX_URL` is required at runtime (see `apps/web/components/providers.tsx`).

## Adding UI components

This repo extends the shadcn-style workflow through `packages/ui`. To add a component from the CLI targeting the web app:

```bash
pnpm dlx shadcn@latest add button -c apps/web
```

Import from the workspace package:

```tsx
import { Button } from "@workspace/ui/components/button";
```

## Further reading

- Convex functions overview: `packages/backend/convex/README.md`
- Turborepo: [turbo.build](https://turbo.build/repo/docs)
