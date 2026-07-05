import { describe, expect, it } from "vitest";

import { hasFeature } from "@/lib/entitlements";

describe("hasFeature", () => {
  it("grants beta users the beta feature set", () => {
    expect(hasFeature("beta", "csv_import")).toBe(true);
    expect(hasFeature({ plan: "beta" }, "monthly_reports")).toBe(true);
  });

  it("locks features for the free plan", () => {
    expect(hasFeature("free", "csv_import")).toBe(false);
  });

  it("defaults unknown or missing plans to least privilege", () => {
    expect(hasFeature(null, "csv_import")).toBe(false);
    expect(hasFeature({ plan: null }, "csv_import")).toBe(false);
    expect(hasFeature({ plan: "garbage" }, "csv_import")).toBe(false);
  });

  it("grants pro users features", () => {
    expect(hasFeature("pro", "unlimited_expenses")).toBe(true);
  });
});
