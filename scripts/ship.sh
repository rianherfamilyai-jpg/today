#!/usr/bin/env bash
# ship — the agent's "this slice is done" path, end to end and hands-free:
#   local no-mistakes gate → push → open PR → arm FULL auto-merge.
# Once CI's aggregate `ci` check is green (quality · db-migrations · e2e ·
# security all pass), GitHub squash-merges the PR to the default branch and
# deletes the branch. No human merge step.
#
# Guardrail: a branch that touches supabase/migrations/ is NOT auto-merged —
# schema still gets a human's eyes (see the serialized-schema rule in CLAUDE.md).
# Delete the step-3 block if you truly want schema auto-merged too.
#
# Usage:
#   scripts/ship.sh     # title/body filled from the commits
#   npm run ship
set -euo pipefail

BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
  echo "ship: refusing to ship from '$BRANCH' — work on a slice branch." >&2
  exit 1
fi

# 1. Local gate + push. The no-mistakes remote runs lint/type/test/build/secrets
#    against the exact commit; a failure aborts the push right here.
git push no-mistakes "$BRANCH"

# 2. Open a PR if one isn't already open for this branch.
if ! gh pr view "$BRANCH" >/dev/null 2>&1; then
  gh pr create --fill --head "$BRANCH" --base main
fi
PR_URL="$(gh pr view "$BRANCH" --json url --jq .url)"

# 3. Schema guardrail: never auto-merge a migration change.
git fetch -q origin main 2>/dev/null || true
if git diff --name-only "origin/main...HEAD" 2>/dev/null | grep -q '^supabase/migrations/'; then
  echo "ship: '$BRANCH' changes supabase/migrations/ — auto-merge left OFF (schema needs human review)."
  echo "ship: PR is open and gated on 'ci'. Review the migration and merge it yourself:"
  echo "ship: $PR_URL"
  exit 0
fi

# 4. Arm full auto-merge: GitHub squash-merges when the required `ci` check is green.
gh pr merge "$BRANCH" --auto --squash --delete-branch
echo "ship: auto-merge armed for '$BRANCH'. GitHub merges to main when 'ci' is green:"
echo "ship: $PR_URL"
