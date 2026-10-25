import { and, desc, eq, gte, inArray, sql } from "drizzle-orm";
import {
  canGuestCancel,
  isActiveCapacityStatus,
  parseGuestCount,
  softDailyCoverCap,
  type BookingStatus,
  type StaffId,
} from "@/data/booking";
import { getDb, isDatabaseConfigured } from "@/lib/db";
import { reservations, type ReservationRow } from "@/lib/db/schema";
import { toWhatsAppChatId } from "@/lib/openwa";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function isBookingStoreReady() {
  return isDatabaseConfigured();
}

export function makeReservationId() {
  return `rsv_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function makeBookingCode() {
  let code = "RSV-";
  for (let i = 0; i < 4; i += 1) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return code;
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
  const code = makeBookingCode();
  const now = new Date();

  const row: typeof reservations.$inferInsert = {
    id,
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

  const inserted = await db.insert(reservations).values(row).returning();
  return {
    row: inserted[0],
    duplicate: false as const,
    capacityFlag,
  };
}

export async function getReservationByCode(code: string) {
  const db = getDb();
  const normalized = code.trim().toUpperCase();
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
  tab?: "needs" | "upcoming" | "today" | "all";
}) {
  const db = getDb();
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Singapore",
  });

  const rows = await db
    .select()
    .from(reservations)
    .orderBy(reservations.date, desc(reservations.createdAt));

  const tab = filter.tab || "needs";

  if (tab === "all") return rows;
  if (tab === "today") return rows.filter((r) => r.date === today);
  if (tab === "upcoming") {
    return rows.filter(
      (r) =>
        r.date >= today &&
        !["declined", "cancelled", "expired", "completed"].includes(r.status),
    );
  }
  // needs action
  return rows.filter(
    (r) =>
      r.date >= today &&
      (r.status === "submitted" || r.status === "waitlist"),
  );
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
