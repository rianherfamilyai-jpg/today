import { startOfDay } from "./view";

/**
 * A gentle, human due-date label. Deliberately never renders anything alarming
 * (no red "OVERDUE!" — a past date just reads "Yesterday" in muted text).
 */
export function formatDue(dueAtIso: string | null, now: Date = new Date()): string | null {
  if (!dueAtIso) return null;
  const due = new Date(dueAtIso);
  if (Number.isNaN(due.getTime())) return null;

  const dayDiff = Math.round(
    (startOfDay(due).getTime() - startOfDay(now).getTime()) / 86_400_000
  );

  if (dayDiff === 0) return "Today";
  if (dayDiff === 1) return "Tomorrow";
  if (dayDiff === -1) return "Yesterday";
  if (dayDiff > 1 && dayDiff <= 6) {
    return due.toLocaleDateString(undefined, { weekday: "long" });
  }
  return due.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
