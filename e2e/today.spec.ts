import { expect, test, type Page } from "@playwright/test";

import { getMagicLink } from "./mailpit";

// The authed happy path. It needs the local Supabase stack running (Postgres +
// Auth + Mailpit), so it's opt-in via E2E_DB=1 — the plain smoke suite still
// runs anywhere. CI sets E2E_DB and boots `supabase start` before this.

/**
 * Type a capture and wait for the server action to actually commit. The soft
 * cap is decided server-side from the live row count, so each add must finish
 * (row inserted) before the next one — otherwise the count races. A Next server
 * action is a POST carrying the `next-action` header; its response resolves only
 * after the insert has committed.
 */
async function capture(page: Page, raw: string) {
  const input = page.getByLabel("Add a task to Today");
  await input.fill(raw);
  const committed = page.waitForResponse(
    (r) => Boolean(r.request().headers()["next-action"]) && r.status() === 200,
    { timeout: 15_000 }
  );
  await input.press("Enter");
  await committed;
}

test("sign in, capture, cap nudge, complete — never overdue", async ({ page }) => {
  test.skip(
    !process.env.E2E_DB,
    "needs local Supabase + Mailpit (set E2E_DB=1 and run `supabase start`)"
  );
  test.setTimeout(120_000);

  // Fresh user each run: local Supabase auto-creates + confirms it.
  const email = `today-e2e-${Date.now()}@example.com`;

  // 1. Request the magic link — this stores the PKCE verifier in this context.
  await page.goto("/login");
  await page.getByPlaceholder("you@example.com").fill(email);
  await page.getByRole("button", { name: /send magic link/i }).click();
  await expect(page.getByText(/check your inbox/i)).toBeVisible();

  // 2. Pull the link out of Mailpit and finish sign-in in the SAME context so
  //    the verifier cookie is present for the code exchange.
  const link = await getMagicLink(email);
  await page.goto(link);

  // 3. We land on Today.
  await expect(page.getByRole("heading", { name: "Today", exact: true })).toBeVisible();

  // 4. Plain-words capture parses a date locally: "tomorrow" → a Tomorrow chip.
  await capture(page, "buy milk tomorrow");
  const milkRow = page.getByRole("listitem").filter({ hasText: "buy milk" });
  await expect(milkRow).toBeVisible();
  await expect(milkRow.getByText("Tomorrow", { exact: true })).toBeVisible();

  // 5. Fill Today to the cap of 6 (buy milk + five more).
  await capture(page, "Prep the deck");
  await capture(page, "Reply to Sam");
  await capture(page, "Book the venue");
  await capture(page, "Review the draft");
  await capture(page, "Water the plants");
  await expect(page.locator('[aria-label="6 of 6 today"]')).toBeVisible();

  // 6. The 7th is gently parked in Someday, with a calm heads-up.
  await capture(page, "Sort the archive");
  await expect(page.getByRole("status")).toContainText(/parked that in Someday/i);
  await expect(
    page.getByRole("listitem").filter({ hasText: "Sort the archive" })
  ).toHaveCount(0);
  // Today is still exactly full — the overflow didn't push it past 6.
  await expect(page.locator('[aria-label="6 of 6 today"]')).toBeVisible();

  // 7. The overflow really is waiting in Someday.
  await page.goto("/someday");
  await expect(page.getByRole("heading", { name: "Someday", exact: true })).toBeVisible();
  await expect(
    page.getByRole("listitem").filter({ hasText: "Sort the archive" })
  ).toBeVisible();

  // 8. Completing a task frees a slot: the meter drops 6 → 5.
  await page.goto("/today");
  await expect(page.locator('[aria-label="6 of 6 today"]')).toBeVisible();
  await page.getByRole("button", { name: 'Complete "buy milk"' }).click();
  await expect(page.locator('[aria-label="5 of 6 today"]')).toBeVisible();

  // 9. The whole point: nothing is ever guilt-tripped as "overdue".
  await expect(page.getByText(/overdue/i)).toHaveCount(0);
  await page.goto("/someday");
  await expect(page.getByText(/overdue/i)).toHaveCount(0);
});
