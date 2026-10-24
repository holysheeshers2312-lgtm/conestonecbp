import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { mailHref, site } from "@/data/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${site.name} handles contact details and website information.`,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="25 October 2026">
      <p>
        This policy explains how {site.name} (&ldquo;we&rdquo;, &ldquo;us&rdquo;)
        handles information when you use {site.domain.replace("https://", "")}{" "}
        or contact us about bookings, catering, or general enquiries.
      </p>

      <h2 className="font-display text-xl font-semibold text-ink md:text-2xl">
        What we collect
      </h2>
      <p>Depending on how you reach us, we may receive:</p>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          Contact details you send (name, mobile number, email, party size,
          preferred date, and any notes) when you use the reserve request or
          email/phone links.
        </li>
        <li>
          Basic technical data from hosting (for example IP address, browser
          type, and pages requested) in server logs.
        </li>
      </ul>
      <p>
        We do not currently run advertising trackers or sell personal
        information. If analytics or marketing tools are added later, this
        page will be updated and consent will be requested where required.
      </p>

      <h2 className="font-display text-xl font-semibold text-ink md:text-2xl">
        How we use information
      </h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>To respond to reservation, catering, and general enquiries.</li>
        <li>To confirm bookings and coordinate large parties.</li>
        <li>To operate, secure, and improve the website.</li>
      </ul>

      <h2 className="font-display text-xl font-semibold text-ink md:text-2xl">
        Sharing
      </h2>
      <p>
        We share information only with service providers needed to run the
        site or email (for example hosting), or when required by law. We do
        not sell your personal data.
      </p>

      <h2 className="font-display text-xl font-semibold text-ink md:text-2xl">
        Retention
      </h2>
      <p>
        Enquiry details are kept only as long as needed to handle your
        request and any related follow-up, unless a longer period is required
        for legal or accounting reasons.
      </p>

      <h2 className="font-display text-xl font-semibold text-ink md:text-2xl">
        Your choices
      </h2>
      <p>
        To access, correct, or ask us to delete contact details you sent,
        email{" "}
        <a href={mailHref()} className="font-semibold text-gold hover:text-brand-red">
          {site.email}
        </a>{" "}
        or call +65 {site.primaryPhone.display}.
      </p>

      <h2 className="font-display text-xl font-semibold text-ink md:text-2xl">
        Contact
      </h2>
      <p>
        {site.name}
        <br />
        {site.address.line1}, {site.address.line2}, {site.address.city}
        <br />
        Email:{" "}
        <a href={mailHref()} className="font-semibold text-gold hover:text-brand-red">
          {site.email}
        </a>
      </p>
    </LegalPage>
  );
}
