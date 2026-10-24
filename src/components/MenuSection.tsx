"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { formatPrice, menuCategories, type MenuItem } from "@/data/menu";
import AnimatedList, { type AnimatedListItem } from "@/components/AnimatedList";
import JellyRadio from "@/components/JellyRadio";
import {
  MenuSortControl,
  type MenuSortMode,
} from "@/components/MenuSortControl";
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

function lowestPrice(item: MenuItem): number | null {
  let min: number | null = null;
  for (const price of item.prices) {
    if (!Number.isFinite(price.amount)) continue;
    if (min === null || price.amount < min) min = price.amount;
  }
  return min;
}

function sortMenuItems(items: MenuItem[], mode: MenuSortMode): MenuItem[] {
  if (mode === "default") return items;

  const copy = [...items];

  if (mode === "name-asc" || mode === "name-desc") {
    copy.sort((a, b) => {
      const cmp = a.name.localeCompare(b.name, undefined, {
        sensitivity: "base",
      });
      return mode === "name-asc" ? cmp : -cmp;
    });
    return copy;
  }

  copy.sort((a, b) => {
    const aPrice = lowestPrice(a);
    const bPrice = lowestPrice(b);
    if (aPrice === null && bPrice === null) return 0;
    if (aPrice === null) return 1;
    if (bPrice === null) return -1;
    return mode === "price-asc" ? aPrice - bPrice : bPrice - aPrice;
  });
  return copy;
}

type MenuItemsBlockProps = {
  title: string;
  blurb?: string;
  items: MenuItem[];
};

/** Remount via `key` when category/sort changes; mount-only GSAP (stable empty deps). */
function MenuItemsBlock({ title, blurb, items }: MenuItemsBlockProps) {
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const list = listRef.current;
    if (reduced || !list) return;

    const rows = list.querySelectorAll(".menu-row");
    if (!rows.length) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        rows,
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          stagger: 0.035,
          ease: "power2.out",
        },
      );
    }, list);

    return () => ctx.revert();
  }, []);

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-ink/10 pb-4">
        <h3 className="font-display text-2xl text-ink md:text-3xl">{title}</h3>
        {blurb ? <p className="text-sm text-muted">{blurb}</p> : null}
      </div>
      <ul ref={listRef} className="divide-y divide-ink/10">
        {items.map((item) => (
          <li
            key={item.id}
            className="menu-row flex flex-col gap-2 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-8"
          >
            <div className="min-w-0">
              <h4 className="font-display text-lg text-ink">{item.name}</h4>
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
  );
}

export function MenuSection() {
  const root = useRef<HTMLElement>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [activeId, setActiveId] = useState(menuCategories[0]?.id ?? "");
  const [siteTheme, setSiteTheme] = useState<SiteTheme>("light");
  const [sortMode, setSortMode] = useState<MenuSortMode>("default");

  const visible = useMemo(() => {
    if (filter === "all") return menuCategories;
    return menuCategories.filter((c) => c.group === filter);
  }, [filter]);

  const active = visible.find((c) => c.id === activeId) ?? visible[0];
  const selectedIndex = Math.max(
    0,
    visible.findIndex((c) => c.id === (active?.id ?? activeId)),
  );

  const sortedItems = useMemo(
    () => (active ? sortMenuItems(active.items, sortMode) : []),
    [active, sortMode],
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

        <div className="mt-8 flex items-center gap-3">
          <div className="min-w-0 flex-1 overflow-x-auto -ml-2">
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
          <MenuSortControl value={sortMode} onChange={setSortMode} />
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
                (siteTheme === "light"
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
                    }) as unknown as CSSProperties
              }
            />
          </div>

          <div>
            {active ? (
              <MenuItemsBlock
                key={`${active.id}:${sortMode}`}
                title={active.title}
                blurb={active.blurb}
                items={sortedItems}
              />
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
