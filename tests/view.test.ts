import { describe, expect, it } from "vitest";

import { TODAY_CAP } from "@/lib/tasks/constants";
import type { Task } from "@/lib/tasks/types";
import {
  activeTodayCount,
  bucketForNewTask,
  inTodayView,
  somedayView,
  todayView,
} from "@/lib/tasks/view";

const NOW = new Date("2026-07-05T12:00:00");

let seq = 0;
function task(overrides: Partial<Task> = {}): Task {
  seq += 1;
  return {
    id: `t${seq}`,
    user_id: "u1",
    title: `task ${seq}`,
    bucket: "today",
    due_at: null,
    completed_at: null,
    sort: seq,
    created_at: NOW.toISOString(),
    updated_at: NOW.toISOString(),
    ...overrides,
  };
}

describe("today view / gentle rollover", () => {
  it("keeps an unfinished task from a previous day in Today, never overdue", () => {
    const t = task({ created_at: "2026-07-01T09:00:00Z", completed_at: null });
    expect(inTodayView(t, NOW)).toBe(true);
  });

  it("drops a task completed on a previous day out of the Today view", () => {
    const t = task({ completed_at: "2026-07-04T18:00:00" });
    expect(inTodayView(t, NOW)).toBe(false);
  });

  it("keeps a task completed earlier today in the Today view", () => {
    const t = task({ completed_at: "2026-07-05T08:00:00" });
    expect(inTodayView(t, NOW)).toBe(true);
  });

  it("orders active tasks before completed ones", () => {
    const done = task({ sort: 1, completed_at: "2026-07-05T08:00:00" });
    const active = task({ sort: 2, completed_at: null });
    const view = todayView([done, active], NOW);
    expect(view[0].id).toBe(active.id);
  });
});

describe("soft cap", () => {
  it("counts only active Today tasks", () => {
    const tasks = [
      task({ completed_at: null }),
      task({ completed_at: null }),
      task({ completed_at: "2026-07-05T08:00:00" }), // completed today: not active
      task({ bucket: "someday" }),
    ];
    expect(activeTodayCount(tasks, NOW)).toBe(2);
  });

  it("sends new tasks to Today until the cap, then nudges to Someday", () => {
    expect(bucketForNewTask(TODAY_CAP - 1)).toBe("today");
    expect(bucketForNewTask(TODAY_CAP)).toBe("someday");
    expect(bucketForNewTask(TODAY_CAP + 3)).toBe("someday");
  });
});

describe("someday view", () => {
  it("shows only incomplete someday tasks, in sort order", () => {
    const a = task({ bucket: "someday", sort: 2 });
    const b = task({ bucket: "someday", sort: 1 });
    task({ bucket: "someday", completed_at: "2026-07-05T08:00:00" }); // hidden
    const view = somedayView([a, b]);
    expect(view.map((t) => t.id)).toEqual([b.id, a.id]);
  });
});
