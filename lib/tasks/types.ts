import type { Database } from "@/lib/supabase/database.types";

export type Task = Database["public"]["Tables"]["tasks"]["Row"];
export type TaskInsert = Database["public"]["Tables"]["tasks"]["Insert"];

export type Bucket = "today" | "someday";

export const BUCKETS: readonly Bucket[] = ["today", "someday"] as const;

export function isBucket(value: string): value is Bucket {
  return value === "today" || value === "someday";
}
