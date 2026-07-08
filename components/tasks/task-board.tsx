"use client";

import { useOptimistic, useRef, useState, useTransition } from "react";

import { addTask, deleteTask, moveTask, setCompleted } from "@/app/(app)/actions";
import { track } from "@/lib/analytics";
import { TODAY_CAP } from "@/lib/tasks/constants";
import { parseCapture } from "@/lib/tasks/parse";
import type { Bucket, Task } from "@/lib/tasks/types";
import {
  activeTodayCount,
  bucketForNewTask,
  somedayView,
  todayView,
} from "@/lib/tasks/view";
import { cn } from "@/lib/utils";

import { TaskRow } from "./task-row";

type Props = { tasks: Task[]; scope: Bucket };

type OptAction =
  | { type: "add"; task: Task }
  | { type: "toggle"; id: string; completed: boolean }
  | { type: "move"; id: string; bucket: Bucket }
  | { type: "delete"; id: string };

function reducer(state: Task[], action: OptAction): Task[] {
  switch (action.type) {
    case "add":
      return [...state, action.task];
    case "toggle":
      return state.map((t) =>
        t.id === action.id
          ? { ...t, completed_at: action.completed ? new Date().toISOString() : null }
          : t
      );
    case "move":
      return state.map((t) => (t.id === action.id ? { ...t, bucket: action.bucket } : t));
    case "delete":
      return state.filter((t) => t.id !== action.id);
  }
}

function tempId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `temp-${crypto.randomUUID()}`;
  }
  return `temp-${Date.now()}-${Math.random()}`;
}

export function TaskBoard({ tasks, scope }: Props) {
  const [optimistic, dispatch] = useOptimistic(tasks, reducer);
  const [, startTransition] = useTransition();
  const [input, setInput] = useState("");
  const [nudge, setNudge] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isToday = scope === "today";
  const list = isToday ? todayView(optimistic) : somedayView(optimistic);
  const activeCount = activeTodayCount(optimistic);
  const full = activeCount >= TODAY_CAP;

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setNudge(null);
    const raw = input.trim();
    if (!raw) return;

    const parsed = parseCapture(raw);
    if (!parsed.title) return;

    const bucket: Bucket = isToday ? bucketForNewTask(activeCount) : "someday";
    const optimisticTask: Task = {
      id: tempId(),
      user_id: "me",
      title: parsed.title,
      bucket,
      due_at: parsed.dueAt,
      completed_at: null,
      sort: Number.MAX_SAFE_INTEGER,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setInput("");
    if (isToday && bucket === "someday") {
      setNudge("Today’s full — I parked that in Someday to keep today focused.");
    }

    startTransition(async () => {
      dispatch({ type: "add", task: optimisticTask });
      const res = await addTask(raw, scope);
      if (res.ok) {
        track("task_captured", {
          bucket: res.nudgedToSomeday ? "someday" : bucket,
        });
      }
    });
    inputRef.current?.focus();
  }

  function handleToggle(task: Task, completed: boolean) {
    startTransition(async () => {
      dispatch({ type: "toggle", id: task.id, completed });
      await setCompleted(task.id, completed);
      if (completed) track("task_completed", { bucket: task.bucket });
    });
  }

  function handleMove(task: Task, bucket: Bucket) {
    startTransition(async () => {
      dispatch({ type: "move", id: task.id, bucket });
      await moveTask(task.id, bucket);
    });
  }

  function handleDelete(task: Task) {
    startTransition(async () => {
      dispatch({ type: "delete", id: task.id });
      await deleteTask(task.id);
    });
  }

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">
            {isToday ? "Today" : "Someday"}
          </h1>
          {isToday ? (
            <div
              className="flex items-center gap-1"
              aria-label={`${activeCount} of ${TODAY_CAP} today`}
              title={`${activeCount} of ${TODAY_CAP}`}
            >
              {Array.from({ length: TODAY_CAP }).map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "size-1.5 rounded-full",
                    i < activeCount ? "bg-foreground" : "bg-border"
                  )}
                />
              ))}
            </div>
          ) : null}
        </div>
        <p className="text-sm text-muted-foreground">
          {isToday
            ? "A short list of what matters now."
            : "Everything that can wait. No rush, no guilt."}
        </p>
      </header>

      <form onSubmit={handleAdd}>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            isToday ? "What needs doing today?" : "Add something for later…"
          }
          aria-label={isToday ? "Add a task to Today" : "Add a task to Someday"}
          enterKeyHint="done"
          autoComplete="off"
          className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        />
        <p className="mt-1.5 px-1 text-xs text-muted-foreground">
          Tip: add a date in plain words — “call Sam friday”, “pay rent tomorrow”.
        </p>
      </form>

      {nudge ? (
        <p
          role="status"
          className="rounded-lg border border-border bg-secondary/50 px-3 py-2 text-xs text-muted-foreground"
        >
          {nudge}
        </p>
      ) : null}

      {list.length > 0 ? (
        <ul className="-mx-2">
          {list.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onToggle={handleToggle}
              onMove={handleMove}
              onDelete={handleDelete}
            />
          ))}
        </ul>
      ) : (
        <div className="rounded-lg border border-dashed px-4 py-10 text-center">
          <p className="text-sm text-muted-foreground">
            {isToday
              ? full
                ? "That’s a full, focused day. Nice."
                : "A clear Today. Add the first thing — or enjoy the quiet."
              : "Nothing waiting. Someday stays empty until you need it."}
          </p>
        </div>
      )}
    </div>
  );
}
