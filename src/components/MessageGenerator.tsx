"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

// Cheap, high-payoff feature: the real barrier for a lot of pre-teens
// isn't information, it's the awkwardness of saying it out loud. This
// gives them a ready-made message to send or show a trusted adult
// instead of having to find the words themselves.

const TEMPLATES = [
  {
    label: "To a parent/guardian",
    text: "Hey, I think I just got my period. Can you help me get some supplies?",
  },
  {
    label: "To a teacher or school nurse",
    text: "I think I've started my period and need some supplies or a minute to sort myself out. Is that okay?",
  },
  {
    label: "To a friend",
    text: "Hey, I think I just started my period — do you have a pad/tampon on you?",
  },
];

export function MessageGenerator() {
  const [templateIndex, setTemplateIndex] = useState(0);
  const [text, setText] = useState(TEMPLATES[0].text);
  const [copied, setCopied] = useState(false);

  function selectTemplate(index: number) {
    setTemplateIndex(index);
    setText(TEMPLATES[index].text);
    setCopied(false);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API can fail on non-HTTPS/local contexts — fail quietly,
      // the text is still visible and selectable by hand.
    }
  }

  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <p className="text-sm font-medium text-foreground">
        Not sure how to say it? Here&apos;s a message you can send instead.
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {TEMPLATES.map((t, i) => (
          <button
            key={t.label}
            onClick={() => selectTemplate(i)}
            className={`rounded-full border px-3 py-1 text-xs transition-colors ${
              i === templateIndex
                ? "border-primary bg-primary text-white"
                : "border-border text-text-muted hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        className="mt-3 w-full rounded-lg border border-border bg-surface p-3 text-sm text-foreground"
      />

      <div className="mt-3">
        <Button variant="secondary" onClick={copy}>
          {copied ? "Copied!" : "Copy message"}
        </Button>
      </div>
    </div>
  );
}
