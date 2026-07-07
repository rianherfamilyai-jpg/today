#!/usr/bin/env bash
# One-time wiring for the no-mistakes gate. Idempotent; safe to re-run.
# Runs automatically on `npm install` via the package.json "prepare" script,
# so a fresh clone is gated without any manual step.
set -e

# Only meaningful inside a git checkout (skip silently when installed as a dep).
git rev-parse --show-toplevel >/dev/null 2>&1 || exit 0

# Point git at our committed hooks so .githooks/pre-push is active.
git config core.hooksPath .githooks

# Add a `no-mistakes` remote mirroring origin, so `git push no-mistakes`
# triggers the local gate (see .githooks/pre-push).
if origin_url="$(git remote get-url origin 2>/dev/null)"; then
  if ! git remote get-url no-mistakes >/dev/null 2>&1; then
    git remote add no-mistakes "$origin_url"
    echo "setup-hooks: added 'no-mistakes' remote -> $origin_url"
  fi
fi

echo "setup-hooks: core.hooksPath -> .githooks (no-mistakes gate active)"
