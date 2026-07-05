export const metadata = { title: "Terms of Service" };

// TEMPLATE PLACEHOLDER — have the owner review/replace before real users sign up.
export default function TermsPage() {
  return (
    <article className="prose prose-neutral max-w-2xl dark:prose-invert">
      <h1 className="text-3xl font-semibold">Terms of Service</h1>
      <p className="mt-4 text-muted-foreground">
        This is a free beta provided as-is. It is a personal budgeting aid, not
        financial advice. Do not rely on it as your system of record.
      </p>
      <h2 className="mt-8 text-xl font-semibold">Acceptable use</h2>
      <p className="mt-2 text-muted-foreground">
        Use the service for your own personal expense tracking. Do not attempt to
        access other users&apos; data or disrupt the service.
      </p>
      <h2 className="mt-8 text-xl font-semibold">Availability</h2>
      <p className="mt-2 text-muted-foreground">
        Because this is a beta, features may change and downtime may occur. We
        will give notice before deleting the beta if it ends.
      </p>
      <p className="mt-8 text-sm text-muted-foreground">
        Placeholder copy — replace with reviewed legal text before launch.
      </p>
    </article>
  );
}
