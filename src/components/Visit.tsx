"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { site, telHref } from "@/data/site";

gsap.registerPlugin(ScrollTrigger);

export function Visit() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      if (reduced) return;
      gsap.from(".visit-block > *", {
        opacity: 0,
        y: 24,
        duration: 0.65,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 80%" },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      id="visit"
      className="visit-panel py-20 md:py-28"
      aria-labelledby="visit-heading"
    >
      <div className="visit-block mx-auto max-w-6xl px-5 md:px-8">
        <span className="brush-banner">Visit</span>
        <h2
          id="visit-heading"
          className="mt-6 font-display text-3xl font-semibold md:text-5xl"
        >
          Find us at Changi
        </h2>

        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          <div>
            <p className="text-lg leading-relaxed opacity-90">
              {site.address.line1}
              <br />
              {site.address.line2}
              <br />
              {site.address.city}
            </p>

            <ul className="mt-8 space-y-3">
              {site.contacts.map((c) => (
                <li key={c.phone}>
                  <a
                    href={telHref(c.phone)}
                    className="inline-flex min-h-11 items-center text-gold transition-colors hover:opacity-90"
                  >
                    <span className="font-display text-xl">
                      {c.name} · {c.display}
                    </span>
                  </a>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={site.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold inline-flex min-h-12 items-center px-5 text-sm font-bold uppercase tracking-wide transition-transform hover:scale-[1.02]"
              >
                Open in Maps
              </a>
              <a
                href="#contact"
                className="btn-contact inline-flex min-h-12 items-center px-5 text-sm font-semibold"
              >
                Contact us
              </a>
            </div>

            <p className="visit-muted mt-8 text-sm">
              Opening hours are not printed in the menu booklet. Ask when you
              call. Review us on Google as {site.googleReviewLabel}.
            </p>
          </div>

          <div className="map-frame min-h-64 border p-1 visit-line bg-black/30">
            <iframe
              title="ConeStone CBP map"
              className="h-full min-h-64 w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(
                `${site.address.line1}, ${site.address.line2}, ${site.address.city}`,
              )}&z=16&output=embed`}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
