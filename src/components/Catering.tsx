"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  cateringComplementary,
  cateringPackages,
  cateringPlanningGuide,
  cateringTerms,
  formatPrice,
} from "@/data/menu";

gsap.registerPlugin(ScrollTrigger);

export function Catering() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      if (reduced) return;
      gsap.from(".cater-card", {
        opacity: 0,
        y: 32,
        duration: 0.7,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 78%" },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      id="catering"
      className="border-t border-ink/10 bg-cream-deep/50 py-20 md:py-28"
      aria-labelledby="catering-heading"
    >
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <span className="brush-banner">Amma Kitchen</span>
        <h2
          id="catering-heading"
          className="mt-6 font-display text-3xl font-semibold text-ink md:text-5xl"
        >
          Catering menu
        </h2>
        <p className="mt-4 max-w-xl text-muted">
          Per-head packages from the booklet. Contact us to book.
        </p>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          {cateringPackages.map((pkg) => (
            <article
              key={pkg.id}
              className="cater-card surface-card p-6 md:p-8"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`inline-block h-4 w-4 border-2 ${
                    pkg.dietary === "veg"
                      ? "border-veg bg-veg/20"
                      : "border-nonveg bg-nonveg/20"
                  }`}
                  aria-hidden
                >
                  <span
                    className={`mt-0.5 ml-0.5 block h-2 w-2 rounded-full ${
                      pkg.dietary === "veg" ? "bg-veg" : "bg-nonveg"
                    }`}
                  />
                </span>
                <h3 className="font-display text-2xl text-ink">{pkg.title}</h3>
              </div>
              <p className="mt-3 font-display text-xl text-gold">
                {formatPrice(pkg.pricePerHead)}
                <span className="ml-2 font-sans text-sm text-muted">
                  per head ({pkg.minPeopleNote})
                </span>
              </p>
              <ol className="mt-6 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-ink/85">
                {pkg.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
              {pkg.surchargeNote ? (
                <p className="mt-4 text-sm text-brand-red">{pkg.surchargeNote}</p>
              ) : null}
            </article>
          ))}
        </div>

        <div className="mt-10 grid gap-8 md:grid-cols-2">
          <div>
            <h3 className="font-display text-xl text-ink">Complementary</h3>
            <ul className="mt-3 space-y-1 text-sm text-ink/80">
              {cateringComplementary.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-display text-xl text-ink">Quick planning guide</h3>
            <ul className="mt-3 space-y-2 text-sm text-ink/80">
              {cateringPlanningGuide.map((row) => (
                <li key={row.label} className="flex justify-between gap-4 border-b border-ink/10 pb-2">
                  <span>{row.label}</span>
                  <span className="text-gold">{row.dishes}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-ink/10 pt-8">
          <h3 className="font-display text-xl text-ink">Terms & conditions</h3>
          <ul className="mt-3 max-w-3xl space-y-2 text-sm leading-relaxed text-muted">
            {cateringTerms.map((term) => (
              <li key={term}>{term}</li>
            ))}
          </ul>
          <a
            href="#contact"
            className="btn-contact mt-8 inline-flex min-h-12 items-center px-6 text-sm font-semibold"
          >
            Contact us to book
          </a>
        </div>
      </div>
    </section>
  );
}
