// Observability seam (Next.js `register` hook).
// To wire Sentry: run `npx @sentry/wizard@latest -i nextjs`, which replaces this
// file and adds sentry.*.config.ts. Until then this is an intentional no-op so
// the app builds and runs without a Sentry DSN. See docs/ONBOARDING.md.
export async function register() {
  // no-op
}
