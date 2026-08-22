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
  label,
  handleClassName = "border-border bg-surface",
  children,
}: {
  id: string;
  defaultX: number;
  defaultY: number;
  onRemove?: () => void;
  label?: string;
  // Full Tailwind border/background classes for the drag handle, chosen
  // to match each widget's own color-block so the seam between handle
  // and body is invisible. Must be literal classes (not built from a
  // variable) so Tailwind's static scan picks them up.
  handleClassName?: string;
  children: React.ReactNode;
}) {
  const [pos, setPos] = useState<Pos>({ x: defaultX, y: defaultY });
  const [loaded, setLoaded] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(
    null,
  );
  const [dragging, setDragging] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // Keep the widget fully inside the canvas — like notes on a Padlet
  // board, not free to fly past the edge. Past x/y=0 the canvas can't
  // scroll to negative coordinates, so an unclamped drag off the top or
  // left is unrecoverable; clamping against the canvas's own rendered
  // size (its offsetParent) prevents that in every direction.
  function clampPos(x: number, y: number): Pos {
    const el = wrapperRef.current;
    const parent = el?.offsetParent as HTMLElement | null;
    if (!el || !parent) return { x, y };
    const maxX = Math.max(0, parent.clientWidth - el.offsetWidth);
    const maxY = Math.max(0, parent.clientHeight - el.offsetHeight);
    return { x: Math.min(Math.max(x, 0), maxX), y: Math.min(Math.max(y, 0), maxY) };
  }

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_PREFIX + id);
      const stored = raw ? (JSON.parse(raw) as Pos) : null;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPos((current) =>
        clampPos(stored?.x ?? current.x, stored?.y ?? current.y),
      );
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
    setPos(clampPos(dragRef.current.origX + dx, dragRef.current.origY + dy));
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
      ref={wrapperRef}
      style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
      className={`absolute left-0 top-0 w-80 ${dragging ? "z-20" : "z-10"}`}
    >
      <div
        className={`rounded-2xl transition-shadow duration-200 ${dragging ? "shadow-xl" : "shadow-[0_1px_2px_rgba(58,46,42,0.04),0_8px_20px_-8px_rgba(58,46,42,0.12)]"
          }`}
      >
        {/* A dedicated grab handle, not the whole card — so taps on
            buttons/links/inputs inside a widget still work normally. */}
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className={`relative flex touch-none select-none items-center justify-center gap-1.5 rounded-t-2xl border-2 border-b-0 py-2 text-text-muted cursor-grab active:cursor-grabbing ${handleClassName}`}
        >
          <span aria-hidden className="mr-1 text-sm tracking-widest">⠿⠿⠿</span>
          {label && <span className="text-xs font-medium uppercase tracking-[0.1em]">{label}</span>}
          {onRemove && (
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={onRemove}
              aria-label="Remove widget"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-semibold text-text-muted hover:bg-background hover:text-foreground"
            >
              <span className="sm:hidden"><CloseIcon className="h-3.5 w-3.5" /></span>
              <span className="hidden sm:inline">Hide</span>
            </button>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
