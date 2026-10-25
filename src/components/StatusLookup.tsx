"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { canGuestCancel, statusLabel, type BookingStatus } from "@/data/booking";
import { site, telHref } from "@/data/site";

type Booking = {
  id: string;
  code: string;
  date: string;
  guests: string;
  name: string;
  phone: string;
  email: string;
  status: BookingStatus;
};

export function StatusLookup() {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"code" | "phone">("code");
  const [code, setCode] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [label, setLabel] = useState("");

  useEffect(() => {
    const q = searchParams.get("code");
    if (q) {
      setCode(q.toUpperCase());
      setMode("code");
      void lookup({ code: q });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  async function lookup(body: {
    code?: string;
    phone?: string;
    date?: string;
  }) {
    setLoading(true);
    setError("");
    setBooking(null);
    try {
      const res = await fetch("/api/reservations/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "No reservation found.");
        return;
      }
      setBooking(data.booking);
      setLabel(data.statusLabel || statusLabel(data.booking.status));
    } catch {
      setError("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (mode === "code") {
      await lookup({ code });
    } else {
      await lookup({ phone, date });
    }
  }

  async function onCancel() {
    if (!booking) return;
    if (!window.confirm("Cancel this reservation request?")) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/reservations/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel", id: booking.id }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Could not cancel.");
        return;
      }
      setBooking(data.booking);
      setLabel(statusLabel(data.booking.status));
    } catch {
      setError("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-8">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode("code")}
          className={`min-h-10 px-4 text-sm font-semibold ${
            mode === "code"
              ? "bg-[#2a1f18] text-[#f7f1e8]"
              : "border border-[#d9cfc2] bg-white"
          }`}
        >
          Booking code
        </button>
        <button
          type="button"
          onClick={() => setMode("phone")}
          className={`min-h-10 px-4 text-sm font-semibold ${
            mode === "phone"
              ? "bg-[#2a1f18] text-[#f7f1e8]"
              : "border border-[#d9cfc2] bg-white"
          }`}
        >
          Phone + date
        </button>
      </div>

      <form onSubmit={onSubmit} className="mt-5 grid gap-4">
        {mode === "code" ? (
          <label className="grid gap-2 text-sm">
            <span className="font-semibold">Code (e.g. RSV-7K2M)</span>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="min-h-12 border border-[#d9cfc2] bg-white px-3 font-mono tracking-wider"
              required
            />
          </label>
        ) : (
          <>
            <label className="grid gap-2 text-sm">
              <span className="font-semibold">Mobile number</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="min-h-12 border border-[#d9cfc2] bg-white px-3"
                required
              />
            </label>
            <label className="grid gap-2 text-sm">
              <span className="font-semibold">Date</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="min-h-12 border border-[#d9cfc2] bg-white px-3"
                required
              />
            </label>
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className="min-h-12 bg-[#8b1e1e] px-4 text-sm font-bold uppercase tracking-wide text-white disabled:opacity-70"
        >
          {loading ? "Checking…" : "Check status"}
        </button>
      </form>

      {error ? (
        <p className="mt-4 text-sm text-[#8b1e1e]" role="alert">
          {error}
        </p>
      ) : null}

      {booking ? (
        <div className="mt-8 border border-[#d9cfc2] bg-white p-5">
          <p className="font-mono text-xs tracking-wide text-[#5c4a3d]">
            {booking.code}
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-fraunces)] text-2xl">
            {label}
          </h2>
          <dl className="mt-4 grid gap-2 text-sm">
            <div className="flex justify-between gap-4 border-b border-[#efe6da] py-2">
              <dt className="text-[#5c4a3d]">Name</dt>
              <dd className="font-semibold">{booking.name}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-[#efe6da] py-2">
              <dt className="text-[#5c4a3d]">Date</dt>
              <dd className="font-semibold">{booking.date}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-[#efe6da] py-2">
              <dt className="text-[#5c4a3d]">Guests</dt>
              <dd className="font-semibold">{booking.guests}</dd>
            </div>
          </dl>

          {canGuestCancel(booking.status) ? (
            <button
              type="button"
              disabled={loading}
              onClick={() => void onCancel()}
              className="mt-5 min-h-10 border border-[#d9cfc2] px-4 text-sm font-semibold disabled:opacity-60"
            >
              Cancel request
            </button>
          ) : null}

          <p className="mt-5 text-xs text-[#5c4a3d]">
            Questions? Call{" "}
            <a
              href={telHref(site.primaryPhone.phone)}
              className="font-semibold text-[#8b1e1e] hover:underline"
            >
              +65 {site.primaryPhone.display}
            </a>
            .
          </p>
        </div>
      ) : null}
    </div>
  );
}
