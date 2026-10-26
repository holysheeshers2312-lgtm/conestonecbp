"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  LogOut,
  Mail,
  Menu,
  MessageCircle,
  MoreHorizontal,
  Phone,
  Search,
  Users,
  UserX,
  X,
} from "lucide-react";
import {
  ADMIN_STATUS_FILTERS,
  STAFF_MEMBERS,
  statusBadgeClass,
  statusShortLabel,
  type AdminSortMode,
  type AdminStatusFilter,
  type BookingStatus,
  type StaffId,
} from "@/data/booking";
import { site } from "@/data/site";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AdminFilterControl } from "@/components/admin/AdminFilterControl";
import { AdminSortControl } from "@/components/admin/AdminSortControl";

function guestTelHref(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return `tel:+${digits.startsWith("0") ? digits.slice(1) : digits}`;
}

function guestWhatsAppHref(phone: string, message: string) {
  let digits = phone.replace(/\D/g, "");
  if (digits.length === 8) digits = `65${digits}`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

function formatBookingDate(isoDate: string) {
  const parsed = new Date(`${isoDate}T12:00:00+08:00`);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return parsed.toLocaleDateString("en-SG", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Singapore",
  });
}

function todaySg() {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Singapore",
  });
}

function formatToolbarDate(isoDate: string) {
  const parsed = new Date(`${isoDate}T12:00:00+08:00`);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return parsed.toLocaleDateString("en-SG", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Singapore",
  });
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

type Counts = Record<AdminStatusFilter, number>;

const PAGE_SIZE = 8;

export function AdminApp({
  initialStaff,
}: {
  initialStaff: StaffInfo | null;
}) {
  const [staff, setStaff] = useState<StaffInfo | null>(initialStaff);
  const [loginStaff, setLoginStaff] = useState<StaffId>(STAFF_MEMBERS[0].id);
  const [pin, setPin] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const [statusFilter, setStatusFilter] = useState<AdminStatusFilter>("all");
  const [sort, setSort] = useState<AdminSortMode>("date-asc");
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState(todaySg);
  const [rows, setRows] = useState<Booking[]>([]);
  const [counts, setCounts] = useState<Partial<Counts>>({});
  const [todayCapacity, setTodayCapacity] = useState<Capacity | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobileNav, setIsMobileNav] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  function openDatePicker() {
    const input = dateInputRef.current;
    if (!input) return;
    try {
      if (typeof input.showPicker === "function") {
        void input.showPicker();
        return;
      }
    } catch {
      // fall through for browsers that block showPicker
    }
    input.focus();
    input.click();
  }

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const sync = () => {
      setIsMobileNav(mq.matches);
      if (!mq.matches) setSidebarOpen(false);
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setMessage("");
    try {
      const params = new URLSearchParams({
        status: statusFilter,
        sort,
        date: dateFilter,
      });
      const res = await fetch(`/api/admin/reservations?${params}`);
      const data = await res.json();
      if (!res.ok || !data.ok) {
        if (res.status === 401) setStaff(null);
        setMessage(data.error || "Could not load reservations.");
        return;
      }
      setRows(data.reservations || []);
      setCounts(data.counts || {});
      setTodayCapacity(data.dayCapacity || data.todayCapacity || null);
      setSelected(new Set());
      setPage(1);
    } catch {
      setMessage("Network error loading reservations.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, sort, dateFilter]);

  useEffect(() => {
    if (!staff) return;
    void load();
  }, [staff?.id, load]);

  useEffect(() => {
    if (!menuOpenId) return;
    const onPointer = (event: PointerEvent) => {
      if (menuRef.current?.contains(event.target as Node)) return;
      setMenuOpenId(null);
    };
    window.addEventListener("pointerdown", onPointer);
    return () => window.removeEventListener("pointerdown", onPointer);
  }, [menuOpenId]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (row) =>
        row.name.toLowerCase().includes(q) ||
        row.phone.toLowerCase().includes(q) ||
        row.email.toLowerCase().includes(q) ||
        row.code.toLowerCase().includes(q),
    );
  }, [rows, search]);

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const pageRows = filteredRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

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

  async function setStatus(id: string, next: BookingStatus) {
    setActionId(id);
    setMenuOpenId(null);
    setMessage("");
    try {
      const res = await fetch(`/api/admin/reservations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
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

  function toggleSelected(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectPage() {
    const ids = pageRows.map((r) => r.id);
    const allSelected = ids.length > 0 && ids.every((id) => selected.has(id));
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) ids.forEach((id) => next.delete(id));
      else ids.forEach((id) => next.add(id));
      return next;
    });
  }

  if (!staff) {
    return (
      <main className="relative flex min-h-screen items-center justify-center px-5 py-16">
        <div className="absolute right-5 top-5 z-10 md:right-8 md:top-8">
          <ThemeToggle />
        </div>
        <div className="admin-panel w-full max-w-md p-7 md:p-9">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-brand-red">
            {site.name}
          </p>
          <h1 className="mt-3 font-display text-[2rem] leading-tight text-ink md:text-[2.35rem]">
            Staff login
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Choose who you are, then enter your PIN to manage table requests.
          </p>
          <form onSubmit={onLogin} className="mt-8 grid gap-6">
            <fieldset className="grid gap-3">
              <legend className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted">
                Staff
              </legend>
              <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Staff">
                {STAFF_MEMBERS.map((s) => {
                  const active = loginStaff === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setLoginStaff(s.id)}
                      className={`min-h-14 border px-3 text-left transition-all ${
                        active
                          ? "border-brand-red bg-[color-mix(in_srgb,var(--brand-red)_12%,var(--elevated))] shadow-[inset_3px_0_0_var(--brand-red)]"
                          : "border-[color:var(--line)] bg-elevated/60 hover:border-[color-mix(in_srgb,var(--brand-red)_35%,var(--line))]"
                      }`}
                    >
                      <span
                        className={`block text-sm font-semibold ${
                          active ? "text-brand-red" : "text-ink"
                        }`}
                      >
                        {s.name}
                      </span>
                      <span className="mt-0.5 block text-[0.7rem] text-muted">
                        PIN access
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
            <label className="grid gap-2">
              <span className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted">
                PIN
              </span>
              <input
                type="password"
                inputMode="numeric"
                autoComplete="current-password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                className="min-h-14 border border-[color:var(--line)] bg-elevated/70 px-4 font-mono text-lg tracking-[0.45em] text-ink outline-none transition-colors placeholder:text-muted/50 focus:border-brand-red"
                required
              />
            </label>
            {loginError ? (
              <p className="text-sm text-brand-red" role="alert">
                {loginError}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={loggingIn}
              className="btn-brand min-h-14 px-4 text-sm font-bold uppercase tracking-[0.14em] disabled:opacity-70"
            >
              {loggingIn ? "Checking…" : "Enter"}
            </button>
          </form>
        </div>
      </main>
    );
  }

  const capacityPct = todayCapacity
    ? Math.min(
        100,
        Math.round((todayCapacity.confirmed / Math.max(1, todayCapacity.cap)) * 100),
      )
    : 0;

  const stats = [
    {
      key: "confirmed",
      label: "Confirmed",
      value: counts.confirmed ?? 0,
      icon: CheckCircle2,
      tone: "ok" as const,
      filter: "confirmed" as AdminStatusFilter,
    },
    {
      key: "needs",
      label: "Needs action",
      value: counts.needs ?? 0,
      icon: Clock3,
      tone: "new" as const,
      filter: "needs" as AdminStatusFilter,
    },
    {
      key: "waitlist",
      label: "Waitlist",
      value: counts.waitlist ?? 0,
      icon: Users,
      tone: "wait" as const,
      filter: "waitlist" as AdminStatusFilter,
    },
    {
      key: "cancelled",
      label: "Cancelled",
      value: counts.cancelled ?? 0,
      icon: UserX,
      tone: "bad" as const,
      filter: "cancelled" as AdminStatusFilter,
    },
  ];

  return (
    <div className="admin-dash">
      {sidebarOpen && isMobileNav ? (
        <button
          type="button"
          className="admin-sidebar-backdrop"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <aside className={`admin-sidebar ${sidebarOpen ? "is-open" : ""}`}>
        <div className="admin-sidebar__brand">
          <p className="font-display text-xl text-ink">{site.name}</p>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted">
            Admin
          </p>
        </div>

        <nav className="admin-sidebar__nav" aria-label="Admin">
          <button type="button" className="admin-nav-item is-active">
            <CalendarDays className="size-4" aria-hidden />
            Reservations
          </button>
        </nav>

        <div className="admin-sidebar__foot">
          <div className="admin-sidebar__user">
            <div className="admin-avatar" aria-hidden>
              {staff.name.slice(0, 1)}
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">{staff.name}</p>
              <p className="text-xs text-muted">Staff</p>
            </div>
          </div>
          <button type="button" onClick={onLogout} className="admin-nav-item">
            <LogOut className="size-4" aria-hidden />
            Log out
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          {isMobileNav ? (
            <button
              type="button"
              className="admin-icon-btn admin-menu-toggle"
              aria-label="Open menu"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="size-[18px]" />
            </button>
          ) : null}

          <label className="admin-search">
            <Search className="size-4 text-muted" aria-hidden />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name, phone, or email…"
              className="admin-search__input"
            />
            {search ? (
              <button
                type="button"
                className="text-muted hover:text-ink"
                aria-label="Clear search"
                onClick={() => setSearch("")}
              >
                <X className="size-4" />
              </button>
            ) : null}
          </label>

          <button
            type="button"
            className="admin-date-chip"
            aria-label="Filter by reservation date"
            onClick={openDatePicker}
          >
            <span className="admin-date-chip__label">
              {formatToolbarDate(dateFilter)}
            </span>
            <ChevronDown className="admin-date-chip__caret size-4" aria-hidden />
            <input
              ref={dateInputRef}
              type="date"
              value={dateFilter}
              onChange={(e) => {
                if (!e.target.value) return;
                setDateFilter(e.target.value);
                setPage(1);
              }}
              onClick={(e) => e.stopPropagation()}
              className="admin-date-chip__input"
              tabIndex={-1}
              aria-hidden
            />
          </button>

          <ThemeToggle />
        </header>

        <div className="admin-content">
          <div className="mb-6">
            <h1 className="font-display text-3xl text-ink md:text-4xl">
              Reservations
            </h1>
            <p className="mt-1 text-sm text-muted">
              Manage and track all restaurant table requests.
            </p>
          </div>

          <div className="admin-stats">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <button
                  key={stat.key}
                  type="button"
                  onClick={() => setStatusFilter(stat.filter)}
                  className={`admin-stat admin-stat--${stat.tone} ${
                    statusFilter === stat.filter ? "is-active" : ""
                  }`}
                >
                  <span className="admin-stat__icon">
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <span className="admin-stat__label">{stat.label}</span>
                  <span className="admin-stat__value">{stat.value}</span>
                </button>
              );
            })}
            <div className="admin-stat admin-stat--capacity">
              <span className="admin-stat__label">Total capacity</span>
              <span className="admin-stat__value">
                {todayCapacity?.confirmed ?? 0}
                <span className="text-base font-normal text-muted">
                  {" "}
                  / {todayCapacity?.cap ?? 40}
                </span>
              </span>
              <div className="admin-capacity-track mt-3">
                <div
                  className="admin-capacity-fill"
                  style={{ width: `${capacityPct}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-muted">
                {todayCapacity?.remaining ?? 40} covers remaining this day
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {ADMIN_STATUS_FILTERS.map((item) => {
                const count = counts[item.id];
                const active = statusFilter === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    data-active={active ? "true" : "false"}
                    onClick={() => setStatusFilter(item.id)}
                    className="admin-pill"
                  >
                    {item.label}
                    {typeof count === "number" ? (
                      <span className="admin-pill__count">{count}</span>
                    ) : null}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-2">
              <AdminFilterControl
                value={statusFilter}
                counts={counts}
                onChange={setStatusFilter}
              />
              <AdminSortControl value={sort} onChange={setSort} />
            </div>
          </div>

          {message ? (
            <p className="mt-4 border border-[color-mix(in_srgb,var(--brand-red)_28%,var(--line))] bg-[color-mix(in_srgb,var(--brand-red)_8%,transparent)] px-4 py-3 text-sm text-brand-red">
              {message}
            </p>
          ) : null}

          <div className={`admin-table-wrap mt-5 ${loading ? "is-loading" : ""}`}>
            <div className="admin-table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th className="w-10">
                      <input
                        type="checkbox"
                        checked={
                          pageRows.length > 0 &&
                          pageRows.every((r) => selected.has(r.id))
                        }
                        onChange={toggleSelectPage}
                        aria-label="Select page"
                      />
                    </th>
                    <th>Guest</th>
                    <th>Date</th>
                    <th>Guests</th>
                    <th>Status</th>
                    <th>Contact</th>
                    <th>Notes</th>
                    <th className="w-12">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="admin-table-empty">
                        {loading
                          ? "Loading reservations…"
                          : "No reservations match this view."}
                      </td>
                    </tr>
                  ) : (
                    pageRows.map((row) => {
                      const busy = actionId === row.id;
                      return (
                        <tr key={row.id}>
                          <td>
                            <input
                              type="checkbox"
                              checked={selected.has(row.id)}
                              onChange={() => toggleSelected(row.id)}
                              aria-label={`Select ${row.name}`}
                            />
                          </td>
                          <td>
                            <p className="font-semibold text-ink">{row.name}</p>
                            <p className="font-mono text-[0.65rem] tracking-wide text-muted">
                              {row.code}
                            </p>
                          </td>
                          <td className="whitespace-nowrap text-sm text-ink">
                            {formatBookingDate(row.date)}
                          </td>
                          <td className="text-sm text-ink">{row.guests}</td>
                          <td>
                            <span className={statusBadgeClass(row.status)}>
                              <span className="admin-badge__dot" aria-hidden />
                              {statusShortLabel(row.status)}
                            </span>
                          </td>
                          <td>
                            <div className="flex flex-wrap items-center gap-2">
                              <a
                                href={guestTelHref(row.phone)}
                                className="admin-link text-xs"
                                title={row.phone}
                              >
                                <Phone className="size-3.5" aria-hidden />
                                {row.phone}
                              </a>
                              <a
                                href={guestWhatsAppHref(
                                  row.phone,
                                  `Hi ${row.name}, regarding your ${site.name} booking ${row.code}…`,
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="admin-link"
                                title="WhatsApp"
                              >
                                <MessageCircle className="size-3.5" aria-hidden />
                              </a>
                              <a
                                href={`mailto:${row.email}`}
                                className="admin-link admin-link--muted"
                                title={row.email}
                              >
                                <Mail className="size-3.5" aria-hidden />
                              </a>
                            </div>
                          </td>
                          <td className="max-w-[12rem] truncate text-sm text-muted">
                            {row.notes || "—"}
                          </td>
                          <td className="relative">
                            <button
                              type="button"
                              disabled={busy}
                              className="admin-icon-btn"
                              aria-label={`Actions for ${row.name}`}
                              onClick={() =>
                                setMenuOpenId((id) =>
                                  id === row.id ? null : row.id,
                                )
                              }
                            >
                              <MoreHorizontal className="size-4" />
                            </button>
                            {menuOpenId === row.id ? (
                              <div ref={menuRef} className="admin-row-menu" role="menu">
                                {(row.status === "submitted" ||
                                  row.status === "waitlist") && (
                                  <>
                                    <button
                                      type="button"
                                      role="menuitem"
                                      onClick={() =>
                                        void setStatus(row.id, "confirmed")
                                      }
                                    >
                                      Confirm
                                    </button>
                                    {row.status !== "waitlist" ? (
                                      <button
                                        type="button"
                                        role="menuitem"
                                        onClick={() =>
                                          void setStatus(row.id, "waitlist")
                                        }
                                      >
                                        Waitlist
                                      </button>
                                    ) : null}
                                    <button
                                      type="button"
                                      role="menuitem"
                                      onClick={() =>
                                        void setStatus(row.id, "declined")
                                      }
                                    >
                                      Decline
                                    </button>
                                  </>
                                )}
                                {row.status === "confirmed" ? (
                                  <button
                                    type="button"
                                    role="menuitem"
                                    onClick={() =>
                                      void setStatus(row.id, "cancelled")
                                    }
                                  >
                                    Cancel booking
                                  </button>
                                ) : null}
                                {row.status !== "submitted" &&
                                row.status !== "waitlist" &&
                                row.status !== "confirmed" ? (
                                  <p className="px-3 py-2 text-xs text-muted">
                                    No actions
                                  </p>
                                ) : null}
                              </div>
                            ) : null}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="admin-table-foot">
              <p className="text-sm text-muted">
                Showing {filteredRows.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}
                –
                {Math.min(page * PAGE_SIZE, filteredRows.length)} of{" "}
                {filteredRows.length} reservation
                {filteredRows.length === 1 ? "" : "s"}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="admin-chip"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Prev
                </button>
                <span className="text-sm text-muted">
                  {page} / {pageCount}
                </span>
                <button
                  type="button"
                  className="admin-chip"
                  disabled={page >= pageCount}
                  onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
