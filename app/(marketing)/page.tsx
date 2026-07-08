import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <section className="flex flex-col items-start gap-6">
      <span className="rounded-full border px-3 py-1 text-xs text-muted-foreground">
        Free beta
      </span>
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
        A to-do list that stays short.
      </h1>
      <p className="max-w-xl text-lg text-muted-foreground">
        Today keeps today small and lets everything else wait in Someday. No
        endless backlog, no red “overdue”, no guilt — just the few things that
        actually matter now.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button asChild size="lg">
          <Link href="/login">Start today</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/privacy">How we handle your data</Link>
        </Button>
      </div>
    </section>
  );
}
