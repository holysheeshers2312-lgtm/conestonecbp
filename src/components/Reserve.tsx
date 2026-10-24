"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { site, telHref } from "@/data/site";
import { SectionLabel } from "@/components/SectionLabel";
import { SectionTitle } from "@/components/SectionTitle";

gsap.registerPlugin(ScrollTrigger);

export function Reserve() {
  const root = useRef<HTMLElement>(null);
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState("2");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [sentHint, setSentHint] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      if (reduced) return;
      gsap.from(".reserve-panel > *", {
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

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent(
      `Table reservation request — ${site.name}`,
    );
    const body = encodeURIComponent(
      [
        `Name: ${name}`,
        `Phone: ${phone}`,
        `Email: ${email}`,
        `Date: ${date || "(not selected)"}`,
        `Guests: ${guests}`,
        notes ? `Notes: ${notes}` : "",
        "",
        "Sent from the ConeStone CBP website reservation form.",
        "Please confirm availability with the guest.",
      ]
        .filter(Boolean)
        .join("\n"),
    );
    window.location.href = `mailto:${site.email}?subject=${subject}&body=${body}`;
    setSentHint(true);
  }

  return (
    <section
      ref={root}
      id="reserve"
      className="border-t border-[color:var(--line)] bg-cream-deep/40 py-20 md:py-28"
      aria-labelledby="reserve-heading"
    >
      <div className="reserve-panel mx-auto max-w-6xl px-5 md:px-8">
        <SectionLabel>Reservations</SectionLabel>
        <SectionTitle id="reserve-heading">Reserve a table</SectionTitle>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
          Send a booking request and we will confirm with you. For larger
          parties, please call{" "}
          <a
            href={telHref(site.primaryPhone.phone)}
            className="font-semibold text-brand-red hover:underline"
          >
            +65 {site.primaryPhone.display}
          </a>{" "}
          or email{" "}
          <a
            href={`mailto:${site.email}`}
            className="font-semibold text-brand-red hover:underline"
          >
            {site.email}
          </a>
          .
        </p>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <form
            onSubmit={onSubmit}
            className="surface-card grid gap-5 p-6 md:p-8"
          >
            <label className="grid gap-2 text-sm">
              <span className="font-semibold text-ink">Date</span>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="min-h-12 border border-[color:var(--line)] bg-paper px-3 text-ink outline-none focus:border-gold"
              />
            </label>

            <label className="grid gap-2 text-sm">
              <span className="font-semibold text-ink">Guests</span>
              <select
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="min-h-12 border border-[color:var(--line)] bg-paper px-3 text-ink outline-none focus:border-gold"
              >
                {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={String(n)}>
                    {n} {n === 1 ? "guest" : "guests"}
                  </option>
                ))}
                <option value="20+">More than 20 (please call)</option>
              </select>
            </label>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="grid gap-2 text-sm">
                <span className="font-semibold text-ink">Your name</span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="min-h-12 border border-[color:var(--line)] bg-paper px-3 text-ink outline-none focus:border-gold"
                />
              </label>
              <label className="grid gap-2 text-sm">
                <span className="font-semibold text-ink">Mobile number</span>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+65"
                  className="min-h-12 border border-[color:var(--line)] bg-paper px-3 text-ink outline-none focus:border-gold"
                />
              </label>
            </div>

            <label className="grid gap-2 text-sm">
              <span className="font-semibold text-ink">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="min-h-12 border border-[color:var(--line)] bg-paper px-3 text-ink outline-none focus:border-gold"
              />
            </label>

            <label className="grid gap-2 text-sm">
              <span className="font-semibold text-ink">Notes (optional)</span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="border border-[color:var(--line)] bg-paper px-3 py-3 text-ink outline-none focus:border-gold"
              />
            </label>

            <button
              type="submit"
              className="btn-brand inline-flex min-h-12 items-center justify-center px-6 text-sm font-bold uppercase tracking-wide transition-transform hover:scale-[1.01]"
            >
              Submit request
            </button>

            {sentHint ? (
              <p className="text-sm text-muted">
                Your email app should open with the request. If it does not, write
                to {site.email} or call +65 {site.primaryPhone.display}.
              </p>
            ) : (
              <p className="text-xs text-muted">
                This sends a request by email. It does not confirm a table until
                we reply.
              </p>
            )}
          </form>

          <aside className="flex flex-col justify-between gap-8 border border-[color:var(--line)] bg-surface-dark p-6 text-[#f3ede3] md:p-8">
            <div>
              <h3 className="font-display text-2xl">Contact for booking</h3>
              <p className="mt-4 text-sm leading-relaxed text-[#f3ede3]/75">
                To reserve a table for more than 20 guests, please contact us
                directly.
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                <li>
                  <span className="block text-[0.65rem] uppercase tracking-[0.18em] text-[#f3ede3]/55">
                    Mobile
                  </span>
                  <a
                    href={telHref(site.primaryPhone.phone)}
                    className="font-display text-xl text-gold hover:opacity-90"
                  >
                    +65 {site.primaryPhone.display}
                  </a>
                </li>
                <li>
                  <span className="block text-[0.65rem] uppercase tracking-[0.18em] text-[#f3ede3]/55">
                    Email
                  </span>
                  <a
                    href={`mailto:${site.email}`}
                    className="break-all text-gold hover:opacity-90"
                  >
                    {site.email}
                  </a>
                </li>
              </ul>
            </div>
            <p className="text-xs text-[#f3ede3]/5">
              Opening hours are not printed in the menu booklet. Ask when you
              book.
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}
