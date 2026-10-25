import { NextResponse } from "next/server";
import { STAFF_MEMBERS, type StaffId } from "@/data/booking";
import {
  isAdminAuthConfigured,
  setAdminSessionCookie,
  verifyStaffPin,
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  if (!isAdminAuthConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error: "Set ADMIN_PIN_MADHAV and ADMIN_PIN_SOUJANYA in the environment.",
      },
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

  const { staff, pin } = (body || {}) as { staff?: string; pin?: string };
  if (!staff || !STAFF_MEMBERS.some((s) => s.id === staff)) {
    return NextResponse.json(
      { ok: false, error: "Choose Madhav or Soujanya." },
      { status: 400 },
    );
  }

  const check = verifyStaffPin(staff as StaffId, String(pin || ""));
  if (!check.ok) {
    return NextResponse.json(
      { ok: false, error: check.error },
      { status: 401 },
    );
  }

  await setAdminSessionCookie(staff as StaffId);
  const member = STAFF_MEMBERS.find((s) => s.id === staff)!;

  return NextResponse.json({
    ok: true,
    staff: { id: member.id, name: member.name },
  });
}
