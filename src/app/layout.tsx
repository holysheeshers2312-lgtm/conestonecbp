import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";
import { site } from "@/data/site";
import { ThemeScript } from "@/components/ThemeScript";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${site.name} | ${site.kitchenBrand} · Changi Business Park`,
    template: `%s | ${site.name}`,
  },
  description:
    "ConeStone CBP and Amma Kitchen in Changi Business Park. Traditional Andhra cooking, tiffins, chaat, snacks, catering, and drinks.",
  metadataBase: new URL(site.domain),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: `${site.name} | Traditional Cooking`,
    description:
      "South Indian kitchen and bar at ESR Park @Changi. Tiffins, snacks, catering, and drinks.",
    url: site.domain,
    siteName: site.name,
    locale: "en_SG",
    type: "website",
    images: [
      {
        url: "/images/hero-food.jpg",
        width: 1600,
        height: 900,
        alt: `${site.name} food`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} | ${site.kitchenBrand}`,
    description:
      "Andhra kitchen and bar at Changi Business Park. Menu, catering, and table requests.",
    images: ["/images/hero-food.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${manrope.variable} h-full antialiased`}
      data-theme="light"
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body
        className="min-h-full flex flex-col paper-shape"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
