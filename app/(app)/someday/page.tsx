import { TaskBoard } from "@/components/tasks/task-board";
import { createClient } from "@/lib/supabase/server";
import type { Task } from "@/lib/tasks/types";

export default async function SomedayPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tasks")
    .select("*")
    .order("sort", { ascending: true });

  return <TaskBoard tasks={(data ?? []) as Task[]} scope="someday" />;
}
