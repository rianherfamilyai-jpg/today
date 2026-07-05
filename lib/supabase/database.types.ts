// Placeholder types. Regenerate from your local schema with `npm run db:types`
// (runs `supabase gen types typescript --local`). Do not hand-edit long-term.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; plan: string; created_at: string };
        Insert: { id: string; plan?: string; created_at?: string };
        Update: { id?: string; plan?: string; created_at?: string };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
