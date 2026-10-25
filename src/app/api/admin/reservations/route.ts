import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import {
  dayCapacity,
  isBookingStoreReady,
  listReservations,
  publicBookingView,
} from "@/lib/bookings";

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
  const tab = (searchParams.get("tab") || "needs") as
    | "needs"
    | "upcoming"
    | "today"
    | "all";

  const rows = await listReservations({ tab });
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Singapore",
  });
  const capacity = await dayCapacity(today);

  // Capacity for unique dates in the list
  const dates = [...new Set(rows.map((r) => r.date))];
  const capacities = await Promise.all(dates.map((d) => dayCapacity(d)));

  return NextResponse.json({
    ok: true,
    staff: session,
    todayCapacity: capacity,
    capacities,
    reservations: rows.map(publicBookingView),
  });
}
