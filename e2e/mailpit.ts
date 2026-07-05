// Helper for the authed E2E: pull the magic-link email out of the local Supabase
// mail catcher (Mailpit, exposed at :54324) and hand back the confirmation URL.
// This lets the test exercise the *real* passwordless sign-in end to end.

const MAILPIT_URL = process.env.MAILPIT_URL ?? "http://127.0.0.1:54324";

type MailpitSummary = {
  ID: string;
  To?: { Address: string }[];
  Created?: string;
};

type MailpitList = { messages?: MailpitSummary[] };
type MailpitMessage = { Text?: string; HTML?: string };

function decodeEntities(s: string): string {
  return s.replace(/&amp;/g, "&").replace(/&#38;/g, "&");
}

function extractLink(text: string): string | null {
  const urls = text.match(/https?:\/\/[^\s"'<>]+/g);
  if (!urls) return null;
  return (
    urls.find((u) => u.includes("/auth/v1/verify")) ??
    urls.find((u) => u.includes("token")) ??
    null
  );
}

/** Poll Mailpit until the sign-in email for `email` arrives; return its link. */
export async function getMagicLink(email: string, timeoutMs = 20_000): Promise<string> {
  const target = email.toLowerCase();
  const deadline = Date.now() + timeoutMs;
  let lastError = "no email yet";

  while (Date.now() < deadline) {
    try {
      const listRes = await fetch(`${MAILPIT_URL}/api/v1/messages?limit=50`);
      if (listRes.ok) {
        const list = (await listRes.json()) as MailpitList;
        const summary = list.messages?.find((m) =>
          m.To?.some((t) => t.Address.toLowerCase() === target)
        );
        if (summary) {
          const msgRes = await fetch(`${MAILPIT_URL}/api/v1/message/${summary.ID}`);
          if (msgRes.ok) {
            const body = (await msgRes.json()) as MailpitMessage;
            const link =
              extractLink(body.Text ?? "") ??
              extractLink(decodeEntities(body.HTML ?? ""));
            if (link) return link;
            lastError = "email found but no link inside";
          }
        }
      } else {
        lastError = `mailpit list ${listRes.status}`;
      }
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
    }
    await new Promise((r) => setTimeout(r, 500));
  }

  throw new Error(`No magic link for ${email} within ${timeoutMs}ms (${lastError})`);
}
