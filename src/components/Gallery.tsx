"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const shots = [
  {
    src: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=1000&q=80",
    alt: "Placeholder: Indian curry dish. Replace with ConeStone photo.",
  },
  {
    src: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1000&q=80",
    alt: "Placeholder: samosas. Replace with ConeStone photo.",
  },
  {
    src: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1000&q=80",
    alt: "Placeholder: coffee. Replace with ConeStone photo.",
  },
];

export function Gallery() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      if (reduced) return;
      gsap.from(".gallery-shot", {
        opacity: 0,
        clipPath: "inset(8% 8% 8% 8%)",
        duration: 0.9,
        stagger: 0.12,
        ease: "power2.out",
        scrollTrigger: { trigger: root.current, start: "top 78%" },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      className="overflow-hidden py-20 md:py-28"
      aria-labelledby="gallery-heading"
    >
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <span className="brush-banner">Atmosphere</span>
        <h2
          id="gallery-heading"
          className="mt-6 font-display text-3xl font-semibold text-ink md:text-5xl"
        >
          Food mood board
        </h2>
        <p className="mt-4 max-w-lg text-sm text-muted">
          Licensed placeholder images only. Swap these for real ConeStone
          photography when available.
        </p>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {shots.map((shot) => (
            <figure
              key={shot.src}
              className="gallery-shot group relative aspect-[4/5] overflow-hidden border border-[color:var(--line)] bg-cream-deep"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={shot.src}
                alt={shot.alt}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <figcaption className="sr-only">{shot.alt}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
