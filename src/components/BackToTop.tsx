"use client";

import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";

const SHOW_AFTER_PX = 420;

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > SHOW_AFTER_PX);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goTop = () => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <button
      type="button"
      onClick={goTop}
      aria-label="Back to top"
      tabIndex={visible ? 0 : -1}
      className={`fixed right-5 bottom-5 z-40 grid size-12 place-items-center rounded-full border border-transparent bg-[color:var(--brand-red)] text-[color:var(--on-brand)] shadow-[0_10px_28px_-12px_color-mix(in_srgb,var(--brand-red)_70%,transparent)] transition-[opacity,transform,visibility] duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--brand-red)] md:right-8 md:bottom-8 ${
        visible
          ? "pointer-events-auto visible translate-y-0 opacity-100"
          : "pointer-events-none invisible translate-y-3 opacity-0"
      }`}
    >
      <ChevronUp className="size-6" strokeWidth={2.25} aria-hidden />
    </button>
  );
}
