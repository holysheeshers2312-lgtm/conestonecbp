"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { site } from "@/data/site";
import { SectionLabel } from "@/components/SectionLabel";
import { SectionTitle } from "@/components/SectionTitle";

gsap.registerPlugin(ScrollTrigger);

export function Intro() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      if (reduced) return;
      gsap.from(".intro-copy > p", {
        opacity: 0,
        y: 28,
        duration: 0.7,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 80%" },
      });
      gsap.from(".intro-mark", {
        opacity: 0,
        x: 40,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 75%" },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      id="intro"
      className="relative overflow-hidden border-y border-ink/10 bg-cream-deep/40 py-20 md:py-28"
    >
      <div className="mx-auto grid max-w-6xl gap-12 px-5 md:grid-cols-12 md:gap-16 md:px-8">
        <div className="intro-copy md:col-span-7">
          <SectionLabel>About</SectionLabel>
          <SectionTitle>Two names, one kitchen</SectionTitle>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-ink/80 md:text-lg">
            <strong className="font-semibold text-brand-red">{site.name}</strong>{" "}
            is the Changi Business Park spot for tea, coffee, juice, chaat,
            tiffins, snacks, beers, and more.{" "}
            <strong className="font-semibold text-brand-red">
              {site.kitchenBrand}
            </strong>{" "}
            brings traditional cooking and catering from the same booklet.
          </p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
            Address and contacts below are taken from the restaurant menu
            booklet. Opening hours are not listed there yet.
          </p>
        </div>
        <aside className="intro-mark flex flex-col justify-center md:col-span-5">
          <div className="surface-card p-8 md:p-10">
            <p className="font-display text-2xl text-brand-red">{site.kitchenBrand}</p>
            <p className="mt-2 text-sm uppercase tracking-[0.2em] text-muted">
              {site.tagline}
            </p>
            <p className="mt-6 text-sm leading-relaxed text-ink/75">
              Tea · Coffee · Juice · Chaat · Tiffins · Snacks · Beers and more
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
