"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Props = {
  children: string;
  className?: string;
};

/** Editorial section eyebrow — gold rule + tracked uppercase (not the old brush badge). */
export function SectionLabel({ children, className = "" }: Props) {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const rule = el.querySelector<HTMLElement>("[data-rule]");
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, x: -12 },
        {
          opacity: 1,
          x: 0,
          duration: 0.55,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 92%", once: true },
        },
      );
      if (rule) {
        gsap.fromTo(
          rule,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 0.65,
            ease: "power3.out",
            delay: 0.08,
            scrollTrigger: { trigger: el, start: "top 92%", once: true },
          },
        );
      }
    }, el);

    return () => ctx.revert();
  }, [children]);

  return (
    <p
      ref={ref}
      className={`m-0 inline-flex items-center gap-3.5 ${className}`.trim()}
    >
      <span
        data-rule
        aria-hidden
        className="block h-[2px] w-7 shrink-0 origin-left bg-gold"
      />
      <span className="text-[0.68rem] font-bold uppercase leading-none tracking-[0.22em] text-gold">
        {children}
      </span>
    </p>
  );
}
