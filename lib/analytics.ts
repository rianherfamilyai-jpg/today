import posthog from "posthog-js";

// The activation funnel for the beta. Fire these where the events happen.
export const ACTIVATION = {
  SIGNED_UP: "signed_up",
  FIRST_EXPENSE_LOGGED: "first_expense_logged",
  RETURN_VISIT: "return_visit",
} as const;

export function track(event: string, properties?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
  posthog.capture(event, properties);
}
