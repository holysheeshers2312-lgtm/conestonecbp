/**
 * OpenWA (https://www.open-wa.org) — self-hosted WhatsApp HTTP gateway.
 * Run OpenWA separately (Docker), scan QR once, then this app calls its REST API.
 *
 * Docs: POST /api/sessions/:sessionId/messages/send-text
 * Auth: X-API-Key with OPERATOR role or higher.
 */

import { site } from "@/data/site";

export type OpenWASendResult =
  | { ok: true; messageId: string }
  | { ok: false; error: string; code: "config" | "upstream" };

/** Digits-only international number → WhatsApp JID (`6581725039@c.us`). */
export function toWhatsAppChatId(phone: string, defaultCountry = "65"): string {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  // Local SG mobile starting with 8/9 (8 digits)
  if (digits.length === 8 && (digits.startsWith("8") || digits.startsWith("9"))) {
    digits = `${defaultCountry}${digits}`;
  }
  return `${digits}@c.us`;
}

export function isOpenWAConfigured() {
  return Boolean(
    process.env.OPENWA_BASE_URL &&
      process.env.OPENWA_API_KEY &&
      process.env.OPENWA_SESSION_ID,
  );
}

function nestErrorMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const message = (payload as { message?: unknown }).message;
  if (typeof message === "string" && message.trim()) return message;
  if (Array.isArray(message) && message.length) {
    return message.map(String).join("; ");
  }
  const error = (payload as { error?: unknown }).error;
  if (typeof error === "string" && error.trim()) return error;
  return null;
}

export async function sendOpenWAText(
  chatId: string,
  text: string,
): Promise<OpenWASendResult> {
  const baseUrl = process.env.OPENWA_BASE_URL?.replace(/\/$/, "");
  const apiKey = process.env.OPENWA_API_KEY;
  const sessionId = process.env.OPENWA_SESSION_ID;

  if (!baseUrl || !apiKey || !sessionId) {
    return {
      ok: false,
      error:
        "OpenWA is not configured. Set OPENWA_BASE_URL, OPENWA_API_KEY, and OPENWA_SESSION_ID.",
      code: "config",
    };
  }

  const url = `${baseUrl}/api/sessions/${encodeURIComponent(sessionId)}/messages/send-text`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
      body: JSON.stringify({ chatId, text }),
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        ok: false,
        error:
          nestErrorMessage(payload) ||
          `OpenWA send failed (${response.status}). Is the session ready?`,
        code: "upstream",
      };
    }

    const messageId =
      payload && typeof payload === "object"
        ? (payload as { messageId?: string }).messageId
        : undefined;

    if (!messageId) {
      return {
        ok: false,
        error: "OpenWA returned an unexpected response (missing messageId).",
        code: "upstream",
      };
    }

    return { ok: true, messageId };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Could not reach the OpenWA server.",
      code: "upstream",
    };
  }
}

/** Restaurant staff WhatsApp that receives booking alerts. */
export function openWANotifyChatId() {
  const raw =
    process.env.OPENWA_NOTIFY_PHONE ||
    process.env.RESERVATION_WHATSAPP_TO ||
    site.primaryPhone.phone;
  return toWhatsAppChatId(raw);
}
