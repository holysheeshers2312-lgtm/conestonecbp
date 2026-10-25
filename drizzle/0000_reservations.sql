CREATE TABLE IF NOT EXISTS "reservations" (
  "id" text PRIMARY KEY NOT NULL,
  "code" text NOT NULL UNIQUE,
  "date" text NOT NULL,
  "guests" text NOT NULL,
  "guest_count" integer NOT NULL,
  "name" text NOT NULL,
  "phone" text NOT NULL,
  "phone_digits" text NOT NULL,
  "email" text NOT NULL,
  "notes" text,
  "status" text DEFAULT 'submitted' NOT NULL,
  "staff_note" text,
  "updated_by" text,
  "capacity_flag" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "expires_at" timestamp with time zone
);

CREATE INDEX IF NOT EXISTS "reservations_date_idx" ON "reservations" ("date");
CREATE INDEX IF NOT EXISTS "reservations_status_idx" ON "reservations" ("status");
CREATE INDEX IF NOT EXISTS "reservations_phone_date_idx" ON "reservations" ("phone_digits", "date");
