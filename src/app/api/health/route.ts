import { NextResponse } from "next/server";
import { isAdminAuthConfigured } from "@/lib/admin-auth";
import { isBookingStoreReady } from "@/lib/bookings";
import { isOpenWAConfigured } from "@/lib/openwa";
import { softDailyCoverCap } from "@/data/booking";

export async function GET() {
  const database = isBookingStoreReady();
  const openwa = isOpenWAConfigured();
  const resend = Boolean(process.env.RESEND_API_KEY);
  const web3forms = Boolean(process.env.WEB3FORMS_ACCESS_KEY);
  const admin = isAdminAuthConfigured();
  const ready = database;

  return NextResponse.json({
    ok: true,
    service: "conestone-cbp",
    reservations: ready ? "ready" : "needs_database",
    softDailyCoverCap: softDailyCoverCap(),
    channels: {
      database: database ? "configured" : "off",
      openwa: openwa ? "configured" : "off",
      resend: resend ? "configured" : "off",
      web3forms: web3forms ? "configured" : "off",
      adminPins: admin ? "configured" : "off",
    },
    timestamp: new Date().toISOString(),
  });
}
