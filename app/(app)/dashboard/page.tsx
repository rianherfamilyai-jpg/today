import { redirect } from "next/navigation";

import { hasFeature } from "@/lib/entitlements";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const plan = profile?.plan ?? "free";

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-16">
      <h1 className="text-2xl font-semibold">
        Welcome{user.email ? `, ${user.email}` : ""}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Plan: <span className="font-medium text-foreground">{plan}</span>
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        CSV import: {hasFeature({ plan }, "csv_import") ? "enabled" : "locked"}
      </p>
      <p className="mt-8 text-sm text-muted-foreground">
        This is the authed surface. Build the first feature slice here (start from
        a one-page spec in <code className="mx-1">docs/specs/</code>).
      </p>
    </div>
  );
}
