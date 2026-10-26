"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUpDown } from "lucide-react";
import type { AdminSortMode } from "@/data/booking";

const SORT_OPTIONS: { value: AdminSortMode; label: string }[] = [
  { value: "date-asc", label: "Date: soonest" },
  { value: "date-desc", label: "Date: latest" },
  { value: "newest", label: "Newest requests" },
  { value: "guests-desc", label: "Party size: high → low" },
  { value: "name-asc", label: "Name: A–Z" },
];

type Props = {
  value: AdminSortMode;
  onChange: (value: AdminSortMode) => void;
};

function canHoverOpen() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

function readIsDark() {
  if (typeof document === "undefined") return false;
  return document.documentElement.getAttribute("data-theme") === "dark";
}

export function AdminSortControl({ value, onChange }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const suppressHoverUntil = useRef(0);
  const [open, setOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const reduceMotion = useReducedMotion();
  const listId = useId();
  const isActive = value !== "date-asc";

  useEffect(() => {
    const sync = () => setIsDark(readIsDark());
    sync();
    const mo = new MutationObserver(sync);
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => mo.disconnect();
  }, []);

  const blockHoverBriefly = useCallback((ms = 320) => {
    suppressHoverUntil.current = performance.now() + ms;
  }, []);

  const close = useCallback(() => {
    blockHoverBriefly();
    setOpen(false);
  }, [blockHoverBriefly]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const root = rootRef.current;
      if (!root) return;
      if (event.target instanceof Node && root.contains(event.target)) return;
      close();
    };
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  function openFromHover() {
    if (!canHoverOpen()) return;
    if (performance.now() < suppressHoverUntil.current) return;
    setOpen(true);
  }

  function onTriggerKey(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen(true);
    }
  }

  const filled = open || isActive;

  return (
    <div
      ref={rootRef}
      className="relative shrink-0"
      onPointerEnter={openFromHover}
      onPointerMove={openFromHover}
      onPointerLeave={() => {
        if (canHoverOpen()) close();
      }}
    >
      <button
        type="button"
        aria-label="Sort reservations"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={listId}
        title="Sort"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onTriggerKey}
        className={`admin-pill inline-flex items-center gap-2 ${
          filled ? "border-transparent bg-[color:var(--brand-red)] text-[color:var(--on-brand)]" : ""
        }`}
      >
        <ArrowUpDown
          className="size-4"
          strokeWidth={1.75}
          absoluteStrokeWidth
          aria-hidden
        />
        <span>Sort by</span>
      </button>

      <AnimatePresence>
        {open ? (
          <div className="absolute top-full right-0 z-50 pt-2">
            <motion.div
              id={listId}
              role="menu"
              aria-label="Sort options"
              initial={
                reduceMotion
                  ? { opacity: 1 }
                  : { opacity: 0, y: -8, scale: 0.96 }
              }
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={
                reduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: -6, scale: 0.97 }
              }
              transition={
                reduceMotion
                  ? { duration: 0.12 }
                  : { type: "spring", stiffness: 420, damping: 28, mass: 0.7 }
              }
              className="menu-sort-glass relative w-[220px] origin-top-right overflow-hidden rounded-xl border border-white/35 p-1.5 text-ink shadow-[0_18px_40px_-18px_color-mix(in_srgb,var(--ink)_40%,transparent),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl backdrop-saturate-150"
              style={{
                background: isDark
                  ? `linear-gradient(
                      145deg,
                      color-mix(in srgb, var(--brand-red) 22%, transparent) 0%,
                      color-mix(in srgb, var(--gold) 18%, transparent) 42%,
                      color-mix(in srgb, var(--elevated) 55%, transparent) 100%
                    )`
                  : `linear-gradient(
                      145deg,
                      color-mix(in srgb, var(--brand-red) 14%, transparent) 0%,
                      color-mix(in srgb, var(--gold) 16%, transparent) 38%,
                      color-mix(in srgb, var(--elevated) 48%, transparent) 72%,
                      color-mix(in srgb, var(--paper) 35%, transparent) 100%
                    )`,
              }}
            >
              {SORT_OPTIONS.map((option) => {
                const selected = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="menuitemradio"
                    aria-checked={selected}
                    className={`flex w-full rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                      selected
                        ? "bg-[color-mix(in_srgb,var(--brand-red)_16%,transparent)] font-semibold text-brand-red"
                        : "text-ink hover:bg-[color-mix(in_srgb,var(--ink)_7%,transparent)]"
                    }`}
                    onClick={() => {
                      onChange(option.value);
                      close();
                    }}
                  >
                    {option.label}
                  </button>
                );
              })}
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
