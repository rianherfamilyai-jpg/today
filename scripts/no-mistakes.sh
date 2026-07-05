#!/usr/bin/env bash
# no-mistakes — the LOCAL half of the two-sided quality gate.
#
# Runs CI's *fast* checks (lint · typecheck · unit tests · build · secret scan)
# against the EXACT commit you are about to push. Green here predicts green on
# the CI `quality` (and gitleaks `security`) jobs — you find out in seconds on
# your machine instead of minutes later in the cloud.
#
# The heavy, service-dependent CI jobs (Supabase `e2e` + `db-migrations`) are
# deliberately NOT run here: they need Docker/Postgres and stay server-side.
#
# Two paths, chosen automatically:
#   * in place — when your working tree is clean and already sits on the commit
#                being gated, checks run in the checkout (reuses node_modules).
#   * isolated — otherwise (dirty tree, or gating an older commit) the commit
#                is checked out into a throwaway worktree with a clean `npm ci`,
#                so uncommitted edits can never mask a failure.
#
# Usage:
#   scripts/no-mistakes.sh [<commit-ish>]   # gate a commit (default HEAD)
#   npm run no-mistakes                      # same, via package.json
# Also invoked automatically by .githooks/pre-push on `git push no-mistakes`.

set -euo pipefail

REF="${1:-HEAD}"
REPO_ROOT="$(git rev-parse --show-toplevel)"
SHA="$(git -C "$REPO_ROOT" rev-parse --verify "${REF}^{commit}")"
HEAD_SHA="$(git -C "$REPO_ROOT" rev-parse --verify HEAD)"
SHORT_SHA="$(git -C "$REPO_ROOT" rev-parse --short "$SHA")"
BRANCH="$(git -C "$REPO_ROOT" rev-parse --abbrev-ref HEAD)"

# --- Never gate (or push) main/master. -----------------------------------
if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
  echo "no-mistakes: refusing to run on '$BRANCH' — work on a slice branch, never main." >&2
  exit 1
fi

# --- Pick in-place (fast) vs isolated worktree (exact). ------------------
if [ "$SHA" = "$HEAD_SHA" ] && [ -z "$(git -C "$REPO_ROOT" status --porcelain)" ]; then
  RUN_DIR="$REPO_ROOT"
  echo "no-mistakes: gating ${SHORT_SHA} (${BRANCH}) — clean tree, checking in place"
else
  WORKTREE="$(mktemp -d "${TMPDIR:-/tmp}/no-mistakes.XXXXXX")"
  cleanup() {
    git -C "$REPO_ROOT" worktree remove --force "$WORKTREE" >/dev/null 2>&1 || true
    rm -rf "$WORKTREE" >/dev/null 2>&1 || true
  }
  trap cleanup EXIT
  echo "no-mistakes: gating ${SHORT_SHA} (${BRANCH}) — isolating in a worktree (clean install)"
  git -C "$REPO_ROOT" worktree add --quiet --detach "$WORKTREE" "$SHA"
  RUN_DIR="$WORKTREE"
  ( cd "$WORKTREE" && npm ci )
fi

cd "$RUN_DIR"

# --- The gate: mirror CI's `quality` job, in the same order. -------------
export NEXT_TELEMETRY_DISABLED=1
echo "no-mistakes: [1/4] lint";      npm run lint
echo "no-mistakes: [2/4] typecheck"; npm run typecheck
echo "no-mistakes: [3/4] test";      npm run test
echo "no-mistakes: [4/4] build";     npm run build

# --- Secret scan (CI `security` job, gitleaks half). ---------------------
if command -v gitleaks >/dev/null 2>&1; then
  echo "no-mistakes: secret scan (gitleaks)"
  gitleaks detect --source "$REPO_ROOT" --redact --no-banner
else
  echo "no-mistakes: gitleaks not installed — skipping local secret scan" >&2
  echo "no-mistakes: (CI still enforces it; install locally with: brew install gitleaks)" >&2
fi

echo "no-mistakes: all checks passed for ${SHORT_SHA} — safe to push."
