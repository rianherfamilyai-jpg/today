// The single seam where "what can this user do" is decided.
// Monetizing later = a Stripe webhook flips `profiles.plan`; nothing else changes.
// Never scatter `plan === "..."` checks around the app — always call hasFeature().

export type Plan = "beta" | "free" | "pro";

export type Feature = "csv_import" | "unlimited_expenses" | "monthly_reports";

const FEATURES_BY_PLAN: Record<Plan, Feature[]> = {
  beta: ["csv_import", "unlimited_expenses", "monthly_reports"],
  free: [],
  pro: ["csv_import", "unlimited_expenses", "monthly_reports"],
};

function normalizePlan(plan: string | null | undefined): Plan {
  if (plan === "beta" || plan === "pro" || plan === "free") return plan;
  return "free"; // least privilege for unknown/missing plans
}

type Subject = Plan | { plan?: string | null } | null | undefined;

export function hasFeature(subject: Subject, feature: Feature): boolean {
  const plan = normalizePlan(typeof subject === "string" ? subject : subject?.plan);
  return FEATURES_BY_PLAN[plan].includes(feature);
}
