import type { Metadata, Viewport } from "next";
import "./globals.css";
import { generalSans, inter, jetbrainsMono } from "./fonts";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Rajanna Adeli — Workforce & operations software",
    template: "%s — Rajanna Adeli",
  },
  description: SITE.positioning,
  applicationName: SITE.name,
  authors: [{ name: SITE.name, url: SITE.url }],
  creator: SITE.name,
  openGraph: {
    type: "website",
    siteName: SITE.name,
    url: SITE.url,
    title: "Rajanna Adeli — Workforce & operations software",
    description: SITE.positioning,
  },
  twitter: {
    card: "summary_large_image",
    title: "Rajanna Adeli — Workforce & operations software",
    description: SITE.positioning,
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
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
      <body className="flex min-h-full flex-col bg-black">
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
        {/* <Analytics /> — placeholder; wired in a later phase */}
      </body>
    </html>
  );
}
