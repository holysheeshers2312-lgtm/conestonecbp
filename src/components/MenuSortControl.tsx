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
import { Filter } from "lucide-react";

export type MenuSortMode =
  | "default"
  | "name-asc"
  | "name-desc"
  | "price-asc"
  | "price-desc";

const SORT_OPTIONS: { value: MenuSortMode; label: string }[] = [
  { value: "default", label: "Default order" },
  { value: "name-asc", label: "Name: A–Z" },
  { value: "name-desc", label: "Name: Z–A" },
  { value: "price-asc", label: "Price: Low to high" },
  { value: "price-desc", label: "Price: High to low" },
];

type MenuSortControlProps = {
  value: MenuSortMode;
  onChange: (value: MenuSortMode) => void;
};

function canHoverOpen() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

function readIsDark() {
  if (typeof document === "undefined") return false;
  return document.documentElement.getAttribute("data-theme") === "dark";
}

export function MenuSortControl({ value, onChange }: MenuSortControlProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const suppressHoverUntil = useRef(0);
  const [open, setOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const reduceMotion = useReducedMotion();
  const listId = useId();
  const isActive = value !== "default";

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
    // Prevent an instant reopen when the menu unmounts under the cursor.
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

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  const openFromHover = () => {
    if (!canHoverOpen()) return;
    if (performance.now() < suppressHoverUntil.current) return;
    setOpen((prev) => (prev ? prev : true));
  };

  const closeFromHover = () => {
    if (!canHoverOpen()) return;
    suppressHoverUntil.current = 0;
    setOpen(false);
  };

  const toggle = () => {
    setOpen((prev) => {
      if (prev) {
        blockHoverBriefly();
        return false;
      }
      suppressHoverUntil.current = 0;
      return true;
    });
  };

  const select = (next: MenuSortMode) => {
    onChange(next);
    close();
  };

  const clearAll = () => {
    onChange("default");
    close();
  };

  const onMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
    }
  };

  const filled = open || isActive;

  return (
    <div
      ref={rootRef}
      className="relative shrink-0"
      onPointerEnter={openFromHover}
      onPointerMove={openFromHover}
      onPointerLeave={closeFromHover}
    >
      <button
        type="button"
        className={`relative grid size-11 place-items-center rounded-full border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--brand-red)] ${
          filled
            ? "border-transparent bg-[color:var(--brand-red)] text-[color:var(--on-brand)]"
            : isDark
              ? "border-white/12 bg-[color-mix(in_srgb,var(--ink)_8%,var(--elevated))] text-ink hover:border-[color-mix(in_srgb,var(--brand-red)_45%,transparent)]"
              : "border-[color:var(--line)] bg-[color-mix(in_srgb,var(--ink)_8%,var(--elevated))] text-ink hover:border-[color-mix(in_srgb,var(--brand-red)_40%,var(--line))]"
        }`}
        aria-label="Sort menu items"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={listId}
        onClick={toggle}
      >
        <Filter
          className={`size-[21px] ${filled ? "text-[color:var(--on-brand)]" : "text-ink"}`}
          strokeWidth={1.75}
          absoluteStrokeWidth
          aria-hidden
        />
      </button>

      <AnimatePresence>
        {open ? (
          <div className="absolute top-full right-0 z-50 pt-2">
            <motion.div
              id={listId}
              role="menu"
              aria-label="Sort options"
              tabIndex={-1}
              onKeyDown={onMenuKeyDown}
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
              <span
                className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-70"
                style={{
                  background: `linear-gradient(
                    120deg,
                    transparent 0%,
                    color-mix(in srgb, var(--gold) 18%, transparent) 28%,
                    transparent 48%,
                    color-mix(in srgb, var(--brand-red) 14%, transparent) 68%,
                    transparent 100%
                  )`,
                }}
                aria-hidden
              />
              <div className="relative flex flex-col gap-0.5" role="none">
                {SORT_OPTIONS.map((option, index) => {
                  const selected = value === option.value;
                  return (
                    <motion.button
                      key={option.value}
                      type="button"
                      role="menuitemradio"
                      aria-checked={selected}
                      initial={
                        reduceMotion
                          ? false
                          : { opacity: 0, x: 8 }
                      }
                      animate={{ opacity: 1, x: 0 }}
                      transition={
                        reduceMotion
                          ? { duration: 0 }
                          : {
                              delay: 0.03 + index * 0.028,
                              type: "spring",
                              stiffness: 480,
                              damping: 32,
                            }
                      }
                      whileHover={reduceMotion ? undefined : { x: 3 }}
                      whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                        selected
                          ? "bg-[color-mix(in_srgb,var(--brand-red)_18%,transparent)] text-ink"
                          : "text-ink/85 hover:bg-ink/8"
                      }`}
                      onClick={() => select(option.value)}
                    >
                      <span
                        className={`grid size-3.5 shrink-0 place-items-center rounded-full border ${
                          selected
                            ? "border-[color:var(--brand-red)]"
                            : "border-[color-mix(in_srgb,var(--ink)_28%,transparent)]"
                        }`}
                        aria-hidden
                      >
                        {selected ? (
                          <span className="size-1.5 rounded-full bg-[color:var(--brand-red)]" />
                        ) : null}
                      </span>
                      {option.label}
                    </motion.button>
                  );
                })}
              </div>

              <div
                className="relative my-1.5 h-px bg-[color-mix(in_srgb,var(--ink)_14%,transparent)]"
                role="separator"
                aria-hidden
              />

              <motion.button
                type="button"
                role="menuitem"
                whileHover={reduceMotion ? undefined : { x: 3 }}
                whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                className="relative w-full rounded-lg px-3 py-2 text-left text-sm text-muted transition-colors hover:bg-ink/8 hover:text-ink"
                onClick={clearAll}
              >
                Clear all
              </motion.button>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
