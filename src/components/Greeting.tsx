"use client";

import { useEffect, useState } from "react";

const KEY = "blossom_user_name";

export function timeGreeting(at: Date = new Date()) {
  const hour = at.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
}

function formatClock(at: Date) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(at);
}

// Local-only nickname, no account. Consistent with the tracker's
// no-login stance — this is personalization without collecting anything.
export function Greeting() {
  const [name, setName] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setName(raw);
    } catch {
      // Corrupt/missing storage — just start fresh.
    }
    function tick() {
      setNow(new Date());
    }
    tick();
    const id = window.setInterval(tick, 30_000);
    setLoaded(true);
    return () => window.clearInterval(id);
  }, []);

  function save() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    setName(trimmed);
    window.localStorage.setItem(KEY, trimmed);
    setEditing(false);
  }

  const greeting = now ? timeGreeting(now) : "Welcome";
  const clock = now ? formatClock(now) : "";

  if (!loaded) {
    return <>Welcome</>;
  }

  if (editing || !name) {
    return (
      <span className="inline-flex flex-wrap items-center gap-2">
        <span>{greeting}</span>
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
      {greeting}, {name}
      {clock ? (
        <span className="ml-2 align-middle text-base font-normal text-text-muted">
          · {clock}
        </span>
      ) : null}
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
