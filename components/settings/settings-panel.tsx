"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

type Method = {
  id: string;
  name: string;
  blurb: string;
  available: boolean;
};

const METHODS: Method[] = [
  {
    id: "today-only",
    name: "Today-only focus",
    blurb: "Keep Today capped at 6. Overflow waits quietly in Someday.",
    available: true,
  },
  {
    id: "ivy-lee",
    name: "Ivy Lee 6",
    blurb: "Choose exactly six, in priority order. Work top to bottom.",
    available: false,
  },
  {
    id: "one-three-five",
    name: "1-3-5",
    blurb: "One big thing, three medium, five small.",
    available: false,
  },
  {
    id: "time-boxed",
    name: "Time-boxed",
    blurb: "Give each task a slot on your day.",
    available: false,
  },
];

export function SettingsPanel({ email }: { email: string }) {
  // Slice 1 ships only "Today-only focus"; the picker previews what's coming.
  // Persistence + real behaviour arrive in Slice 2 when other methods do something.
  const [method, setMethod] = useState("today-only");

  function choose(id: string) {
    setMethod(id);
  }

  return (
    <div className="space-y-10">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Signed in as <span className="text-foreground">{email}</span>
        </p>
      </header>

      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-sm font-medium">How you plan</h2>
          <p className="text-sm text-muted-foreground">
            Pick the method that fits you. You can change it any time — more
            methods are coming.
          </p>
        </div>
        <div className="space-y-2">
          {METHODS.map((m) => {
            const selected = method === m.id;
            return (
              <button
                key={m.id}
                type="button"
                disabled={!m.available}
                onClick={() => m.available && choose(m.id)}
                aria-pressed={selected}
                className={cn(
                  "flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-left transition-colors",
                  selected && "border-foreground",
                  !m.available && "cursor-not-allowed opacity-60"
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border",
                    selected ? "border-foreground" : "border-muted-foreground/40"
                  )}
                >
                  {selected ? <span className="size-2 rounded-full bg-foreground" /> : null}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="text-sm font-medium">{m.name}</span>
                    {!m.available ? (
                      <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                        Soon
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {m.blurb}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-sm font-medium">AI planning — bring your own model</h2>
          <p className="text-sm text-muted-foreground">
            AI is off by default. When it lands you’ll paste your own provider key
            and pick your own model, so your tasks stay private and you control the
            cost. Nothing leaves your account until you turn it on.
          </p>
        </div>
        <fieldset
          disabled
          className="space-y-3 rounded-lg border border-dashed p-4 opacity-70"
        >
          <label className="block space-y-1">
            <span className="text-xs font-medium text-muted-foreground">
              Provider endpoint
            </span>
            <input
              placeholder="https://openrouter.ai/api/v1"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium text-muted-foreground">Model</span>
            <input
              placeholder="openai/gpt-oss-120b:free"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium text-muted-foreground">API key</span>
            <input
              type="password"
              placeholder="sk-…"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </label>
          <p className="text-[11px] text-muted-foreground">
            Available in a later update.
          </p>
        </fieldset>
      </section>
    </div>
  );
}
