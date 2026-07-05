import { TODAY_CAP } from "./constants";
import type { Task } from "./types";

/** Local midnight for the given moment. Day boundaries are the user's local day. */
export function startOfDay(now: Date): Date {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function isCompleted(t: Task): boolean {
  return t.completed_at != null;
}

/**
 * The gentle rollover, expressed as a pure predicate rather than a nightly job:
 * - an unfinished Today task always stays in Today (it is never "overdue"),
 * - a completed Today task shows only on the day it was completed, then quietly
 *   drops out of the Today view (kept in the DB for history).
 */
export function inTodayView(t: Task, now: Date): boolean {
  if (t.bucket !== "today") return false;
  if (t.completed_at == null) return true;
  return new Date(t.completed_at) >= startOfDay(now);
}

export function inSomedayView(t: Task): boolean {
  return t.bucket === "someday" && t.completed_at == null;
}

/** Active tasks (a.k.a. incomplete) come first, then just-completed, each by sort. */
function byActiveThenSort(a: Task, b: Task): number {
  const ac = a.completed_at ? 1 : 0;
  const bc = b.completed_at ? 1 : 0;
  if (ac !== bc) return ac - bc;
  return a.sort - b.sort;
}

export function todayView(tasks: Task[], now: Date = new Date()): Task[] {
  return tasks.filter((t) => inTodayView(t, now)).sort(byActiveThenSort);
}

export function somedayView(tasks: Task[]): Task[] {
  return tasks.filter(inSomedayView).sort((a, b) => a.sort - b.sort);
}

/** How many *active* tasks are in Today right now — what the soft cap measures. */
export function activeTodayCount(tasks: Task[], now: Date = new Date()): number {
  return tasks.filter((t) => inTodayView(t, now) && t.completed_at == null).length;
}

export function isTodayFull(activeCount: number): boolean {
  return activeCount >= TODAY_CAP;
}

/**
 * Where a newly captured task should land. If Today already holds the cap's worth
 * of active tasks, the new one goes to Someday — a nudge to keep Today short, not
 * a hard wall (the user can still pull it into Today by hand).
 */
export function bucketForNewTask(activeCount: number): "today" | "someday" {
  return isTodayFull(activeCount) ? "someday" : "today";
}
