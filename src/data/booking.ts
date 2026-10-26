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

export type AdminStatusFilter =
  | "needs"
  | "submitted"
  | "confirmed"
  | "waitlist"
  | "declined"
  | "cancelled"
  | "all";

export type AdminSortMode =
  | "date-asc"
  | "date-desc"
  | "newest"
  | "guests-desc"
  | "name-asc";

export const ADMIN_STATUS_FILTERS: {
  id: AdminStatusFilter;
  label: string;
}[] = [
  { id: "all", label: "All" },
  { id: "confirmed", label: "Confirmed" },
  { id: "needs", label: "Needs action" },
  { id: "waitlist", label: "Waitlist" },
  { id: "declined", label: "Declined" },
  { id: "cancelled", label: "Cancelled" },
];

export function statusShortLabel(status: BookingStatus) {
  switch (status) {
    case "submitted":
      return "Needs action";
    case "confirmed":
      return "Confirmed";
    case "waitlist":
      return "Waitlist";
    case "declined":
      return "Declined";
    case "cancelled":
      return "Cancelled";
    case "expired":
      return "Expired";
    case "completed":
      return "Completed";
    default:
      return status;
  }
}

export function statusBadgeClass(status: BookingStatus) {
  switch (status) {
    case "confirmed":
      return "admin-badge admin-badge--ok";
    case "waitlist":
      return "admin-badge admin-badge--wait";
    case "declined":
    case "cancelled":
    case "expired":
      return "admin-badge admin-badge--bad";
    case "submitted":
    default:
      return "admin-badge admin-badge--new";
  }
}
