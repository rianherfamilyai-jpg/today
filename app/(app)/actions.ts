"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { parseCapture } from "@/lib/tasks/parse";
import { type Bucket, isBucket } from "@/lib/tasks/types";
import { bucketForNewTask } from "@/lib/tasks/view";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

function revalidateLists() {
  revalidatePath("/today");
  revalidatePath("/someday");
}

export type AddTaskResult = {
  ok: boolean;
  nudgedToSomeday?: boolean;
  error?: string;
};

/**
 * Capture a task. Parsing (title + due date) happens locally. When adding to
 * Today, the soft cap decides the real destination: if Today is already full the
 * task is parked in Someday (a nudge, not a block).
 */
export async function addTask(
  rawInput: string,
  target: Bucket = "today"
): Promise<AddTaskResult> {
  const { supabase, user } = await requireUser();

  const { title, dueAt } = parseCapture(rawInput);
  if (!title) return { ok: false, error: "empty" };

  let bucket: Bucket = isBucket(target) ? target : "today";
  let nudgedToSomeday = false;

  if (bucket === "today") {
    const { count } = await supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("bucket", "today")
      .is("completed_at", null);
    bucket = bucketForNewTask(count ?? 0);
    nudgedToSomeday = bucket === "someday";
  }

  const { error } = await supabase.from("tasks").insert({
    user_id: user.id,
    title,
    bucket,
    due_at: dueAt,
  });
  if (error) return { ok: false, error: error.message };

  revalidateLists();
  return { ok: true, nudgedToSomeday };
}

export async function setCompleted(id: string, completed: boolean) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("tasks")
    .update({ completed_at: completed ? new Date().toISOString() : null })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) throw new Error(error.message);
  revalidateLists();
}

export async function moveTask(id: string, bucket: Bucket) {
  const { supabase, user } = await requireUser();
  if (!isBucket(bucket)) throw new Error("invalid bucket");
  const { error } = await supabase
    .from("tasks")
    .update({ bucket })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) throw new Error(error.message);
  revalidateLists();
}

export async function deleteTask(id: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) throw new Error(error.message);
  revalidateLists();
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
