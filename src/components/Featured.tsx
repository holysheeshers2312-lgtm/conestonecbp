"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { formatPrice, getFeaturedDishes } from "@/data/menu";

gsap.registerPlugin(ScrollTrigger);

export function Featured() {
  const root = useRef<HTMLElement>(null);
  const dishes = getFeaturedDishes();

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      if (reduced) return;
      gsap.from(".featured-item", {
        opacity: 0,
        y: 36,
        duration: 0.65,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 78%" },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="py-20 md:py-28" aria-labelledby="featured-heading">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <span className="brush-banner">From the booklet</span>
        <h2
          id="featured-heading"
          className="mt-6 font-display text-3xl font-semibold text-ink md:text-5xl"
        >
          A few dishes to start with
        </h2>
        <p className="mt-4 max-w-lg text-muted">
          Selected for the menu write-ups, not labeled as bestsellers.
        </p>

        <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {dishes.map((dish) =>
            dish ? (
              <li key={dish.id} className="featured-item border-t border-ink/15 pt-5">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-display text-xl text-ink">{dish.name}</h3>
                  <span className="price text-lg">
                    {dish.prices.map((p) => formatPrice(p.amount)).join(" / ")}
                  </span>
                </div>
                {dish.description ? (
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    {dish.description}
                  </p>
                ) : null}
              </li>
            ) : null,
          )}
        </ul>
      </div>
    </section>
  );
}
