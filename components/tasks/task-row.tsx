"use client";

import { formatDue } from "@/lib/tasks/format";
import type { Bucket, Task } from "@/lib/tasks/types";
import { cn } from "@/lib/utils";

type Props = {
  task: Task;
  onToggle: (task: Task, completed: boolean) => void;
  onMove: (task: Task, bucket: Bucket) => void;
  onDelete: (task: Task) => void;
};

export function TaskRow({ task, onToggle, onMove, onDelete }: Props) {
  const done = task.completed_at != null;
  const due = formatDue(task.due_at);
  const otherBucket: Bucket = task.bucket === "today" ? "someday" : "today";
  const otherLabel = otherBucket === "someday" ? "Someday" : "Today";

  return (
    <li className="group flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-secondary/60">
      <button
        type="button"
        onClick={() => onToggle(task, !done)}
        aria-pressed={done}
        aria-label={done ? `Mark "${task.title}" not done` : `Complete "${task.title}"`}
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
          done
            ? "border-primary bg-primary text-primary-foreground"
            : "border-muted-foreground/40 hover:border-foreground"
        )}
      >
        {done ? (
          <svg viewBox="0 0 16 16" fill="none" className="size-3" aria-hidden="true">
            <path
              d="M3.5 8.5l3 3 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : null}
      </button>

      <div className="min-w-0 flex-1">
        <span
          className={cn(
            "block truncate text-sm",
            done && "text-muted-foreground line-through"
          )}
        >
          {task.title}
        </span>
      </div>

      {due ? (
        <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
          {due}
        </span>
      ) : null}

      <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
        <button
          type="button"
          onClick={() => onMove(task, otherBucket)}
          aria-label={`Move "${task.title}" to ${otherLabel}`}
          className="rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
        >
          → {otherLabel}
        </button>
        <button
          type="button"
          onClick={() => onDelete(task)}
          aria-label={`Delete "${task.title}"`}
          className="rounded-md px-1.5 py-1 text-xs text-muted-foreground transition-colors hover:text-destructive"
        >
          ✕
        </button>
      </div>
    </li>
  );
}
