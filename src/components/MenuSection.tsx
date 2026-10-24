"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { formatPrice, menuCategories } from "@/data/menu";

gsap.registerPlugin(ScrollTrigger);

type Filter = "all" | "food" | "drinks";

export function MenuSection() {
  const root = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [activeId, setActiveId] = useState(menuCategories[0]?.id ?? "");

  const visible = useMemo(() => {
    if (filter === "all") return menuCategories;
    return menuCategories.filter((c) => c.group === filter);
  }, [filter]);

  const active = visible.find((c) => c.id === activeId) ?? visible[0];

  useEffect(() => {
    if (!visible.some((c) => c.id === activeId) && visible[0]) {
      setActiveId(visible[0].id);
    }
  }, [visible, activeId]);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      if (reduced || !listRef.current) return;
      const items = listRef.current.querySelectorAll(".menu-row");
      gsap.fromTo(
        items,
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          stagger: 0.035,
          ease: "power2.out",
        },
      );
    }, root);
    return () => ctx.revert();
  }, [active?.id]);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      if (reduced) return;
      gsap.from(".menu-shell", {
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 80%" },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      id="menu"
      className="border-t border-ink/10 bg-paper py-20 md:py-28"
      aria-labelledby="menu-heading"
    >
      <div className="menu-shell mx-auto max-w-6xl px-5 md:px-8">
        <span className="brush-banner">Full menu</span>
        <h2
          id="menu-heading"
          className="mt-6 font-display text-3xl font-semibold text-ink md:text-5xl"
        >
          Everything from the booklet
        </h2>
        <p className="mt-4 max-w-xl text-muted">
          Names, descriptions, and prices match the Cone Stone menu PDF.
        </p>

        <div
          className="mt-8 flex flex-wrap gap-2"
          role="group"
          aria-label="Menu filter"
        >
          {(
            [
              ["all", "All"],
              ["food", "Food"],
              ["drinks", "Drinks"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={`min-h-11 px-4 text-sm font-semibold transition-colors ${
                filter === id
                  ? "bg-ink text-paper"
                  : "border border-[color:var(--line)] text-ink hover:border-ink/50"
              }`}
              aria-pressed={filter === id}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[240px_1fr]">
          <nav
            className="flex gap-2 overflow-x-auto pb-2 lg:sticky lg:top-24 lg:flex-col lg:overflow-visible lg:pb-0"
            aria-label="Menu categories"
          >
            {visible.map((cat) => {
              const isActive = cat.id === active?.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveId(cat.id)}
                  className={`relative min-h-11 shrink-0 px-3 text-left text-sm font-medium transition-colors lg:w-full ${
                    isActive ? "text-brand-red" : "text-ink/70 hover:text-ink"
                  }`}
                  aria-current={isActive ? "true" : undefined}
                >
                  <span
                    className={`absolute bottom-0 left-0 h-0.5 bg-gold transition-all duration-300 lg:top-0 lg:h-full lg:w-0.5 ${
                      isActive ? "w-full lg:opacity-100" : "w-0 lg:opacity-0"
                    }`}
                    aria-hidden
                  />
                  <span className="lg:pl-3">{cat.title}</span>
                </button>
              );
            })}
          </nav>

          <div ref={listRef}>
            {active ? (
              <>
                <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-ink/10 pb-4">
                  <h3 className="font-display text-2xl text-ink md:text-3xl">
                    {active.title}
                  </h3>
                  {active.blurb ? (
                    <p className="text-sm text-muted">{active.blurb}</p>
                  ) : null}
                </div>
                <ul className="divide-y divide-ink/10">
                  {active.items.map((item) => (
                    <li
                      key={item.id}
                      className="menu-row flex flex-col gap-2 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-8"
                    >
                      <div className="min-w-0">
                        <h4 className="font-display text-lg text-ink">
                          {item.name}
                        </h4>
                        {item.description ? (
                          <p className="mt-1 text-sm leading-relaxed text-muted">
                            {item.description}
                          </p>
                        ) : null}
                        {item.note ? (
                          <p className="mt-1 text-xs text-gold">{item.note}</p>
                        ) : null}
                      </div>
                      <div className="price shrink-0 text-right text-base sm:pt-1">
                        {item.prices.map((price, i) => (
                          <span key={`${item.id}-${price.label}-${i}`}>
                            {i > 0 ? " / " : null}
                            {price.label ? (
                              <span className="mr-1 text-xs font-sans font-medium uppercase tracking-wide text-muted">
                                {price.label}
                              </span>
                            ) : null}
                            {formatPrice(price.amount)}
                          </span>
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
