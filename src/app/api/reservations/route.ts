import { NextResponse } from "next/server";
import { createReservation } from "@/lib/reservations";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { ok: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  const result = await createReservation(body as Record<string, string>);

  if (!result.ok) {
    const status =
      result.code === "validation" ? 400 : result.code === "config" ? 503 : 502;
    return NextResponse.json(result, { status });
  }

  return NextResponse.json(result, { status: 201 });
}
