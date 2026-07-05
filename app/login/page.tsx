"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setStatus(error ? "error" : "sent");
  }

  async function signInWithGoogle() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-6 py-16">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="text-sm text-muted-foreground">
          Magic link or Google. No passwords.
        </p>
      </div>
      <form onSubmit={sendMagicLink} className="space-y-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        />
        <Button type="submit" className="w-full" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Send magic link"}
        </Button>
      </form>
      {status === "sent" && (
        <p className="text-sm text-muted-foreground">
          Check your inbox for the sign-in link.
        </p>
      )}
      {status === "error" && (
        <p className="text-sm text-destructive">Something went wrong. Try again.</p>
      )}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" /> or
        <span className="h-px flex-1 bg-border" />
      </div>
      <Button variant="outline" className="w-full" onClick={signInWithGoogle}>
        Continue with Google
      </Button>
    </div>
  );
}
