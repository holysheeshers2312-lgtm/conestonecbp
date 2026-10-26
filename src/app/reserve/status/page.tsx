import type { Metadata } from "next";
import { Suspense } from "react";
import { StatusLookup } from "@/components/StatusLookup";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Reservation status",
  description: `Check your ${site.name} table request status.`,
  robots: { index: false, follow: false },
};

export default function ReserveStatusPage() {
  return (
    <main className="min-h-screen bg-[color:var(--cream,#f7f1e8)] px-5 py-16 text-[color:var(--ink,#2a1f18)] md:px-8">
      <div className="mx-auto max-w-lg">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[#8b1e1e]">
          {site.name}
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-fraunces)] text-3xl md:text-4xl">
          Reservation status
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[#5c4a3d]">
          Enter your reservation ID (e.g. CS-261027-003), or the mobile number
          and date you used when requesting a table. Works on any phone or
          computer.
        </p>
        <Suspense fallback={<p className="mt-8 text-sm text-[#5c4a3d]">Loading…</p>}>
          <StatusLookup />
        </Suspense>
      </div>
    </main>
  );
}
