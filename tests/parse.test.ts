import { describe, expect, it } from "vitest";

import { parseCapture } from "@/lib/tasks/parse";

// A fixed Sunday reference so relative dates are deterministic.
const REF = new Date("2026-07-05T09:00:00");

describe("parseCapture", () => {
  it("extracts a trailing relative date and strips it from the title", () => {
    const { title, dueAt } = parseCapture("buy milk tomorrow", REF);
    expect(title).toBe("buy milk");
    expect(dueAt).not.toBeNull();
    expect(new Date(dueAt!).getDate()).toBe(6); // Jul 6
  });

  it("parses a weekday + time and strips it", () => {
    const { title, dueAt } = parseCapture("call bob friday 3pm", REF);
    expect(title).toBe("call bob");
    expect(dueAt).not.toBeNull();
  });

  it("leaves plain text untouched when there is no date", () => {
    const { title, dueAt } = parseCapture("read a book", REF);
    expect(title).toBe("read a book");
    expect(dueAt).toBeNull();
  });

  it("does not treat a bare quantity as a date", () => {
    const { title, dueAt } = parseCapture("buy 2 apples", REF);
    expect(title).toBe("buy 2 apples");
    expect(dueAt).toBeNull();
  });

  it("never returns an empty title, even if the input is only a date", () => {
    const { title, dueAt } = parseCapture("tomorrow", REF);
    expect(title.length).toBeGreaterThan(0);
    expect(dueAt).not.toBeNull();
  });

  it("returns empty for blank input", () => {
    expect(parseCapture("   ", REF)).toEqual({ title: "", dueAt: null });
  });
});
