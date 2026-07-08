import * as chrono from "chrono-node";

export type ParsedCapture = {
  /** The task text with any date phrase removed. */
  title: string;
  /** ISO timestamp of the detected due date, or null if none was found. */
  dueAt: string | null;
};

/**
 * Turn a raw capture string into a title + optional due date, entirely locally.
 * No network, no LLM — instant and private. "buy milk tomorrow" =>
 * { title: "buy milk", dueAt: <tomorrow> }. Plain text with no date phrase
 * comes back unchanged with dueAt: null.
 *
 * `forwardDate` biases bare weekdays/times to the future ("friday" => the next
 * Friday), which is what you want for a to-do.
 */
export function parseCapture(raw: string, ref: Date = new Date()): ParsedCapture {
  const text = raw.trim();
  if (!text) return { title: "", dueAt: null };

  const results = chrono.parse(text, ref, { forwardDate: true });
  if (results.length === 0) return { title: text, dueAt: null };

  // Prefer the last date mention — people tend to trail the date ("... tomorrow").
  const match = results[results.length - 1];
  const stripped = (text.slice(0, match.index) + text.slice(match.index + match.text.length))
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.;:])/g, "$1")
    .replace(/\s+$/g, "")
    .replace(/[,\s]+$/g, "")
    .trim();

  return {
    // Never let date-stripping leave an empty title (e.g. input was just "tomorrow").
    title: stripped.length > 0 ? stripped : text,
    dueAt: match.date().toISOString(),
  };
}
