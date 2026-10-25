import { Resend } from "resend";
import { site } from "@/data/site";
import { softDailyCoverCap, statusLabel, type BookingStatus } from "@/data/booking";
import {
  insertReservation,
  isBookingStoreReady,
  publicBookingView,
  updateReservationStatus,
} from "@/lib/bookings";
import {
  isOpenWAConfigured,
  openWANotifyChatId,
  sendOpenWAText,
  toWhatsAppChatId,
} from "@/lib/openwa";
import type { StaffId } from "@/data/booking";

export type ReservationInput = {
  date: string;
  guests: string;
  name: string;
  phone: string;
  email: string;
  notes?: string;
};

export type DeliveryChannel =
  | "openwa_staff"
  | "openwa_guest"
  | "resend"
  | "web3forms"
  | "database";

export type ReservationResult =
  | {
      ok: true;
      id: string;
      code: string;
      status: BookingStatus;
      delivery: DeliveryChannel[];
      capacityWarning?: boolean;
      duplicate?: boolean;
      warnings?: string[];
    }
  | { ok: false; error: string; code: "validation" | "config" | "upstream" };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateReservation(
  raw: Partial<ReservationInput>,
): { ok: true; data: ReservationInput } | { ok: false; error: string } {
  const date = String(raw.date ?? "").trim();
  const guests = String(raw.guests ?? "").trim();
  const name = String(raw.name ?? "").trim();
  const phone = String(raw.phone ?? "").trim();
  const email = String(raw.email ?? "").trim().toLowerCase();
  const notes = String(raw.notes ?? "").trim();

  if (!date) return { ok: false, error: "Please choose a date." };

  const todaySg = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Singapore",
  });
  if (date < todaySg) {
    return { ok: false, error: "Please choose today or a future date." };
  }

  if (!guests) return { ok: false, error: "Please choose party size." };
  if (name.length < 2) return { ok: false, error: "Please enter your name." };
  if (phone.length < 8)
    return { ok: false, error: "Please enter a valid mobile number." };
  if (!EMAIL_RE.test(email))
    return { ok: false, error: "Please enter a valid email." };
  if (notes.length > 1000) return { ok: false, error: "Notes are too long." };

  return {
    ok: true,
    data: { date, guests, name, phone, email, notes: notes || undefined },
  };
}

function statusUrl(code: string) {
  const base = process.env.NEXT_PUBLIC_SITE_URL || site.domain;
  return `${base.replace(/\/$/, "")}/reserve/status?code=${encodeURIComponent(code)}`;
}

function staffAlertMessage(
  data: ReservationInput,
  code: string,
  capacityWarning: boolean,
) {
  return [
    `*New table request — ${site.name}*`,
    "",
    `Code: ${code}`,
    `Name: ${data.name}`,
    `Phone: ${data.phone}`,
    `Email: ${data.email}`,
    `Date: ${data.date}`,
    `Guests: ${data.guests}`,
    data.notes ? `Notes: ${data.notes}` : "Notes: (none)",
    capacityWarning
      ? `⚠ Soft capacity: confirming this may exceed ${softDailyCoverCap()} covers that day.`
      : null,
    "",
    "Open Admin to Confirm / Waitlist / Decline.",
  ]
    .filter(Boolean)
    .join("\n");
}

function guestSubmittedMessage(data: ReservationInput, code: string) {
  return [
    `*${site.name}* — reservation received`,
    "",
    `Hi ${data.name}, we got your table request.`,
    `Code: *${code}*`,
    `Date: ${data.date}`,
    `Guests: ${data.guests}`,
    "",
    "Status: Submitted — please wait while we confirm.",
    `Check anytime: ${statusUrl(code)}`,
    "",
    "We usually reply within a few hours during open hours.",
  ].join("\n");
}

export function guestStatusMessage(
  name: string,
  code: string,
  date: string,
  guests: string,
  status: BookingStatus,
) {
  return [
    `*${site.name}* — reservation update`,
    "",
    `Hi ${name},`,
    `Code: *${code}*`,
    `Date: ${date} · Guests: ${guests}`,
    "",
    `Status: *${statusLabel(status)}*`,
    `Details: ${statusUrl(code)}`,
    "",
    status === "confirmed"
      ? "See you soon. Reply here if you need to change anything."
      : status === "waitlist"
        ? "We will contact you if a table opens up."
        : status === "declined"
          ? "Sorry we could not take this booking. Call us if you have questions."
          : status === "cancelled"
            ? "This request has been cancelled."
            : "Thank you.",
  ].join("\n");
}

function buildEmailBodies(
  data: ReservationInput,
  code: string,
  capacityWarning: boolean,
) {
  const text = staffAlertMessage(data, code, capacityWarning).replaceAll("*", "").replaceAll("⚠", "!");
  const html = `
    <div style="font-family:Georgia,serif;line-height:1.5;color:#2a1f18">
      <h2 style="margin:0 0 12px">New table reservation</h2>
      <p style="margin:0 0 16px;color:#5c4a3d">Code: <strong>${code}</strong></p>
      <table style="border-collapse:collapse;width:100%;max-width:520px">
        ${[
          ["Name", data.name],
          ["Phone", data.phone],
          ["Email", data.email],
          ["Date", data.date],
          ["Guests", data.guests],
          ["Notes", data.notes || "(none)"],
        ]
          .map(
            ([label, value]) => `
          <tr>
            <td style="padding:8px 0;border-bottom:1px solid #e8dfd4;width:120px;color:#5c4a3d">${label}</td>
            <td style="padding:8px 0;border-bottom:1px solid #e8dfd4"><strong>${escapeHtml(String(value))}</strong></td>
          </tr>`,
          )
          .join("")}
      </table>
      ${
        capacityWarning
          ? `<p style="margin:16px 0 0;color:#8b1e1e">Soft capacity warning: day may exceed ${softDailyCoverCap()} covers.</p>`
          : ""
      }
      <p style="margin:20px 0 0;color:#5c4a3d;font-size:14px">Confirm in Admin or reply to the guest.</p>
    </div>
  `;

  return {
    text,
    html,
    subject: `Table request ${code} — ${data.name} — ${data.date}`,
  };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function notifyStaffWhatsApp(
  data: ReservationInput,
  code: string,
  capacityWarning: boolean,
) {
  const chatId = openWANotifyChatId();
  return sendOpenWAText(
    chatId,
    staffAlertMessage(data, code, capacityWarning),
  );
}

async function notifyGuestWhatsApp(
  phone: string,
  text: string,
) {
  const chatId = toWhatsAppChatId(phone);
  return sendOpenWAText(chatId, text);
}

async function sendWithResend(
  data: ReservationInput,
  code: string,
  capacityWarning: boolean,
) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false as const, error: "RESEND_API_KEY missing." };

  const to = process.env.RESERVATION_TO_EMAIL || site.email;
  const from =
    process.env.RESEND_FROM_EMAIL ||
    `${site.name} <onboarding@resend.dev>`;

  const { text, html, subject } = buildEmailBodies(data, code, capacityWarning);
  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from,
    to: [to],
    replyTo: data.email,
    subject,
    text,
    html,
  });

  if (error) {
    return {
      ok: false as const,
      error: error.message || "Could not send the reservation email.",
    };
  }

  return { ok: true as const };
}

async function sendWithWeb3Forms(
  data: ReservationInput,
  code: string,
  capacityWarning: boolean,
) {
  const accessKey = process.env.WEB3FORMS_ACCESS_KEY;
  if (!accessKey) {
    return { ok: false as const, error: "WEB3FORMS_ACCESS_KEY missing." };
  }

  const { text, subject } = buildEmailBodies(data, code, capacityWarning);

  const response = await fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      access_key: accessKey,
      subject,
      from_name: data.name,
      email: data.email,
      phone: data.phone,
      date: data.date,
      guests: data.guests,
      notes: data.notes || "",
      request_id: code,
      message: text,
    }),
  });

  const payload = (await response.json().catch(() => null)) as
    | { success?: boolean; message?: string }
    | null;

  if (!response.ok || !payload?.success) {
    return {
      ok: false as const,
      error: payload?.message || "Could not send the reservation email.",
    };
  }

  return { ok: true as const };
}

/** Persist booking, notify staff + guest. */
export async function createReservation(
  raw: Partial<ReservationInput>,
): Promise<ReservationResult> {
  const validated = validateReservation(raw);
  if (!validated.ok) {
    return { ok: false, error: validated.error, code: "validation" };
  }

  if (!isBookingStoreReady()) {
    return {
      ok: false,
      error:
        "Booking database is not configured. Set DATABASE_URL (Neon Postgres).",
      code: "config",
    };
  }

  const data = validated.data;
  const saved = await insertReservation(data);
  const row = saved.row;
  const delivery: DeliveryChannel[] = ["database"];
  const warnings: string[] = [];

  const hasOpenWA = isOpenWAConfigured();
  const hasResend = Boolean(process.env.RESEND_API_KEY);
  const hasWeb3 = Boolean(process.env.WEB3FORMS_ACCESS_KEY);

  if (!saved.duplicate) {
    if (hasOpenWA) {
      const staffWa = await notifyStaffWhatsApp(
        data,
        row.code,
        saved.capacityFlag,
      );
      if (staffWa.ok) delivery.push("openwa_staff");
      else warnings.push(`Staff WhatsApp: ${staffWa.error}`);

      const guestWa = await notifyGuestWhatsApp(
        data.phone,
        guestSubmittedMessage(data, row.code),
      );
      if (guestWa.ok) delivery.push("openwa_guest");
      else warnings.push(`Guest WhatsApp: ${guestWa.error}`);
    }

    if (hasResend) {
      const mail = await sendWithResend(data, row.code, saved.capacityFlag);
      if (mail.ok) delivery.push("resend");
      else warnings.push(`Email (Resend): ${mail.error}`);
    } else if (hasWeb3) {
      const mail = await sendWithWeb3Forms(data, row.code, saved.capacityFlag);
      if (mail.ok) delivery.push("web3forms");
      else warnings.push(`Email (Web3Forms): ${mail.error}`);
    }

    if (
      !hasOpenWA &&
      !hasResend &&
      !hasWeb3
    ) {
      warnings.push(
        "Saved to database, but no WhatsApp/email channel is configured for staff alerts.",
      );
    }
  }

  return {
    ok: true,
    id: row.id,
    code: row.code,
    status: row.status as BookingStatus,
    delivery,
    capacityWarning: saved.capacityFlag,
    duplicate: saved.duplicate,
    ...(warnings.length ? { warnings } : {}),
  };
}

/** Staff changes status → notify guest on WhatsApp. */
export async function applyStaffStatusChange(input: {
  id: string;
  status: BookingStatus;
  staff: StaffId;
  staffNote?: string;
}) {
  if (!isBookingStoreReady()) {
    return { ok: false as const, error: "Database not configured.", code: "config" as const };
  }

  const result = await updateReservationStatus(input);
  if (!result.ok) {
    return { ok: false as const, error: result.error, code: "validation" as const };
  }

  const row = result.row;
  const warnings: string[] = [];

  if (isOpenWAConfigured()) {
    const guestWa = await notifyGuestWhatsApp(
      row.phone,
      guestStatusMessage(
        row.name,
        row.code,
        row.date,
        row.guests,
        row.status as BookingStatus,
      ),
    );
    if (!guestWa.ok) warnings.push(`Guest WhatsApp: ${guestWa.error}`);
  }

  return {
    ok: true as const,
    booking: publicBookingView(row),
    overCapacity: result.overCapacity,
    ...(warnings.length ? { warnings } : {}),
  };
}
