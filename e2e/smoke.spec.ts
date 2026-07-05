import { expect, test } from "@playwright/test";

test("landing renders the beta hero and CTA", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /track expenses/i })
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /request an invite/i })
  ).toBeVisible();
});

test("privacy and terms pages are live", async ({ page }) => {
  await page.goto("/privacy");
  await expect(
    page.getByRole("heading", { name: /privacy policy/i })
  ).toBeVisible();

  await page.goto("/terms");
  await expect(
    page.getByRole("heading", { name: /terms of service/i })
  ).toBeVisible();
});

test("login offers magic link and Google", async ({ page }) => {
  await page.goto("/login");
  await expect(
    page.getByRole("button", { name: /send magic link/i })
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /continue with google/i })
  ).toBeVisible();
});
