import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <section className="flex flex-col items-start gap-6">
      <span className="rounded-full border px-3 py-1 text-xs text-muted-foreground">
        Free beta
      </span>
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
        Track expenses without the busywork.
      </h1>
      <p className="max-w-xl text-lg text-muted-foreground">
        A calm, private expense tracker. Manual entry and CSV import — no bank
        logins, no ads. Your data stays yours.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button asChild size="lg">
          <Link href="/login">Request an invite</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/privacy">How we handle your data</Link>
        </Button>
      </div>
    </section>
  );
}
