import Link from "next/link";
import { mailHref, site, telHref } from "@/data/site";

export function Footer() {
  return (
    <footer className="border-t border-ink/10 bg-paper py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 md:flex-row md:items-end md:justify-between md:px-8">
        <div>
          <p className="font-display text-2xl text-brand-red">{site.name}</p>
          <p className="mt-1 text-sm text-muted">
            {site.kitchenBrand} · {site.tagline}
          </p>
          <p className="mt-4 text-sm text-ink/70">
            {site.address.line1}, {site.address.line2}, {site.address.city}
          </p>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <a href="/#menu" className="text-ink/80 hover:text-brand-red">
            Menu
          </a>
          <a href="/#reserve" className="text-ink/80 hover:text-brand-red">
            Reserve a table
          </a>
          <a href="/#contact" className="text-ink/80 hover:text-brand-red">
            Contact us
          </a>
          <a
            href={telHref(site.primaryPhone.phone)}
            className="font-semibold text-gold hover:text-brand-red"
          >
            +65 {site.primaryPhone.display}
          </a>
          <a
            href={mailHref()}
            className="font-semibold text-gold hover:text-brand-red"
          >
            {site.email}
          </a>
        </div>
      </div>
      <div className="mx-auto mt-10 flex max-w-6xl flex-col gap-3 px-5 text-xs text-muted md:flex-row md:items-center md:justify-between md:px-8">
        <p>
          © 2026 {site.name}. Menu content from the restaurant booklet.
          Placeholder photography is labeled until venue photos are provided.
        </p>
        <p className="flex flex-wrap gap-x-4 gap-y-1">
          <Link href="/privacy" className="hover:text-brand-red">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-brand-red">
            Terms of Use
          </Link>
        </p>
      </div>
    </footer>
  );
}
