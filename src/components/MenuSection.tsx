"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { formatPrice, menuCategories } from "@/data/menu";
import AnimatedList, { type AnimatedListItem } from "@/components/AnimatedList";
import JellyRadio from "@/components/JellyRadio";
import { SectionLabel } from "@/components/SectionLabel";
import { SectionTitle } from "@/components/SectionTitle";

gsap.registerPlugin(ScrollTrigger);

type Filter = "all" | "food" | "drinks";
type SiteTheme = "light" | "dark";

const FILTER_ITEMS = [
  { value: "all", label: "All" },
  { value: "food", label: "Food" },
  { value: "drinks", label: "Drinks" },
];

function readSiteTheme(): SiteTheme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.getAttribute("data-theme") === "dark"
    ? "dark"
    : "light";
}

export function MenuSection() {
  const root = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [activeId, setActiveId] = useState(menuCategories[0]?.id ?? "");
  const [siteTheme, setSiteTheme] = useState<SiteTheme>("light");

  const visible = useMemo(() => {
    if (filter === "all") return menuCategories;
    return menuCategories.filter((c) => c.group === filter);
  }, [filter]);

  const active = visible.find((c) => c.id === activeId) ?? visible[0];
  const selectedIndex = Math.max(
    0,
    visible.findIndex((c) => c.id === (active?.id ?? activeId)),
  );

  const categoryItems = useMemo<AnimatedListItem[]>(
    () =>
      visible.map((cat) => ({
        id: cat.id,
        title: cat.title,
        description: `${cat.items.length} item${cat.items.length === 1 ? "" : "s"}`,
        meta: cat.group === "food" ? "Food" : "Drink",
      })),
    [visible],
  );

  useEffect(() => {
    setSiteTheme(readSiteTheme());
    const mo = new MutationObserver(() => setSiteTheme(readSiteTheme()));
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => mo.disconnect();
  }, []);

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
        <SectionLabel>Full menu</SectionLabel>
        <SectionTitle id="menu-heading">Everything from the booklet</SectionTitle>
        <p className="mt-4 max-w-xl text-muted">
          Names, descriptions, and prices match the Cone Stone menu PDF.
        </p>

        <div className="mt-8 -ml-2 overflow-x-auto">
          <JellyRadio
            items={FILTER_ITEMS}
            value={filter}
            onChange={(value) => setFilter(value as Filter)}
            ariaLabel="Menu filter"
            size="lg"
            gap={10}
            radius={999}
            swell={0.14}
            barge={5}
            shrink={0.04}
            jelly={0.85}
            bounce={0.28}
            chipColor="color-mix(in srgb, var(--ink) 8%, var(--elevated))"
            activeColor="var(--brand-red)"
            textColor="var(--ink)"
            activeTextColor="var(--on-brand)"
          />
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[280px_1fr] lg:gap-10">
          <div className="min-w-0 lg:sticky lg:top-24 lg:self-start">
            <AnimatedList
              key={filter}
              items={categoryItems}
              initialSelectedIndex={selectedIndex}
              onItemSelect={(item) => {
                if (item && typeof item === "object" && item.id != null) {
                  setActiveId(String(item.id));
                }
              }}
              selectOnHover={false}
              enableArrowNavigation
              animation="pop"
              animateOnce={false}
              stagger={0.045}
              showGradients
              fadeSize={48}
              displayScrollbar={false}
              frame
              theme={siteTheme}
              accentColor="var(--brand-red)"
              radius={16}
              gap={8}
              width="100%"
              maxHeight={420}
              className="menu-category-list"
              style={
                siteTheme === "light"
                  ? {
                      "--al-frame":
                        "color-mix(in srgb, var(--ink) 5%, var(--elevated))",
                      "--al-tile":
                        "linear-gradient(180deg, color-mix(in srgb, var(--paper) 70%, white) 0%, var(--elevated) 100%)",
                      "--al-ink": "var(--ink)",
                      "--al-muted": "var(--quiet)",
                    }
                  : {
                      "--al-frame":
                        "color-mix(in srgb, var(--elevated) 88%, transparent)",
                      "--al-ink": "var(--ink)",
                      "--al-muted": "var(--quiet)",
                    }
              }
            />
          </div>

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
