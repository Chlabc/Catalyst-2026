"use client";

import { useEffect, useRef, useState } from "react";
import { CloseIcon } from "@/components/icons";

const STORAGE_PREFIX = "blossom_widget_pos_";

type Pos = { x: number; y: number };

function clampToCanvas(x: number, y: number, widget: HTMLElement): Pos {
  const canvas = widget.closest("[data-widget-canvas]");
  if (!(canvas instanceof HTMLElement)) {
    return { x: Math.max(0, x), y: Math.max(0, y) };
  }
  const pad = 8;
  const maxX = Math.max(pad, canvas.clientWidth - widget.offsetWidth - pad);
  const maxY = Math.max(pad, canvas.clientHeight - widget.offsetHeight - pad);
  return {
    x: Math.min(Math.max(pad, x), maxX),
    y: Math.min(Math.max(pad, y), maxY),
  };
}

export function DraggableWidget({
  id,
  defaultX,
  defaultY,
  onRemove,
  onActivate,
  zIndex = 10,
  label,
  handleClassName = "border-border bg-surface",
  className = "",
  children,
}: {
  id: string;
  defaultX: number;
  defaultY: number;
  onRemove?: () => void;
  onActivate?: () => void;
  zIndex?: number;
  label?: string;
  handleClassName?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [pos, setPos] = useState<Pos>({ x: defaultX, y: defaultY });
  const [loaded, setLoaded] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(
    null,
  );
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    let next = { x: defaultX, y: defaultY };
    try {
      const raw = window.localStorage.getItem(STORAGE_PREFIX + id);
      if (raw) next = JSON.parse(raw) as Pos;
    } catch {
      // Corrupt/missing storage — just use the default position.
    }
    const node = rootRef.current;
    if (node) next = clampToCanvas(next.x, next.y, node);
    setPos(next);
    setLoaded(true);
  }, [id, defaultX, defaultY]);

  useEffect(() => {
    const node = rootRef.current;
    if (!node || !loaded) return;

    function snap() {
      const widget = rootRef.current;
      if (!widget) return;
      setPos((current) => {
        const clamped = clampToCanvas(current.x, current.y, widget);
        if (clamped.x === current.x && clamped.y === current.y) return current;
        window.localStorage.setItem(STORAGE_PREFIX + id, JSON.stringify(clamped));
        return clamped;
      });
    }

    snap();
    window.addEventListener("resize", snap);
    return () => window.removeEventListener("resize", snap);
  }, [id, loaded]);

  function onPointerDown(e: React.PointerEvent) {
    onActivate?.();
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
    const node = rootRef.current;
    const next = {
      x: dragRef.current.origX + dx,
      y: dragRef.current.origY + dy,
    };
    setPos(node ? clampToCanvas(next.x, next.y, node) : next);
  }

  function onPointerUp() {
    if (!dragRef.current) return;
    dragRef.current = null;
    setDragging(false);
    setPos((current) => {
      const node = rootRef.current;
      const next = node ? clampToCanvas(current.x, current.y, node) : current;
      window.localStorage.setItem(STORAGE_PREFIX + id, JSON.stringify(next));
      return next;
    });
  }

  if (!loaded) {
    return (
      <div
        ref={rootRef}
        data-widget-id={id}
        className={`absolute left-0 top-0 w-80 opacity-0 ${className}`}
        style={{ transform: `translate(${defaultX}px, ${defaultY}px)`, zIndex }}
      />
    );
  }

  return (
    <div
      ref={rootRef}
      data-widget-id={id}
      data-widget-front={dragging ? "true" : undefined}
      onPointerDownCapture={() => onActivate?.()}
      style={{ transform: `translate(${pos.x}px, ${pos.y}px)`, zIndex }}
      className={`absolute left-0 top-0 w-80 ${className}`}
    >
      <div
        className={`rounded-2xl transition-shadow duration-200 ${dragging ? "shadow-xl" : "shadow-[0_1px_2px_rgba(58,46,42,0.04),0_8px_20px_-8px_rgba(58,46,42,0.12)]"
          }`}
      >
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
              type="button"
              data-testid={`hide-widget-${id}`}
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
