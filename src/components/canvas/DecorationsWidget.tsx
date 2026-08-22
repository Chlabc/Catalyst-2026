"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "blossom_canvas_decorations";
const OPTIONS = [
    { id: "flowers", label: "Flowers", symbols: ["✿", "✦", "❀"] },
    { id: "leaves", label: "Leaves", symbols: ["❧", "☘", "❋"] },
    { id: "sparkles", label: "Sparkles", symbols: ["✧", "✦", "⋆"] },
] as const;

type DecorationId = (typeof OPTIONS)[number]["id"];

export function DecorationsWidget() {
    const [selected, setSelected] = useState<Set<DecorationId>>(new Set(["flowers"]));
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        try {
            const raw = window.localStorage.getItem(STORAGE_KEY);
            // eslint-disable-next-line react-hooks/set-state-in-effect
            if (raw) setSelected(new Set(JSON.parse(raw)));
        } catch {
            // Corrupt/missing storage uses the gentle default.
        }
        setLoaded(true);
    }, []);

    function toggle(id: DecorationId) {
        const next = new Set(selected);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelected(next);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
        window.dispatchEvent(new CustomEvent("blossom:decorations-changed", { detail: [...next] }));
    }

    if (!loaded) return null;

    return (
        <div className="rounded-b-2xl border-2 border-t-0 border-secondary/30 bg-secondary-soft p-5">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-base font-semibold text-foreground">Decorate your island</p>
                    <p className="mt-1 text-sm text-text-muted">Add a little life to your desk.</p>
                </div>
                <span aria-hidden className="text-2xl text-secondary">✿</span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
                {OPTIONS.map((option) => {
                    const active = selected.has(option.id);
                    return (
                        <button
                            key={option.id}
                            onClick={() => toggle(option.id)}
                            aria-pressed={active}
                            className={`rounded-xl border p-2 text-center transition-colors ${active ? "border-secondary bg-white/70 text-foreground" : "border-transparent bg-white/35 text-text-muted hover:border-secondary/50"}`}
                        >
                            <span className="block text-lg tracking-wide">{option.symbols.join(" ")}</span>
                            <span className="mt-1 block text-[10px] font-semibold">{option.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
