"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { mailHref, site, telHref } from "@/data/site";
import { SectionLabel } from "@/components/SectionLabel";
import { SectionTitle } from "@/components/SectionTitle";

gsap.registerPlugin(ScrollTrigger);

export function Contact() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      if (reduced) return;
      gsap.from(".contact-card", {
        opacity: 0,
        duration: 0.7,
        stagger: 0.12,
        ease: "power3.out",
        clearProps: "opacity",
        scrollTrigger: { trigger: root.current, start: "top 80%" },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      id="contact"
      className="border-t border-[color:var(--line)] bg-paper py-20 md:py-28"
      aria-labelledby="contact-heading"
    >
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <SectionLabel>Get in touch</SectionLabel>
        <SectionTitle id="contact-heading">Contact us</SectionTitle>
        <p className="mt-4 max-w-xl text-muted">
          Reach ConeStone CBP for bookings, catering, or general questions.
        </p>

        <div className="mt-12 flex flex-col gap-5 sm:flex-row sm:gap-6">
          <a
            href={telHref(site.primaryPhone.phone)}
            className="contact-card contact-pill group flex-1 rounded-full border border-[color:var(--line)] bg-elevated px-7 py-5 text-center shadow-[0_8px_24px_rgba(42,31,24,0.08)]"
          >
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-muted">
              Mobile number
            </p>
            <p className="mt-2 font-display text-2xl text-brand-red md:text-3xl">
              +65 {site.primaryPhone.display}
            </p>
            <p className="mt-1 text-sm text-muted">
              {site.primaryPhone.name}
              {site.contacts[1]
                ? ` · also ${site.contacts[1].name} ${site.contacts[1].display}`
                : ""}
            </p>
          </a>

          <a
            href={mailHref()}
            className="contact-card contact-pill group flex-1 rounded-full border border-[color:var(--line)] bg-elevated px-7 py-5 text-center shadow-[0_8px_24px_rgba(42,31,24,0.08)]"
          >
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-muted">
              Email
            </p>
            <p className="mt-2 break-all font-display text-xl text-brand-red md:text-2xl">
              {site.email}
            </p>
            <p className="mt-1 text-sm text-muted">
              We reply as soon as we can during service hours.
            </p>
          </a>
        </div>

        <p className="mt-8 text-sm text-muted">
          Prefer a form?{" "}
          <a href="#reserve" className="font-semibold text-gold hover:text-brand-red">
            Reserve a table
          </a>
          .
        </p>
      </div>
    </section>
  );
}
