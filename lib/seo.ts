import { SITE } from "@/lib/site";
import { FAQ } from "@/lib/faq";
import type { CaseStudy } from "@/lib/content";

/*
  SEO layer — every machine-readable signal the site emits lives here.

  Two rules govern this file:
  1. Nothing is invented. Every claim in the structured data traces back to copy
     that is visible on the page or to a fact in the case markdown.
  2. Structured data mirrors visible content. Google treats a mismatch between
     JSON-LD and rendered copy as spam, so the FAQ entities read from lib/faq.ts,
     the case entities read from lib/content.ts, and neither is retyped here.
*/

/** Stable @id fragments so entities can reference each other instead of repeating themselves. */
export const ID = {
  person: `${SITE.url}/#person`,
  website: `${SITE.url}/#website`,
  home: `${SITE.url}/#webpage`,
} as const;

/*
  Keyword sets. These are not meta-keywords voodoo — Next writes them into the
  `keywords` meta tag, which Google ignores but Bing, DuckDuckGo and several AI
  crawlers still read, and they double as the vocabulary for `knowsAbout`.
  Chosen to match how a prospect actually searches, not how the industry writes
  brochures.
*/
export const CORE_KEYWORDS = [
  "workforce management software developer",
  "rostering software developer",
  "employee scheduling software",
  "GPS time and attendance",
  "shift scheduling app development",
  "labour hire software",
  "multi-tenant SaaS developer",
  "React Native field app developer",
  "Next.js developer",
  "freelance full-stack developer",
  "deskless workforce software",
  "compliance tracking software",
];

export const NAME_KEYWORDS = ["Rajanna Adeli", "rajanna.dev", "Rajanna Adeli developer"];

export const KNOWS_ABOUT = [
  "Workforce management software",
  "Employee rostering and shift scheduling",
  "GPS time and attendance tracking",
  "Compliance and certification tracking",
  "Multi-tenant SaaS architecture",
  "Row-level security in PostgreSQL",
  "React and Next.js",
  "React Native and Expo",
  "Node.js, NestJS and Express",
  "PostgreSQL, Prisma and MongoDB",
  "Offline-first application design",
  "Point-of-sale systems",
];

/*
  Per-case SEO facts that are not derivable from the markdown body. `published`
  is the earliest date the case describes and `modified` the latest; both are
  read from the timeline line by hand because those strings are prose ("2023–2024
  (~1 year)"), not parseable dates. `schema` picks the entity type: things a user
  can install or open are SoftwareApplication, the rest are CreativeWork.
*/
interface CaseSeo {
  published: string;
  modified: string;
  schema: "SoftwareApplication" | "CreativeWork";
  applicationCategory: string;
  keywords: string[];
  /**
   * Search-facing descriptor for the <title>. Most cases already carry one as
   * the markdown deck ("DocFort — a drawing vault for LHP Motors"). RosterBay
   * and GAD Builder have a bare product name for a heading, so a descriptor is
   * condensed here from their own lede — a bare product name tells a searcher
   * who has never heard of it precisely nothing.
   */
  titleTail?: string;
}

export const CASE_SEO: Record<string, CaseSeo> = {
  rosterbay: {
    published: "2026-05-01",
    modified: "2026-07-01",
    schema: "SoftwareApplication",
    applicationCategory: "BusinessApplication",
    keywords: [
      "rostering software",
      "workforce management platform",
      "GPS clock in app",
      "certification expiry tracking",
      "multi-tenant Postgres row-level security",
      "Expo React Native workforce app",
    ],
    titleTail: "a live rostering & GPS time-tracking platform",
  },
  whitefleet: {
    published: "2026-01-01",
    modified: "2026-06-30",
    schema: "SoftwareApplication",
    applicationCategory: "BusinessApplication",
    keywords: [
      "labour hire software Australia",
      "worker owned data wallet",
      "consent ledger",
      "workforce compliance platform",
      "Prisma Postgres multi-tenant",
      "Expo worker mobile app",
    ],
  },
  gad: {
    published: "2023-06-01",
    modified: "2024-06-30",
    schema: "SoftwareApplication",
    applicationCategory: "DesignApplication",
    keywords: [
      "general arrangement drawing software",
      "engineering drawing automation",
      "SVG component library",
      "Electron desktop engineering tool",
      "manufacturing drawing configurator",
    ],
    titleTail: "a general arrangement drawing builder",
  },
  docfort: {
    published: "2024-01-01",
    modified: "2024-12-31",
    schema: "SoftwareApplication",
    applicationCategory: "BusinessApplication",
    keywords: [
      "engineering document control system",
      "drawing revision control",
      "document management PWA",
      "Socket.IO notification queue",
      "Electron document vault",
    ],
  },
  planit: {
    published: "2025-01-01",
    modified: "2025-06-30",
    schema: "SoftwareApplication",
    applicationCategory: "EducationalApplication",
    keywords: [
      "college timetable generator",
      "automatic class scheduling software",
      "constraint solver scheduling",
      "academic timetable app",
    ],
  },
  dilpos: {
    published: "2025-01-01",
    modified: "2025-12-31",
    schema: "SoftwareApplication",
    applicationCategory: "BusinessApplication",
    keywords: [
      "point of sale system Australia",
      "offline first POS",
      "newsagent POS software",
      "multi-tenant retail inventory",
      "Tauri desktop till app",
    ],
  },
};

/**
 * Case <title>. Deliberately omits "— Rajanna Adeli": Google now renders the
 * site name separately from og:site_name and the WebSite entity, so repeating it
 * in the title only spends characters that the case's own descriptor needs.
 */
export function caseTitle(name: string, deck: string, slug: string): string {
  const tail = deck || caseSeo(slug).titleTail;
  return tail ? `${name} — ${tail}` : name;
}

export function caseSeo(slug: string): CaseSeo {
  return (
    CASE_SEO[slug] ?? {
      published: "2025-01-01",
      modified: "2025-12-31",
      schema: "CreativeWork",
      applicationCategory: "BusinessApplication",
      keywords: [],
    }
  );
}

/* ── Entity builders ─────────────────────────────────────────────────────── */

type Json = Record<string, unknown>;

/** The root identity every other entity points at. */
export function personEntity(): Json {
  return {
    "@type": "Person",
    "@id": ID.person,
    name: SITE.name,
    alternateName: "Rajanna",
    url: SITE.url,
    email: `mailto:${SITE.email}`,
    image: `${SITE.url}/opengraph-image`,
    jobTitle: "Full-stack Software Developer",
    description: SITE.positioning,
    knowsAbout: KNOWS_ABOUT,
    knowsLanguage: ["en"],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Pune",
      addressRegion: "Maharashtra",
      addressCountry: "IN",
    },
    alumniOf: {
      "@type": "EducationalOrganization",
      name: "B.Tech, Computer Science & Engineering",
    },
    worksFor: { "@type": "Organization", name: "Tata Consultancy Services" },
    sameAs: [SITE.links.linkedin, SITE.links.github, SITE.links.upwork],
  };
}

/**
 * The freelance practice as a service business. This is what makes the site
 * eligible for local/service rich results, and it is where the areaServed
 * signal (AU/US/UK) lives.
 */
export function professionalServiceEntity(): Json {
  return {
    "@type": "ProfessionalService",
    "@id": `${SITE.url}/#service`,
    name: "Rajanna Adeli — Workforce & Operations Software",
    url: SITE.url,
    image: `${SITE.url}/opengraph-image`,
    description: SITE.positioning,
    founder: { "@id": ID.person },
    email: `mailto:${SITE.email}`,
    priceRange: "Fixed-price, quoted per project",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Pune",
      addressRegion: "Maharashtra",
      addressCountry: "IN",
    },
    areaServed: [
      { "@type": "Country", name: "Australia" },
      { "@type": "Country", name: "United States" },
      { "@type": "Country", name: "United Kingdom" },
      { "@type": "Country", name: "India" },
    ],
    sameAs: [SITE.links.linkedin, SITE.links.github, SITE.links.upwork],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Services",
      itemListElement: [
        "Rostering and shift scheduling systems",
        "GPS time and attendance",
        "Compliance and certification tracking",
        "Multi-tenant SaaS platforms",
        "React Native field apps",
        "Realtime operations dashboards",
      ].map((name) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name },
      })),
    },
  };
}

export function websiteEntity(): Json {
  return {
    "@type": "WebSite",
    "@id": ID.website,
    url: SITE.url,
    name: SITE.name,
    description: SITE.positioning,
    inLanguage: "en",
    publisher: { "@id": ID.person },
    copyrightHolder: { "@id": ID.person },
  };
}

export function faqEntity(): Json {
  return {
    "@type": "FAQPage",
    "@id": `${SITE.url}/#faq`,
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function breadcrumbEntity(trail: { name: string; path: string }[]): Json {
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      item: `${SITE.url}${t.path}`,
    })),
  };
}

/** A case study as both the thing built and the article describing it. */
export function caseEntity(c: CaseStudy): Json {
  const seo = caseSeo(c.slug);
  const live = c.facts.links.find((l) => !/repo|github/i.test(l.label + l.url));
  const images = c.images
    .filter((i) => i.shortlisted)
    .slice(0, 6)
    .map((i) => `${SITE.url}${i.webp}`);

  const work: Json = {
    "@type": seo.schema,
    "@id": `${SITE.url}/work/${c.slug}/#project`,
    name: c.name,
    alternateName: caseTitle(c.name, c.deck, c.slug),
    description: c.lede,
    url: `${SITE.url}/work/${c.slug}`,
    inLanguage: "en",
    author: { "@id": ID.person },
    creator: { "@id": ID.person },
    dateCreated: seo.published,
    dateModified: seo.modified,
    keywords: seo.keywords.join(", "),
    image: images,
    ...(live ? { sameAs: [live.url] } : {}),
  };

  if (seo.schema === "SoftwareApplication") {
    work.applicationCategory = seo.applicationCategory;
    work.operatingSystem = "Web";
    // The demo is genuinely free to open; nothing here is a price claim about
    // the client engagements, which are quoted privately.
    if (c.slug === "rosterbay") {
      work.offers = { "@type": "Offer", price: "0", priceCurrency: "USD" };
    }
  }
  return work;
}

/** Wraps entities in a single @graph — one script tag, one parse, cross-linkable @ids. */
export function graph(...entities: Json[]) {
  return { "@context": "https://schema.org", "@graph": entities };
}
