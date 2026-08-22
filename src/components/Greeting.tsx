"use client";

import { useEffect, useState } from "react";

const KEY = "blossom_user_name";

function timeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

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
    return <>Welcome</>;
  }

  if (editing || !name) {
    return (
      <span className="inline-flex flex-wrap items-center gap-2">
        <span>{timeGreeting()}</span>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && save()}
          placeholder="What should we call you?"
          aria-label="Your name"
          className="min-w-0 rounded-full border border-white/70 bg-white/70 px-3 py-1 text-lg font-medium text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
        />
        <button
          type="button"
          onClick={save}
          className="rounded-full bg-primary px-3 py-1 text-sm font-medium text-white hover:opacity-90"
        >
          Save
        </button>
      </span>
    );
  }

  return (
    <>
      {timeGreeting()}, {name}
      <button
        type="button"
        onClick={() => {
          setDraft(name);
          setEditing(true);
        }}
        className="ml-2 align-middle text-xs font-normal text-foreground/60 underline decoration-foreground/25 underline-offset-2 hover:text-foreground"
      >
        change
      </button>
    </>
  );
}
