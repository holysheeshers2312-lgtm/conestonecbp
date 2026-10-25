import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { STAFF_MEMBERS, type StaffId } from "@/data/booking";

const COOKIE = "conestone_admin";
const TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

export type AdminSession = {
  staff: StaffId;
  name: string;
  exp: number;
};

function sessionSecret() {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_PIN_MADHAV ||
    "dev-only-change-me"
  );
}

function pinFor(staff: StaffId) {
  if (staff === "madhav") return process.env.ADMIN_PIN_MADHAV || "";
  if (staff === "soujanya") return process.env.ADMIN_PIN_SOUJANYA || "";
  return "";
}

export function isAdminAuthConfigured() {
  return Boolean(
    process.env.ADMIN_PIN_MADHAV && process.env.ADMIN_PIN_SOUJANYA,
  );
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function sign(payload: string) {
  return createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
}

export function createSessionToken(staff: StaffId): string {
  const member = STAFF_MEMBERS.find((s) => s.id === staff);
  const body: AdminSession = {
    staff,
    name: member?.name || staff,
    exp: Date.now() + TTL_MS,
  };
  const payload = Buffer.from(JSON.stringify(body)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined | null): AdminSession | null {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  if (!safeEqual(sign(payload), signature)) return null;

  try {
    const body = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as AdminSession;
    if (!body?.staff || !body.exp || body.exp < Date.now()) return null;
    if (!STAFF_MEMBERS.some((s) => s.id === body.staff)) return null;
    return body;
  } catch {
    return null;
  }
}

export function verifyStaffPin(staff: StaffId, pin: string) {
  const expected = pinFor(staff);
  if (!expected) {
    return { ok: false as const, error: "Admin PINs are not configured." };
  }
  if (!pin || !safeEqual(pin, expected)) {
    return { ok: false as const, error: "Incorrect PIN." };
  }
  return { ok: true as const };
}

export async function getAdminSession() {
  const jar = await cookies();
  return verifySessionToken(jar.get(COOKIE)?.value);
}

export async function setAdminSessionCookie(staff: StaffId) {
  const jar = await cookies();
  jar.set(COOKIE, createSessionToken(staff), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: TTL_MS / 1000,
  });
}

export async function clearAdminSessionCookie() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export { COOKIE as ADMIN_COOKIE_NAME };
