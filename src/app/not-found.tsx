import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { site } from "@/data/site";

export default function NotFound() {
  return (
    <>
      <Nav />
      <main className="flex flex-1 flex-col items-center justify-center bg-paper px-5 py-28 text-center md:px-8">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-muted">
          404
        </p>
        <h1 className="mt-4 font-display text-3xl font-semibold text-ink md:text-5xl">
          Page not found
        </h1>
        <p className="mt-4 max-w-md text-muted">
          That link does not exist on {site.name}. Head back for the menu,
          reserve a table, or contact us.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="btn-contact inline-flex min-h-11 items-center px-6 text-sm font-semibold"
          >
            Back to home
          </Link>
          <Link
            href="/#reserve"
            className="inline-flex min-h-11 items-center border border-[color:var(--line)] px-6 text-sm font-semibold text-ink transition-colors hover:border-brand-red hover:text-brand-red"
          >
            Reserve a table
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
