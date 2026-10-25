import { site } from "@/data/site";

/** Soft daily cover cap default — override with SOFT_DAILY_COVER_CAP env. */
export const DEFAULT_SOFT_DAILY_COVER_CAP = 40;

export function softDailyCoverCap() {
  const n = Number(process.env.SOFT_DAILY_COVER_CAP || DEFAULT_SOFT_DAILY_COVER_CAP);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_SOFT_DAILY_COVER_CAP;
}

export const BOOKING_STATUSES = [
  "submitted",
  "confirmed",
  "waitlist",
  "declined",
  "cancelled",
  "expired",
  "completed",
] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const STAFF_MEMBERS = [
  { id: "madhav", name: "Madhav", phone: site.contacts[0].phone },
  { id: "soujanya", name: "Soujanya", phone: site.contacts[1].phone },
] as const;

export type StaffId = (typeof STAFF_MEMBERS)[number]["id"];

export const STATUS_LABELS: Record<BookingStatus, string> = {
  submitted: "Submitted — awaiting confirmation",
  confirmed: "Confirmed",
  waitlist: "Waitlist",
  declined: "Declined",
  cancelled: "Cancelled",
  expired: "Expired",
  completed: "Completed",
};

export function statusLabel(status: BookingStatus) {
  return STATUS_LABELS[status] ?? status;
}

export function parseGuestCount(guests: string): number {
  if (guests === "20+") return 20;
  const n = Number.parseInt(guests, 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

export function isActiveCapacityStatus(status: BookingStatus) {
  return status === "confirmed";
}

export function canGuestCancel(status: BookingStatus) {
  return status === "submitted" || status === "waitlist" || status === "confirmed";
}

export function isStaffActionStatus(status: string): status is BookingStatus {
  return (
    status === "confirmed" ||
    status === "waitlist" ||
    status === "declined" ||
    status === "cancelled"
  );
}
