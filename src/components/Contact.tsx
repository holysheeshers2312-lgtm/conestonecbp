"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { mailHref, site, telHref } from "@/data/site";

gsap.registerPlugin(ScrollTrigger);

export function Contact() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      if (reduced) return;
      gsap.from(".contact-card", {
        opacity: 0,
        y: 28,
        duration: 0.65,
        stagger: 0.1,
        ease: "power3.out",
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
        <span className="brush-banner">Get in touch</span>
        <h2
          id="contact-heading"
          className="mt-6 font-display text-3xl font-semibold text-ink md:text-5xl"
        >
          Contact us
        </h2>
        <p className="mt-4 max-w-xl text-muted">
          Reach ConeStone CBP for bookings, catering, or general questions.
        </p>

        <div className="mt-12 flex flex-col gap-5 sm:flex-row sm:gap-6">
          <a
            href={telHref(site.primaryPhone.phone)}
            className="contact-card contact-pill group"
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

          <a href={mailHref()} className="contact-card contact-pill group">
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
