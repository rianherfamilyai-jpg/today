import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/today";

  // `next start` reports request.url with a localhost host, so redirecting to
  // that origin would flip the host mid-flow (e.g. 127.0.0.1 → localhost) and
  // drop the auth cookie we just set. Honour the real Host — and Vercel's
  // forwarded headers in production — so we return to the exact origin the
  // browser (and its cookies) live on.
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") ?? url.protocol.replace(/:$/, "");
  const base = host ? `${proto}://${host}` : url.origin;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${base}${next}`);
    }
  }

  return NextResponse.redirect(`${base}/login?error=auth`);
}
