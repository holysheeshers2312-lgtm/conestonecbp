import {
  integer,
  pgTable,
  text,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

export const reservations = pgTable(
  "reservations",
  {
    id: text("id").primaryKey(),
    code: text("code").notNull().unique(),
    date: text("date").notNull(),
    guests: text("guests").notNull(),
    guestCount: integer("guest_count").notNull(),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    phoneDigits: text("phone_digits").notNull(),
    email: text("email").notNull(),
    notes: text("notes"),
    status: text("status").notNull().default("submitted"),
    staffNote: text("staff_note"),
    updatedBy: text("updated_by"),
    capacityFlag: integer("capacity_flag").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
  },
  (table) => [
    index("reservations_date_idx").on(table.date),
    index("reservations_status_idx").on(table.status),
    index("reservations_phone_date_idx").on(table.phoneDigits, table.date),
  ],
);

export type ReservationRow = typeof reservations.$inferSelect;
export type NewReservationRow = typeof reservations.$inferInsert;
