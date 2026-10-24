import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Intro } from "@/components/Intro";
import { Featured } from "@/components/Featured";
import { MenuSection } from "@/components/MenuSection";
import { Catering } from "@/components/Catering";
import { Gallery } from "@/components/Gallery";
import { Visit } from "@/components/Visit";
import { Reserve } from "@/components/Reserve";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { site } from "@/data/site";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: site.name,
  alternateName: site.kitchenBrand,
  url: site.domain,
  telephone: `+65${site.primaryPhone.phone}`,
  email: site.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: `${site.address.line1}, ${site.address.line2}`,
    addressLocality: "Singapore",
    postalCode: "486017",
    addressCountry: "SG",
  },
  servesCuisine: ["South Indian", "Andhra"],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Nav />
      <main className="flex-1">
        <Hero />
        <Intro />
        <Featured />
        <MenuSection />
        <Catering />
        <Gallery />
        <Visit />
        <Reserve />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
