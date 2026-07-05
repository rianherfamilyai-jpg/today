# CLAUDE.md — product golden-path

You are working in a product repo cloned from the `ai-code` golden-path template.
Read this before touching anything.

## Stack (decided — do not swap without a PRD)
- **Next.js (App Router) + TypeScript** — `app/` is the surface. Server Components by default; add `"use client"` only when you need interactivity.
- **Tailwind v4 + shadcn/ui** — compose UI from `components/ui/*`. Add parts with `npx shadcn@latest add <name>`. Do not hand-roll bespoke CSS; use design tokens in `app/globals.css`.
- **Supabase** — Postgres + Auth + RLS + Storage. Server client in `lib/supabase/server.ts`, browser client in `lib/supabase/client.ts`. Types are generated: `npm run db:types`.
- **Vitest** (unit, `tests/`) + **Playwright** (E2E, `e2e/` — this is the check with teeth).

## Commands
- `npm run dev` — local dev (needs `npm run db:start`, which needs Docker running).
- `npm run db:start` / `npm run db:reset` — local Supabase; reset re-runs every migration + `seed.sql`.
- `npm run db:types` — regenerate `lib/supabase/database.types.ts` after any schema change.
- `npm run typecheck` · `npm run lint` · `npm run test` · `npm run test:e2e`.

## Non-negotiable rules
1. **Never read, write, or print `.env*`.** Sandbox/dev keys only for agents; production secrets live solely in Vercel env vars. `.claude/settings.json` denies reading env files — do not weaken it.
2. **Never push to `main`.** Ship on a branch, open a PR, let CI + the human gate merge. Locally, use `git push no-mistakes`.
3. **Serialize schema changes.** Only ever one task touching `supabase/migrations/` in flight. Schema changes get reviewed line by line. Never edit a migration that has already been applied/committed — add a new one.
4. **RLS on every table.** New tables must enable Row-Level Security and add policies. Financial data is the default threat model here.
5. **Entitlements go through `hasFeature(user, feature)`** (`lib/entitlements.ts`). This is the seam where payments plug in later — do not scatter `plan ===` checks.
6. **Batch dependency changes.** Don't let unrelated tasks each touch `package-lock.json`; leave routine bumps to Renovate.

## Definition of done for a feature
PRD in `docs/specs/` → thin slice on a branch → `npm run test` + `npm run test:e2e` green → Vercel preview clicked through → PR gated (CI green) → human merges.
