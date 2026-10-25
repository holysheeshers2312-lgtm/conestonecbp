import { NextResponse } from "next/server";
import {
  cancelReservationAsGuest,
  isBookingStoreReady,
  lookupReservation,
  publicBookingView,
} from "@/lib/bookings";
import { statusLabel, type BookingStatus } from "@/data/booking";
import { guestStatusMessage } from "@/lib/reservations";
import {
  isOpenWAConfigured,
  openWANotifyChatId,
  sendOpenWAText,
  toWhatsAppChatId,
} from "@/lib/openwa";

export async function POST(request: Request) {
  if (!isBookingStoreReady()) {
    return NextResponse.json(
      { ok: false, error: "Booking database is not configured." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  const raw = (body || {}) as {
    action?: string;
    code?: string;
    phone?: string;
    date?: string;
    id?: string;
  };

  if (raw.action === "cancel" && raw.id) {
    const cancelled = await cancelReservationAsGuest(raw.id);
    if (!cancelled.ok) {
      return NextResponse.json(
        { ok: false, error: cancelled.error },
        { status: 400 },
      );
    }

    if (isOpenWAConfigured()) {
      await sendOpenWAText(
        toWhatsAppChatId(cancelled.row.phone),
        guestStatusMessage(
          cancelled.row.name,
          cancelled.row.code,
          cancelled.row.date,
          cancelled.row.guests,
          "cancelled",
        ),
      );
      await sendOpenWAText(
        openWANotifyChatId(),
        `Guest cancelled ${cancelled.row.code} (${cancelled.row.name}, ${cancelled.row.date}).`,
      );
    }

    return NextResponse.json({
      ok: true,
      booking: publicBookingView(cancelled.row),
    });
  }

  const row = await lookupReservation({
    code: raw.code,
    phone: raw.phone,
    date: raw.date,
  });

  if (!row) {
    return NextResponse.json(
      { ok: false, error: "No reservation found. Check the code or phone + date." },
      { status: 404 },
    );
  }

  return NextResponse.json({
    ok: true,
    booking: publicBookingView(row),
    statusLabel: statusLabel(row.status as BookingStatus),
  });
}
