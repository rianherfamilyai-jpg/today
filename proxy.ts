import { type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

// Next.js 16 renamed the `middleware` convention to `proxy`. The exported
// function must be named `proxy` (or be the default export); the `config.matcher`
// below still controls which requests it runs for. Keep this thin — the real
// work (session refresh + auth guard) lives in lib/supabase/middleware.ts.
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
