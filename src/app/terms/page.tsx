import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { mailHref, site, telHref } from "@/data/site";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: `Website terms for ${site.name} and ${site.kitchenBrand}.`,
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Use" updated="25 October 2026">
      <p>
        By using {site.domain.replace("https://", "")}, you agree to these
        terms. If you do not agree, please do not use the site.
      </p>

      <h2 className="font-display text-xl font-semibold text-ink md:text-2xl">
        About the site
      </h2>
      <p>
        This website provides information about {site.name} /{" "}
        {site.kitchenBrand} at Changi Business Park, including menu content
        taken from the restaurant booklet, location details, and ways to
        contact us.
      </p>

      <h2 className="font-display text-xl font-semibold text-ink md:text-2xl">
        Reservations
      </h2>
      <p>
        The &ldquo;Reserve a table&rdquo; form sends a booking{" "}
        <strong>request</strong> (currently by email). It does not guarantee
        a table until we confirm. For large parties, call{" "}
        <a
          href={telHref(site.primaryPhone.phone)}
          className="font-semibold text-gold hover:text-brand-red"
        >
          +65 {site.primaryPhone.display}
        </a>{" "}
        or email{" "}
        <a href={mailHref()} className="font-semibold text-gold hover:text-brand-red">
          {site.email}
        </a>
        .
      </p>

      <h2 className="font-display text-xl font-semibold text-ink md:text-2xl">
        Menu and prices
      </h2>
      <p>
        Names, descriptions, and prices are taken from the Cone Stone menu
        booklet and may change. The restaurant may update offerings without
        updating this site immediately.
      </p>

      <h2 className="font-display text-xl font-semibold text-ink md:text-2xl">
        Intellectual property
      </h2>
      <p>
        Site design, branding, and text are owned by {site.name} or used
        with permission. Menu content reflects the restaurant booklet.
        Please do not copy the site for commercial reuse without permission.
      </p>

      <h2 className="font-display text-xl font-semibold text-ink md:text-2xl">
        Limitation of liability
      </h2>
      <p>
        The site is provided for general information. We are not liable for
        temporary outages, outdated details, or decisions made solely from
        website content. Confirm important details by phone or in person.
      </p>

      <h2 className="font-display text-xl font-semibold text-ink md:text-2xl">
        Changes
      </h2>
      <p>
        We may update these terms from time to time. The &ldquo;Last
        updated&rdquo; date at the top of this page will change when we do.
      </p>

      <h2 className="font-display text-xl font-semibold text-ink md:text-2xl">
        Contact
      </h2>
      <p>
        Questions about these terms:{" "}
        <a href={mailHref()} className="font-semibold text-gold hover:text-brand-red">
          {site.email}
        </a>
        .
      </p>
    </LegalPage>
  );
}
