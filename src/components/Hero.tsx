"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { site } from "@/data/site";

export function Hero() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set(
          [".hero-brand", ".hero-line", ".hero-sub", ".hero-cta", ".hero-scroll"],
          { opacity: 1, y: 0 },
        );
        gsap.set(".hero-photo-inner", { scale: 1 });
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(
          ".hero-photo-inner",
          { scale: 1.08 },
          { scale: 1, duration: 1.15, ease: "power2.out" },
          0,
        )
        .fromTo(
          ".hero-brand",
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.7 },
          0.15,
        )
        .fromTo(
          ".hero-line",
          { opacity: 0, y: 28 },
          { opacity: 1, y: 0, duration: 0.7, stagger: 0.08 },
          "-=0.35",
        )
        .fromTo(
          ".hero-sub",
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.55 },
          "-=0.35",
        )
        .fromTo(
          ".hero-cta",
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 },
          "-=0.25",
        )
        .fromTo(
          ".hero-scroll",
          { opacity: 0 },
          { opacity: 1, duration: 0.5 },
          "-=0.2",
        );
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      id="top"
      className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden pb-16 pt-24 md:justify-center md:pb-24 md:pt-20"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="hero-wash absolute inset-0" />
        <div className="hero-photo absolute inset-0 z-[1] md:inset-y-[6%] md:right-0 md:left-[40%]">
          <div className="hero-photo-inner absolute inset-0">
            <Image
              src="/images/hero-food.jpg"
              alt="Placeholder food photograph. Replace with ConeStone photography."
              fill
              priority
              sizes="(max-width: 768px) 100vw, 60vw"
              className="object-cover object-center"
            />
          </div>
        </div>
        <div className="absolute inset-0 z-[2] bg-gradient-to-t from-paper via-paper/80 to-paper/35 md:bg-gradient-to-r md:from-paper md:from-0% md:via-paper/95 md:via-35% md:to-transparent md:to-58%" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-5 md:px-8">
        <p className="hero-brand font-display text-4xl font-semibold tracking-tight text-brand-red sm:text-5xl md:text-6xl lg:text-7xl">
          {site.name}
        </p>
        <h1 className="mt-4 max-w-xl">
          <span className="hero-line block font-display text-2xl font-medium text-ink sm:text-3xl md:text-4xl">
            {site.kitchenBrand}
          </span>
          <span className="hero-line mt-2 block text-sm uppercase tracking-[0.22em] text-muted">
            {site.tagline}
          </span>
        </h1>
        <p className="hero-sub mt-5 max-w-md text-base leading-relaxed text-ink/80 md:text-lg">
          Andhra kitchen and bar at Changi Business Park. Tiffins, chaat, snacks,
          catering, and drinks from the Cone Stone booklet.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="#menu"
            className="hero-cta btn-gold inline-flex min-h-12 items-center px-6 text-sm font-bold uppercase tracking-wide transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            View menu
          </a>
          <a
            href="#reserve"
            className="hero-cta inline-flex min-h-12 items-center border-2 border-ink/40 bg-transparent px-6 text-sm font-semibold text-ink transition-colors hover:border-brand-red hover:text-brand-red"
          >
            Reserve a table
          </a>
        </div>
      </div>

      <a
        href="#intro"
        className="hero-scroll absolute bottom-6 left-1/2 hidden -translate-x-1/2 text-[0.65rem] uppercase tracking-[0.25em] text-muted md:block"
      >
        Scroll
      </a>
    </section>
  );
}
