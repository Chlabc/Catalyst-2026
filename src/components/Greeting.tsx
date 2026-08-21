"use client";

import { useEffect, useState } from "react";

const KEY = "blossom_user_name";

// Local-only nickname, no account. Consistent with the tracker's
// no-login stance — this is personalization without collecting anything.
export function Greeting() {
  const [name, setName] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setName(raw);
    } catch {
      // Corrupt/missing storage — just start fresh.
    }
    setLoaded(true);
  }, []);

  function save() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    setName(trimmed);
    window.localStorage.setItem(KEY, trimmed);
    setEditing(false);
  }

  if (!loaded) {
    return (
      <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
        Welcome
      </h1>
    );
  }

  if (editing || !name) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && save()}
          placeholder="What should we call you?"
          className="rounded-full border border-border bg-surface px-4 py-2 text-lg text-foreground"
        />
        <button
          onClick={save}
          className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Save
        </button>
      </div>
    );
  }

  return (
    <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
      Welcome back, {name}
      <button
        onClick={() => {
          setDraft(name);
          setEditing(true);
        }}
        className="ml-3 text-sm font-normal text-text-muted underline hover:text-foreground"
      >
        change
      </button>
    </h1>
  );
}
