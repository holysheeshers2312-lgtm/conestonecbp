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
  title: `${site.name} | ${site.kitchenBrand} · Changi Business Park`,
  description:
    "ConeStone CBP and Amma Kitchen in Changi Business Park. Traditional Andhra cooking, tiffins, chaat, snacks, and drinks.",
  metadataBase: new URL(site.domain),
  openGraph: {
    title: `${site.name} | Traditional Cooking`,
    description:
      "South Indian kitchen and bar at ESR Park @Changi. Tiffins, snacks, catering, and drinks.",
    url: site.domain,
    siteName: site.name,
    locale: "en_SG",
    type: "website",
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
