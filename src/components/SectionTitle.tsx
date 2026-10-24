"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Props = {
  id?: string;
  children: string;
  className?: string;
};

/** Reliable scroll reveal for section headings (replaces brittle React Bits enter-mode). */
export function SectionTitle({ id, children, className = "" }: Props) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const words = el.querySelectorAll<HTMLElement>("[data-word]");
    const ctx = gsap.context(() => {
      gsap.fromTo(
        words,
        { opacity: 0.12, y: 18, filter: "blur(6px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.7,
          stagger: 0.045,
          ease: "power3.out",
          clearProps: "filter",
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            once: true,
          },
        },
      );
    }, el);

    return () => ctx.revert();
  }, [children]);

  const parts = children.split(/(\s+)/);

  return (
    <h2
      ref={ref}
      id={id}
      className={`mt-6 font-display text-3xl font-semibold leading-tight text-ink md:text-5xl ${className}`.trim()}
    >
      {parts.map((part, i) =>
        part.trim() === "" ? (
          part
        ) : (
          <span key={`${part}-${i}`} className="inline-block" data-word>
            {part}
          </span>
        ),
      )}
    </h2>
  );
}
