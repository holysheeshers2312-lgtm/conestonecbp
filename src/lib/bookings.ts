import { and, desc, eq, gte, inArray, sql } from "drizzle-orm";
import {
  canGuestCancel,
  isActiveCapacityStatus,
  parseGuestCount,
  softDailyCoverCap,
  type AdminSortMode,
  type AdminStatusFilter,
  type BookingStatus,
  type StaffId,
} from "@/data/booking";

export type { AdminSortMode, AdminStatusFilter };
import { getDb, isDatabaseConfigured } from "@/lib/db";
import { reservations, type ReservationRow } from "@/lib/db/schema";
import { toWhatsAppChatId } from "@/lib/openwa";

/**
 * Public Reservation ID format: CS-YYMMDD-NNN
 * - CS      = ConeStone
 * - YYMMDD = table date (Asia/Singapore calendar day from the form)
 * - NNN    = sequence for that date (001, 002, …)
 * Example: CS-261027-003
 */
export const RESERVATION_ID_PREFIX = "CS";

export function isBookingStoreReady() {
  return isDatabaseConfigured();
}

export function makeReservationId() {
  return `rsv_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/** YYYY-MM-DD → YYMMDD */
export function reservationDateKey(isoDate: string) {
  const clean = isoDate.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    const now = new Date().toLocaleDateString("en-CA", {
      timeZone: "Asia/Singapore",
    });
    return now.slice(2).replaceAll("-", "");
  }
  return `${clean.slice(2, 4)}${clean.slice(5, 7)}${clean.slice(8, 10)}`;
}

export function formatReservationCode(isoDate: string, sequence: number) {
  const seq = Math.max(1, sequence);
  return `${RESERVATION_ID_PREFIX}-${reservationDateKey(isoDate)}-${String(seq).padStart(3, "0")}`;
}

/** Accept typed IDs with spaces / lowercase / missing dashes. */
export function normalizeReservationCode(raw: string) {
  const compact = raw.trim().toUpperCase().replace(/[\s_]+/g, "");
  const matched = compact.match(/^CS-?(\d{6})-?(\d{1,4})$/);
  if (matched) {
    return `${RESERVATION_ID_PREFIX}-${matched[1]}-${matched[2].padStart(3, "0")}`;
  }
  // Legacy codes (RSV-XXXX) and anything else
  return compact.replace(/-+/g, "-");
}

export async function nextReservationSequence(isoDate: string) {
  const db = getDb();
  const dayKey = reservationDateKey(isoDate);
  const prefix = `${RESERVATION_ID_PREFIX}-${dayKey}-`;

  const rows = await db
    .select({ code: reservations.code })
    .from(reservations)
    .where(eq(reservations.date, isoDate));

  let maxSeq = 0;
  for (const row of rows) {
    if (!row.code.startsWith(prefix)) continue;
    const tail = row.code.slice(prefix.length);
    const n = Number.parseInt(tail, 10);
    if (Number.isFinite(n) && n > maxSeq) maxSeq = n;
  }

  return maxSeq + 1;
}

export async function makeBookingCode(isoDate: string) {
  const sequence = await nextReservationSequence(isoDate);
  return formatReservationCode(isoDate, sequence);
}

export function normalizePhoneDigits(phone: string) {
  return toWhatsAppChatId(phone).replace(/@c\.us$/, "");
}

function expiresAtForDate(date: string) {
  // End of next calendar day after creation intent: day before booking at 23:59 SGT,
  // or 36h from now — whichever is earlier-ish for near-term bookings.
  const bookingDay = new Date(`${date}T15:59:59+08:00`);
  const in36h = new Date(Date.now() + 36 * 60 * 60 * 1000);
  return bookingDay.getTime() < in36h.getTime() ? bookingDay : in36h;
}

export async function getConfirmedCovers(date: string) {
  const db = getDb();
  const rows = await db
    .select({
      total: sql<number>`coalesce(sum(${reservations.guestCount}), 0)`,
    })
    .from(reservations)
    .where(
      and(
        eq(reservations.date, date),
        eq(reservations.status, "confirmed"),
      ),
    );
  return Number(rows[0]?.total || 0);
}

export async function findRecentDuplicate(input: {
  phoneDigits: string;
  date: string;
  guestCount: number;
  withinMinutes?: number;
}) {
  const db = getDb();
  const minutes = input.withinMinutes ?? 15;
  const since = new Date(Date.now() - minutes * 60 * 1000);

  const rows = await db
    .select()
    .from(reservations)
    .where(
      and(
        eq(reservations.phoneDigits, input.phoneDigits),
        eq(reservations.date, input.date),
        eq(reservations.guestCount, input.guestCount),
        gte(reservations.createdAt, since),
        inArray(reservations.status, ["submitted", "waitlist", "confirmed"]),
      ),
    )
    .orderBy(desc(reservations.createdAt))
    .limit(1);

  return rows[0] ?? null;
}

export async function insertReservation(input: {
  date: string;
  guests: string;
  name: string;
  phone: string;
  email: string;
  notes?: string;
}) {
  const db = getDb();
  const guestCount = parseGuestCount(input.guests);
  const phoneDigits = normalizePhoneDigits(input.phone);

  const duplicate = await findRecentDuplicate({
    phoneDigits,
    date: input.date,
    guestCount,
  });
  if (duplicate) {
    return { row: duplicate, duplicate: true as const, capacityFlag: false };
  }

  const confirmed = await getConfirmedCovers(input.date);
  const capacityFlag = confirmed + guestCount > softDailyCoverCap();

  const id = makeReservationId();
  const now = new Date();

  // Retry if two staff/guests collide on the same sequence.
  let inserted: ReservationRow | undefined;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = await makeBookingCode(input.date);
    const row: typeof reservations.$inferInsert = {
      id: attempt === 0 ? id : makeReservationId(),
      code,
      date: input.date,
      guests: input.guests,
      guestCount,
      name: input.name.trim(),
      phone: input.phone.trim(),
      phoneDigits,
      email: input.email.trim().toLowerCase(),
      notes: input.notes?.trim() || null,
      status: "submitted",
      capacityFlag: capacityFlag ? 1 : 0,
      createdAt: now,
      updatedAt: now,
      expiresAt: expiresAtForDate(input.date),
    };

    try {
      const result = await db.insert(reservations).values(row).returning();
      inserted = result[0];
      break;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!/unique|duplicate/i.test(message) || attempt === 4) throw error;
    }
  }

  if (!inserted) {
    throw new Error("Could not allocate a reservation ID.");
  }

  return {
    row: inserted,
    duplicate: false as const,
    capacityFlag,
  };
}

export async function getReservationByCode(code: string) {
  const db = getDb();
  const normalized = normalizeReservationCode(code);
  const rows = await db
    .select()
    .from(reservations)
    .where(eq(reservations.code, normalized))
    .limit(1);
  return rows[0] ?? null;
}

export async function getReservationById(id: string) {
  const db = getDb();
  const rows = await db
    .select()
    .from(reservations)
    .where(eq(reservations.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function lookupReservation(input: {
  code?: string;
  phone?: string;
  date?: string;
}) {
  if (input.code?.trim()) {
    return getReservationByCode(input.code);
  }

  if (!input.phone?.trim() || !input.date?.trim()) return null;

  const db = getDb();
  const phoneDigits = normalizePhoneDigits(input.phone);
  const rows = await db
    .select()
    .from(reservations)
    .where(
      and(
        eq(reservations.phoneDigits, phoneDigits),
        eq(reservations.date, input.date.trim()),
      ),
    )
    .orderBy(desc(reservations.createdAt))
    .limit(1);

  return rows[0] ?? null;
}

export async function listReservations(filter: {
  status?: AdminStatusFilter;
  sort?: AdminSortMode;
  /** When set, list + counts are scoped to this table date (YYYY-MM-DD). */
  date?: string;
}) {
  const db = getDb();
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Singapore",
  });

  const allRows = await db.select().from(reservations);
  const dayRows = filter.date
    ? allRows.filter((r) => r.date === filter.date)
    : allRows;

  const status = filter.status || "needs";

  let rows = dayRows;
  if (status === "needs") {
    rows = dayRows.filter((r) => {
      const pending = r.status === "submitted" || r.status === "waitlist";
      if (!pending) return false;
      // Without a day scope, only upcoming/today needs-action.
      if (!filter.date) return r.date >= today;
      return true;
    });
  } else if (status !== "all") {
    rows = dayRows.filter((r) => r.status === status);
  }

  const sort = filter.sort || "date-asc";
  rows = [...rows].sort((a, b) => {
    switch (sort) {
      case "date-desc":
        return b.date.localeCompare(a.date) || b.createdAt.getTime() - a.createdAt.getTime();
      case "newest":
        return b.createdAt.getTime() - a.createdAt.getTime();
      case "guests-desc":
        return b.guestCount - a.guestCount || a.date.localeCompare(b.date);
      case "name-asc":
        return a.name.localeCompare(b.name) || a.date.localeCompare(b.date);
      case "date-asc":
      default:
        return a.date.localeCompare(b.date) || a.createdAt.getTime() - b.createdAt.getTime();
    }
  });

  const counts = {
    needs: dayRows.filter((r) => {
      const pending = r.status === "submitted" || r.status === "waitlist";
      if (!pending) return false;
      if (!filter.date) return r.date >= today;
      return true;
    }).length,
    submitted: dayRows.filter((r) => r.status === "submitted").length,
    confirmed: dayRows.filter((r) => r.status === "confirmed").length,
    waitlist: dayRows.filter((r) => r.status === "waitlist").length,
    declined: dayRows.filter((r) => r.status === "declined").length,
    cancelled: dayRows.filter((r) => r.status === "cancelled").length,
    all: dayRows.length,
  };

  return { rows, counts };
}

export async function dayCapacity(date: string) {
  const confirmed = await getConfirmedCovers(date);
  const cap = softDailyCoverCap();
  return { date, confirmed, cap, remaining: Math.max(0, cap - confirmed) };
}

export async function updateReservationStatus(input: {
  id: string;
  status: BookingStatus;
  staff: StaffId;
  staffNote?: string;
}) {
  const db = getDb();
  const existing = await getReservationById(input.id);
  if (!existing) return { ok: false as const, error: "Reservation not found." };

  if (
    input.status === "confirmed" &&
    !isActiveCapacityStatus(existing.status as BookingStatus)
  ) {
    const confirmed = await getConfirmedCovers(existing.date);
    // Soft cap: allow override, but flag
    const over =
      confirmed + existing.guestCount > softDailyCoverCap() &&
      existing.status !== "confirmed";
    const updated = await db
      .update(reservations)
      .set({
        status: input.status,
        updatedBy: input.staff,
        staffNote: input.staffNote?.trim() || existing.staffNote,
        capacityFlag: over || existing.capacityFlag ? 1 : 0,
        updatedAt: new Date(),
      })
      .where(eq(reservations.id, input.id))
      .returning();
    return { ok: true as const, row: updated[0], overCapacity: over };
  }

  const updated = await db
    .update(reservations)
    .set({
      status: input.status,
      updatedBy: input.staff,
      staffNote: input.staffNote?.trim() || existing.staffNote,
      updatedAt: new Date(),
    })
    .where(eq(reservations.id, input.id))
    .returning();

  return { ok: true as const, row: updated[0], overCapacity: false };
}

export async function cancelReservationAsGuest(id: string) {
  const existing = await getReservationById(id);
  if (!existing) return { ok: false as const, error: "Reservation not found." };
  if (!canGuestCancel(existing.status as BookingStatus)) {
    return {
      ok: false as const,
      error: "This reservation can no longer be cancelled online.",
    };
  }

  const db = getDb();
  const updated = await db
    .update(reservations)
    .set({
      status: "cancelled",
      updatedBy: "guest",
      updatedAt: new Date(),
    })
    .where(eq(reservations.id, id))
    .returning();

  return { ok: true as const, row: updated[0] };
}

export function publicBookingView(row: ReservationRow) {
  return {
    id: row.id,
    code: row.code,
    date: row.date,
    guests: row.guests,
    name: row.name,
    phone: row.phone,
    email: row.email,
    notes: row.notes,
    status: row.status as BookingStatus,
    capacityFlag: Boolean(row.capacityFlag),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
