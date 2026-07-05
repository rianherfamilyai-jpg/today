"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { signOut } from "@/app/(app)/actions";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/today", label: "Today" },
  { href: "/someday", label: "Someday" },
  { href: "/settings", label: "Settings" },
];

export function AppNav({ email }: { email: string }) {
  const pathname = usePathname();

  return (
    <header className="border-b">
      <nav className="mx-auto flex w-full max-w-xl items-center justify-between px-5 py-3">
        <div className="flex items-center gap-1">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-secondary font-medium text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
        <form action={signOut}>
          <button
            type="submit"
            title={email}
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Sign out
          </button>
        </form>
      </nav>
    </header>
  );
}
