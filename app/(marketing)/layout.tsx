import Link from "next/link";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="font-semibold">
            Product
          </Link>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms
            </Link>
            <Link href="/login" className="hover:text-foreground">
              Sign in
            </Link>
          </div>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-16">{children}</main>
      <footer className="border-t">
        <div className="mx-auto max-w-5xl px-6 py-8 text-sm text-muted-foreground">
          © {new Date().getFullYear()} Product. A free beta.
        </div>
      </footer>
    </div>
  );
}
