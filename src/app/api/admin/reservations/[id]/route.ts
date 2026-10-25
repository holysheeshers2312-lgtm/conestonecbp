import { NextResponse } from "next/server";
import { isStaffActionStatus } from "@/data/booking";
import { getAdminSession } from "@/lib/admin-auth";
import { applyStaffStatusChange } from "@/lib/reservations";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized." },
      { status: 401 },
    );
  }

  const { id } = await context.params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  const { status, staffNote } = (body || {}) as {
    status?: string;
    staffNote?: string;
  };

  if (!status || !isStaffActionStatus(status)) {
    return NextResponse.json(
      { ok: false, error: "Invalid status action." },
      { status: 400 },
    );
  }

  const result = await applyStaffStatusChange({
    id,
    status,
    staff: session.staff,
    staffNote,
  });

  if (!result.ok) {
    const http =
      result.code === "config" ? 503 : result.code === "validation" ? 400 : 502;
    return NextResponse.json(
      { ok: false, error: result.error },
      { status: http },
    );
  }

  return NextResponse.json(result);
}
