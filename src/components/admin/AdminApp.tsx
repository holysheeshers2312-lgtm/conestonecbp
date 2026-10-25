"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { STAFF_MEMBERS, statusLabel, type BookingStatus } from "@/data/booking";
import { site } from "@/data/site";

function guestTelHref(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return `tel:+${digits.startsWith("0") ? digits.slice(1) : digits}`;
}

function guestWhatsAppHref(phone: string, message: string) {
  let digits = phone.replace(/\D/g, "");
  if (digits.length === 8) digits = `65${digits}`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

type StaffInfo = { id: string; name: string };

type Booking = {
  id: string;
  code: string;
  date: string;
  guests: string;
  name: string;
  phone: string;
  email: string;
  notes: string | null;
  status: BookingStatus;
  capacityFlag: boolean;
  createdAt: string;
  updatedAt: string;
};

type Capacity = {
  date: string;
  confirmed: number;
  cap: number;
  remaining: number;
};

type Tab = "needs" | "upcoming" | "today" | "all";

export function AdminApp({
  initialStaff,
}: {
  initialStaff: StaffInfo | null;
}) {
  const [staff, setStaff] = useState<StaffInfo | null>(initialStaff);
  const [loginStaff, setLoginStaff] = useState(STAFF_MEMBERS[0].id);
  const [pin, setPin] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const [tab, setTab] = useState<Tab>("needs");
  const [rows, setRows] = useState<Booking[]>([]);
  const [capacities, setCapacities] = useState<Capacity[]>([]);
  const [todayCapacity, setTodayCapacity] = useState<Capacity | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`/api/admin/reservations?tab=${tab}`);
      const data = await res.json();
      if (!res.ok || !data.ok) {
        if (res.status === 401) setStaff(null);
        setMessage(data.error || "Could not load reservations.");
        return;
      }
      setRows(data.reservations || []);
      setCapacities(data.capacities || []);
      setTodayCapacity(data.todayCapacity || null);
      if (data.staff) {
        setStaff({ id: data.staff.staff, name: data.staff.name });
      }
    } catch {
      setMessage("Network error loading reservations.");
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    if (staff) void load();
  }, [staff, load]);

  async function onLogin(e: FormEvent) {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staff: loginStaff, pin }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setLoginError(data.error || "Login failed.");
        return;
      }
      setStaff(data.staff);
      setPin("");
    } catch {
      setLoginError("Could not reach the server.");
    } finally {
      setLoggingIn(false);
    }
  }

  async function onLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setStaff(null);
    setRows([]);
  }

  async function setStatus(id: string, status: BookingStatus) {
    setActionId(id);
    setMessage("");
    try {
      const res = await fetch(`/api/admin/reservations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setMessage(data.error || "Update failed.");
        return;
      }
      if (data.overCapacity) {
        setMessage("Confirmed — soft daily capacity exceeded (override allowed).");
      } else if (data.warnings?.length) {
        setMessage(data.warnings.join(" "));
      }
      await load();
    } catch {
      setMessage("Network error updating reservation.");
    } finally {
      setActionId(null);
    }
  }

  function capFor(date: string) {
    return capacities.find((c) => c.date === date);
  }

  if (!staff) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-16">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[#8b1e1e]">
          {site.name}
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-fraunces)] text-3xl">
          Staff login
        </h1>
        <p className="mt-2 text-sm text-[#5c4a3d]">
          Enter your PIN to manage table requests.
        </p>
        <form onSubmit={onLogin} className="mt-8 grid gap-4">
          <label className="grid gap-2 text-sm">
            <span className="font-semibold">Staff</span>
            <select
              value={loginStaff}
              onChange={(e) => setLoginStaff(e.target.value as typeof loginStaff)}
              className="min-h-12 border border-[#d9cfc2] bg-white px-3"
            >
              {STAFF_MEMBERS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm">
            <span className="font-semibold">PIN</span>
            <input
              type="password"
              inputMode="numeric"
              autoComplete="current-password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="min-h-12 border border-[#d9cfc2] bg-white px-3 tracking-[0.3em]"
              required
            />
          </label>
          {loginError ? (
            <p className="text-sm text-[#8b1e1e]" role="alert">
              {loginError}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={loggingIn}
            className="min-h-12 bg-[#8b1e1e] px-4 text-sm font-bold uppercase tracking-wide text-white disabled:opacity-70"
          >
            {loggingIn ? "Checking…" : "Enter"}
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 md:px-6">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-[#d9cfc2] pb-5">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[#8b1e1e]">
            {site.name} Admin
          </p>
          <h1 className="mt-1 font-[family-name:var(--font-fraunces)] text-3xl">
            Reservations
          </h1>
          <p className="mt-1 text-sm text-[#5c4a3d]">Signed in as {staff.name}</p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="min-h-10 border border-[#d9cfc2] px-4 text-sm font-semibold"
        >
          Log out
        </button>
      </header>

      {todayCapacity ? (
        <p className="mt-5 text-sm text-[#5c4a3d]">
          Today confirmed covers:{" "}
          <strong className="text-[#2a1f18]">
            {todayCapacity.confirmed} / {todayCapacity.cap}
          </strong>
          {todayCapacity.remaining === 0 ? " · soft cap reached" : null}
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2">
        {(
          [
            ["needs", "Needs action"],
            ["today", "Today"],
            ["upcoming", "Upcoming"],
            ["all", "All"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`min-h-10 px-4 text-sm font-semibold ${
              tab === id
                ? "bg-[#2a1f18] text-[#f7f1e8]"
                : "border border-[#d9cfc2] bg-white"
            }`}
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => void load()}
          className="min-h-10 border border-[#d9cfc2] px-4 text-sm font-semibold"
        >
          Refresh
        </button>
      </div>

      {message ? (
        <p className="mt-4 text-sm text-[#8b1e1e]" role="status">
          {message}
        </p>
      ) : null}

      <div className="mt-6 grid gap-4">
        {loading ? (
          <p className="text-sm text-[#5c4a3d]">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-[#5c4a3d]">No reservations in this view.</p>
        ) : (
          rows.map((row) => {
            const cap = capFor(row.date);
            const busy = actionId === row.id;
            return (
              <article
                key={row.id}
                className="border border-[#d9cfc2] bg-white p-4 md:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-mono text-xs tracking-wide text-[#5c4a3d]">
                      {row.code}
                    </p>
                    <h2 className="mt-1 font-[family-name:var(--font-fraunces)] text-xl">
                      {row.name}
                    </h2>
                    <p className="mt-1 text-sm text-[#5c4a3d]">
                      {row.date} · {row.guests} guests
                      {cap
                        ? ` · day ${cap.confirmed}/${cap.cap} confirmed`
                        : null}
                    </p>
                  </div>
                  <span className="rounded-sm bg-[#f7f1e8] px-2 py-1 text-xs font-semibold uppercase tracking-wide">
                    {statusLabel(row.status)}
                  </span>
                </div>

                {row.capacityFlag ? (
                  <p className="mt-2 text-xs font-semibold text-[#8b1e1e]">
                    Soft capacity flag — confirming may exceed the daily cover cap.
                  </p>
                ) : null}

                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                  <a
                    href={guestTelHref(row.phone)}
                    className="font-semibold text-[#8b1e1e] hover:underline"
                  >
                    Call {row.phone}
                  </a>
                  <a
                    href={guestWhatsAppHref(
                      row.phone,
                      `Hi ${row.name}, regarding your ${site.name} booking ${row.code}…`,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-[#8b1e1e] hover:underline"
                  >
                    WhatsApp
                  </a>
                  <a
                    href={`mailto:${row.email}`}
                    className="text-[#5c4a3d] hover:underline"
                  >
                    {row.email}
                  </a>
                </div>

                {row.notes ? (
                  <p className="mt-3 text-sm text-[#5c4a3d]">Notes: {row.notes}</p>
                ) : null}

                {row.status === "submitted" || row.status === "waitlist" ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void setStatus(row.id, "confirmed")}
                      className="min-h-10 bg-[#2f5d3a] px-3 text-sm font-bold text-white disabled:opacity-60"
                    >
                      Confirm
                    </button>
                    {row.status !== "waitlist" ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void setStatus(row.id, "waitlist")}
                        className="min-h-10 border border-[#d9cfc2] px-3 text-sm font-semibold disabled:opacity-60"
                      >
                        Waitlist
                      </button>
                    ) : null}
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void setStatus(row.id, "declined")}
                      className="min-h-10 border border-[#8b1e1e] px-3 text-sm font-semibold text-[#8b1e1e] disabled:opacity-60"
                    >
                      Decline
                    </button>
                  </div>
                ) : null}

                {row.status === "confirmed" ? (
                  <div className="mt-4">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void setStatus(row.id, "cancelled")}
                      className="min-h-10 border border-[#d9cfc2] px-3 text-sm font-semibold disabled:opacity-60"
                    >
                      Cancel booking
                    </button>
                  </div>
                ) : null}
              </article>
            );
          })
        )}
      </div>
    </main>
  );
}
