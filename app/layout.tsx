import type { Metadata, Viewport } from "next";
import "./globals.css";
import { generalSans, inter, jetbrainsMono } from "./fonts";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { JsonLd } from "@/components/seo/JsonLd";
import { Analytics } from "@/components/seo/Analytics";
import { SITE } from "@/lib/site";
import {
  CORE_KEYWORDS,
  NAME_KEYWORDS,
  graph,
  personEntity,
  professionalServiceEntity,
  websiteEntity,
} from "@/lib/seo";

/*
  Title strategy: name first, specialism second. Recruiters and clients who
  already know the name search the name; prospects search the specialism. One
  title has to serve both, and the name has to win — ranking first for
  "Rajanna Adeli" is the actual goal, since most traffic arrives from a
  proposal, a résumé, or a profile link rather than a cold search.
*/
const TITLE = "Rajanna Adeli — Workforce & Operations Software Developer";
// Kept under 165 characters: past that Google truncates the tail, and the tail
// is where the qualifying nouns live.
const DESCRIPTION =
  "I build rostering, GPS time-tracking and compliance systems for staffing, cleaning, security and care companies, plus the field apps their crews use.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: TITLE, template: "%s — Rajanna Adeli" },
  description: DESCRIPTION,
  applicationName: SITE.name,
  keywords: [...NAME_KEYWORDS, ...CORE_KEYWORDS],
  authors: [{ name: SITE.name, url: SITE.url }],
  creator: SITE.name,
  publisher: SITE.name,
  category: "technology",
  // Stops iOS Safari turning stray numbers in case studies into phone links,
  // which mangles the copy and injects markup Google reads as broken.
  formatDetection: { telephone: false, address: false, email: false },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    url: SITE.url,
    title: TITLE,
    description: DESCRIPTION,
    locale: "en_AU",
    alternateLocale: ["en_US", "en_GB"],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: { canonical: "/" },
  // Verification tokens are supplied by the host as env vars so nothing
  // account-specific is committed. Absent env → the tag is simply omitted.
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
      ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION }
      : {},
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${generalSans.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        {/* Warm the connection to the only third-party origin the demo links hit. */}
        <link rel="preconnect" href="https://rosterbay.com" />
        <link rel="dns-prefetch" href="https://rosterbay.com" />
      </head>
      <body className="flex min-h-full flex-col bg-black">
        {/* Site-wide identity graph — Person, the practice, and the site itself. */}
        <JsonLd data={graph(personEntity(), professionalServiceEntity(), websiteEntity())} />
        <a
          href="#main"
          className="sr-only rounded-pill bg-accent-orange px-4 py-2 font-mono text-meta uppercase text-black focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-100"
        >
          Skip to content
        </a>
        <SmoothScroll>
          <Header />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
        </SmoothScroll>
        <Analytics />
      </body>
    </html>
  );
}
