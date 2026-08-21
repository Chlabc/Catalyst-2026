"use client";

import { useEffect, useRef, useState } from "react";
import { CloseIcon } from "@/components/icons";

const STORAGE_PREFIX = "blossom_widget_pos_";

type Pos = { x: number; y: number };

// Free-drag positioning, like rearranging icons on a phone home screen —
// each widget remembers its own spot independently, no shared layout
// state needed. Pointer events cover mouse and touch both.
export function DraggableWidget({
  id,
  defaultX,
  defaultY,
  onRemove,
  children,
}: {
  id: string;
  defaultX: number;
  defaultY: number;
  // Omit to make a widget permanent (no dismiss button) - Flower and
  // Learning don't get one, Tracking and Help do.
  onRemove?: () => void;
  children: React.ReactNode;
}) {
  const [pos, setPos] = useState<Pos>({ x: defaultX, y: defaultY });
  const [loaded, setLoaded] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(
    null,
  );
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_PREFIX + id);
      if (raw) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPos(JSON.parse(raw));
      }
    } catch {
      // Corrupt/missing storage — just use the default position.
    }
    setLoaded(true);
  }, [id]);

  function onPointerDown(e: React.PointerEvent) {
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: pos.x,
      origY: pos.y,
    };
    setDragging(true);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setPos({ x: dragRef.current.origX + dx, y: dragRef.current.origY + dy });
  }

  function onPointerUp() {
    if (!dragRef.current) return;
    dragRef.current = null;
    setDragging(false);
    setPos((current) => {
      window.localStorage.setItem(STORAGE_PREFIX + id, JSON.stringify(current));
      return current;
    });
  }

  if (!loaded) return null;

  return (
    <div
      style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
      className={`absolute left-0 top-0 w-72 ${dragging ? "z-20" : "z-10"}`}
    >
      <div
        className={`rounded-2xl transition-shadow duration-200 ${
          dragging ? "shadow-xl" : "shadow-[0_1px_2px_rgba(58,46,42,0.04),0_8px_20px_-8px_rgba(58,46,42,0.12)]"
        }`}
      >
        {/* A dedicated grab handle, not the whole card — so taps on
            buttons/links/inputs inside a widget still work normally. */}
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="relative flex touch-none select-none items-center justify-center gap-1 rounded-t-2xl border border-b-0 border-border bg-surface py-1.5 text-text-muted cursor-grab active:cursor-grabbing"
        >
          <span aria-hidden className="text-xs tracking-widest">
            ⠿⠿⠿
          </span>
          {onRemove && (
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={onRemove}
              aria-label="Remove widget"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-text-muted hover:bg-background hover:text-foreground"
            >
              <CloseIcon className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
