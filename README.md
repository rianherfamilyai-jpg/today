# today

Next.js (App Router) + TypeScript · Tailwind v4 + shadcn/ui · Supabase (Postgres + Auth + RLS) · Vitest + Playwright · Sentry + PostHog · deployed on Vercel.

Scaffolded from the `ai-code` golden-path template. Agents: read [`CLAUDE.md`](./CLAUDE.md) first.

## Quick start

```bash
npm install
cp .env.example .env.local        # fill in Supabase + PostHog values
npm run db:start                  # local Supabase (requires Docker running)
npm run db:reset                  # apply migrations + seed
npm run db:types                  # generate typed DB client
npm run dev                       # http://localhost:3000
```

## Layout

```
app/(marketing)/   landing, /privacy, /terms   — public, live day one
app/(app)/         authed product surface
app/login/         magic-link + Google OAuth
lib/supabase/      typed server + browser clients
lib/entitlements   hasFeature(user, feature) — the future payments seam
lib/analytics      PostHog wrapper
supabase/          SQL migrations (committed) + seed.sql
e2e/               Playwright (required CI check)
tests/             Vitest unit tests
```

## Definition of done
clone → `npm run dev` works → CI green → a PR produces a Vercel preview URL → Playwright passes → landing + privacy + terms render.
