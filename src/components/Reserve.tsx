"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { site, telHref, whatsappHref } from "@/data/site";
import { SectionLabel } from "@/components/SectionLabel";
import { SectionTitle } from "@/components/SectionTitle";

gsap.registerPlugin(ScrollTrigger);

type SubmitState = "idle" | "loading" | "success" | "error";

export function Reserve() {
  const root = useRef<HTMLElement>(null);
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState("2");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");
  const [requestId, setRequestId] = useState("");

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

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    setRequestId("");

    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, guests, name, phone, email, notes }),
      });

      const payload = (await response.json().catch(() => null)) as
        | {
            ok?: boolean;
            error?: string;
            id?: string;
            code?: string;
            capacityWarning?: boolean;
            duplicate?: boolean;
          }
        | null;

      if (!response.ok || !payload?.ok) {
        setStatus("error");
        setMessage(
          payload?.error ||
            "Something went wrong. Please call or WhatsApp us instead.",
        );
        return;
      }

      setStatus("success");
      setRequestId(payload.code || payload.id || "");
      setMessage(
        payload.duplicate
          ? "You already have an open request for this date. Use your booking code to check status."
          : payload.capacityWarning
            ? "Request received. That day is filling up — we will confirm or waitlist you shortly. Check WhatsApp for your code."
            : "Reservation submitted. Please wait until we confirm. We sent your booking code on WhatsApp.",
      );
      setDate("");
      setGuests("2");
      setName("");
      setPhone("");
      setEmail("");
      setNotes("");
    } catch {
      setStatus("error");
      setMessage(
        "Could not reach the server. Please call or WhatsApp us to book.",
      );
    }
  }

  const whatsappBook = whatsappHref(
    site.primaryPhone.phone,
    `Hi ${site.name}, I would like to reserve a table.`,
  );

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
          </a>
          , WhatsApp, or email{" "}
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
                disabled={status === "loading"}
                className="min-h-12 border border-[color:var(--line)] bg-paper px-3 text-ink outline-none focus:border-gold disabled:opacity-60"
              />
            </label>

            <label className="grid gap-2 text-sm">
              <span className="font-semibold text-ink">Guests</span>
              <select
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                disabled={status === "loading"}
                className="min-h-12 border border-[color:var(--line)] bg-paper px-3 text-ink outline-none focus:border-gold disabled:opacity-60"
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
                  disabled={status === "loading"}
                  className="min-h-12 border border-[color:var(--line)] bg-paper px-3 text-ink outline-none focus:border-gold disabled:opacity-60"
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
                  disabled={status === "loading"}
                  className="min-h-12 border border-[color:var(--line)] bg-paper px-3 text-ink outline-none focus:border-gold disabled:opacity-60"
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
                disabled={status === "loading"}
                className="min-h-12 border border-[color:var(--line)] bg-paper px-3 text-ink outline-none focus:border-gold disabled:opacity-60"
              />
            </label>

            <label className="grid gap-2 text-sm">
              <span className="font-semibold text-ink">Notes (optional)</span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                disabled={status === "loading"}
                className="border border-[color:var(--line)] bg-paper px-3 py-3 text-ink outline-none focus:border-gold disabled:opacity-60"
              />
            </label>

            <button
              type="submit"
              disabled={status === "loading"}
              className="btn-brand inline-flex min-h-12 items-center justify-center px-6 text-sm font-bold uppercase tracking-wide transition-transform hover:scale-[1.01] disabled:opacity-70"
            >
              {status === "loading" ? "Sending…" : "Submit request"}
            </button>

            {status === "success" ? (
              <div className="text-sm text-brand-red" role="status">
                <p>{message}</p>
                {requestId ? (
                  <p className="mt-2 font-mono text-base font-semibold tracking-wide text-ink">
                    Reservation ID: {requestId}
                  </p>
                ) : null}
                {requestId ? (
                  <a
                    href={`/reserve/status?code=${encodeURIComponent(requestId)}`}
                    className="mt-2 inline-block font-semibold text-brand-red underline-offset-2 hover:underline"
                  >
                    Check status anytime
                  </a>
                ) : null}
              </div>
            ) : null}

            {status === "error" ? (
              <p className="text-sm text-brand-red" role="alert">
                {message}
              </p>
            ) : null}

            {status === "idle" || status === "loading" ? (
              <p className="text-xs text-muted">
                This sends a request — not a confirmed table. You will get a
                booking code on WhatsApp and can check status on any device.
              </p>
            ) : null}
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
                    WhatsApp
                  </span>
                  <a
                    href={whatsappBook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-display text-xl text-gold hover:opacity-90"
                  >
                    Message us
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
