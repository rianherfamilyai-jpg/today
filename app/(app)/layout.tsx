import { redirect } from "next/navigation";

import { AppNav } from "@/components/app-nav";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="flex min-h-full flex-col">
      <AppNav email={user.email ?? ""} />
      <main className="mx-auto w-full max-w-xl flex-1 px-5 py-8">{children}</main>
    </div>
  );
}
