import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import type { AdminSortMode, AdminStatusFilter } from "@/data/booking";
import {
  dayCapacity,
  isBookingStoreReady,
  listReservations,
  publicBookingView,
} from "@/lib/bookings";

const STATUS_FILTERS = new Set<AdminStatusFilter>([
  "needs",
  "submitted",
  "confirmed",
  "waitlist",
  "declined",
  "cancelled",
  "all",
]);

const SORT_MODES = new Set<AdminSortMode>([
  "date-asc",
  "date-desc",
  "newest",
  "guests-desc",
  "name-asc",
]);

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized." },
      { status: 401 },
    );
  }

  if (!isBookingStoreReady()) {
    return NextResponse.json(
      { ok: false, error: "DATABASE_URL is not configured." },
      { status: 503 },
    );
  }

  const { searchParams } = new URL(request.url);
  const statusParam = (searchParams.get("status") ||
    searchParams.get("tab") ||
    "needs") as AdminStatusFilter;
  const sortParam = (searchParams.get("sort") || "date-asc") as AdminSortMode;
  const dateParam = (searchParams.get("date") || "").trim();

  const status = STATUS_FILTERS.has(statusParam) ? statusParam : "needs";
  const sort = SORT_MODES.has(sortParam) ? sortParam : "date-asc";
  const date = /^\d{4}-\d{2}-\d{2}$/.test(dateParam) ? dateParam : undefined;

  const { rows, counts } = await listReservations({ status, sort, date });

  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Singapore",
  });
  const capacityDate = date || today;
  const capacity = await dayCapacity(capacityDate);

  return NextResponse.json({
    ok: true,
    staff: session,
    todayCapacity: capacity,
    dayCapacity: capacity,
    counts,
    filter: { status, sort, date: capacityDate },
    reservations: rows.map(publicBookingView),
  });
}
