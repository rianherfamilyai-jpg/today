export const metadata = { title: "Privacy Policy" };

// TEMPLATE PLACEHOLDER — have the owner review/replace before real users sign up.
export default function PrivacyPage() {
  return (
    <article className="prose prose-neutral max-w-2xl dark:prose-invert">
      <h1 className="text-3xl font-semibold">Privacy Policy</h1>
      <p className="mt-4 text-muted-foreground">
        We collect the account email you sign in with and the expense data you
        enter. We do not sell your data or connect to your bank.
      </p>
      <h2 className="mt-8 text-xl font-semibold">Data deletion</h2>
      <p className="mt-2 text-muted-foreground">
        You can delete your account and all associated data at any time from
        settings, or by emailing support. Deletion removes your profile and every
        row you created within 30 days.
      </p>
      <h2 className="mt-8 text-xl font-semibold">Analytics &amp; errors</h2>
      <p className="mt-2 text-muted-foreground">
        We use privacy-friendly product analytics and error monitoring to keep the
        beta working. These never receive your expense contents.
      </p>
      <p className="mt-8 text-sm text-muted-foreground">
        Placeholder copy — replace with reviewed legal text before launch.
      </p>
    </article>
  );
}
