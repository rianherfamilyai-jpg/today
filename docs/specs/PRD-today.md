# PRD: Today — a to-do list that stays short

**Status:** draft (awaiting sign-off) · **Owner:** Rianto · **Date:** 2026-07-05

## User story
As someone who abandons every to-do app once the list balloons, I want a list that
keeps **Today** short and pushes everything else out of sight, so that opening the app
feels calm and I actually finish what I set out to do.

## Why now
Every mainstream to-do app fails the same way: tasks pile up faster than they get done,
the list becomes a wall of guilt, and people quit. The research on *why* (paralysis from
long lists, unfinished-task nagging, "overdue" used as a scoreboard) points to one fix
that consistently works — **constraint**: a small, visible Today, with everything else in
a quiet backlog. This is our first product and the sharpest wedge.

## In scope — Slice 1 (the core loop, no AI yet)
- **Auth** — magic-link + Google (already in the template).
- **Two buckets: `Today` and `Someday`.** Someday is one tap away and never shown by
  default — the app opens on a short Today.
- **Fast capture** — one input, Enter to add. Natural-language dates parsed **locally**
  ("tomorrow", "fri 3pm") — instant, private, free (no AI, no network).
- **One method to start — "Today-only focus":** a soft cap on Today (default **6**, from
  the Ivy Lee method). Adding past the cap *nudges* (doesn't block) and the item lands in
  Someday instead.
- **Complete / move** — check a task off, or move it Today ↔ Someday. Completing is quiet
  and satisfying (no confetti spam).
- **Gentle end-of-day rollover** — unfinished Today items are **not** flagged "overdue."
  They quietly stay in Today or drop to Someday. No red counters, no guilt.
- **Small polish** — works on a phone, feels calm. This is a small private beta
  (me + a few friends), so real sign-in and a shareable URL matter.

## Out of scope (explicitly)
- **AI — deferred to Slice 3.** No LLM in the first slice. The local loop must feel great
  on its own before any AI touches it.
- **The other methods** — the Settings **method picker is Slice 2**. Slice 1 ships only
  "Today-only focus" so we prove the core. (Slice 2 adds strict Ivy Lee 6, 1-3-5, and
  time-boxed.)
- Sharing/collaboration, projects/tags/sub-tasks, recurring tasks, push reminders, a
  native mobile app, payments.

## Success check
E2E (the check with teeth): a user signs in → adds "buy milk tomorrow" → it parses to a
dated task; adds 7 items to Today → the 7th nudges toward Someday (cap = 6); checks a task
off → it leaves Today; simulates the next day → an unfinished task is still present and
**not** flagged overdue. PostHog `task_captured` and `task_completed` fire.

## Notes / open questions
- **Working name:** "Today" (repo `today`). OK, or prefer another?
- **AI-forward vs. privacy — resolved via bring-your-own-model.** You chose *AI-forward*,
  but the only **free** OpenRouter models log/train on prompts, which is unacceptable for
  personal task text. Fix: in **Settings the user supplies their own AI key and picks
  their own model** (OpenRouter, or any OpenAI-compatible endpoint — base URL + API key +
  model ID). AI is **off until a key is set** (naturally opt-in); because the user owns
  the key they control cost *and* privacy — no shared free-tier logging problem. Slices
  1–2 ship **zero AI**; Slice 3 wires this settings panel with PII-stripped, async prompts
  (never in the typing path). We suggest `gpt-oss-120b:free` as a default, but the user
  decides.
- **Data model (Slice 1, one migration):** `tasks` table — RLS on, owner-scoped;
  `bucket` enum(`today`|`someday`); `due_at` nullable; `completed_at` nullable; `sort`.
- **Rollover mechanics:** run on first load of a new local day; the exact "return vs.
  drop to Someday" rule is the one behavioural detail to tune during the build.
