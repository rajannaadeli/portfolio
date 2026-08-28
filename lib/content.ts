import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import { marked } from "marked";
import dimensions from "./generated/image-dimensions.json" with { type: "json" };
import blur from "./generated/blur.json" with { type: "json" };

/*
  Content pipeline — build-time, zero client cost.

  IMPORTANT: the case markdown files carry NO YAML frontmatter. Every field is
  normalized in code from the body (see DECISIONS.md). If a future author adds
  frontmatter, gray-matter will pick it up and it takes precedence.
*/

const CASES_DIR = join(process.cwd(), "cases");

// Canonical order fallback (design/brief), using the on-disk slug `gad`.
export const CASE_ORDER = [
  "rosterbay",
  "whitefleet",
  "gad",
  "docfort",
  "planit",
  "dilpos",
] as const;

export type CaseSlug = (typeof CASE_ORDER)[number];

// Public display names (master brief §4). Distinct from the H1, which may
// include a tagline.
const DISPLAY_NAME: Record<CaseSlug, string> = {
  rosterbay: "RosterBay",
  whitefleet: "WhiteFleet",
  gad: "GAD Builder",
  docfort: "DocFort",
  planit: "PlanIt",
  dilpos: "DilPOS",
};

// Per-case accent (design-direction §2).
export type AccentName = "violet" | "orange" | "pink" | "lime";
const ACCENT: Record<CaseSlug, AccentName> = {
  rosterbay: "violet",
  whitefleet: "orange",
  gad: "lime",
  docfort: "pink",
  planit: "violet",
  dilpos: "orange",
};

const ACCENT_VAR: Record<AccentName, string> = {
  violet: "var(--color-accent-violet)",
  orange: "var(--color-accent-orange)",
  pink: "var(--color-accent-pink)",
  lime: "var(--color-accent-lime)",
};

// Darkened accent-as-text values, AA (≥4.5:1) on the paper canvas (#F7F6F3).
// Used inside the light band where the vivid accents fail contrast as text.
const ACCENT_TEXT: Record<AccentName, string> = {
  violet: "#5b3fd6",
  orange: "#c23a15",
  pink: "#c71e63",
  lime: "#5f6b00",
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CaseLink {
  label: string;
  url: string;
}

export interface CaseFacts {
  role: string;
  timeline: string;
  stack: string[];
  status: string;
  links: CaseLink[];
  /** The original unparsed facts line, for auditing. */
  raw: string;
}

export type ImageTheme = "light" | "dark";

export type ImageFrame = "browser" | "phone";
export type ImageUse =
  | "hero"
  | "featured"
  | "inline-proof"
  | "gallery"
  | "comparison"
  | "mobile-pair";

export interface CaseImage {
  file: string;
  avif: string;
  webp: string;
  width: number;
  height: number;
  rank: number;
  shortlisted: boolean;
  frame: ImageFrame;
  bestUsedFor: ImageUse;
  alt: string;
  caption: string;
  /** Human-authored, never generated. Empty until Rajanna fills the manifest. */
  proves: string;
  /** Real product URL shown in browser chrome. Empty until filled. */
  url: string;
  blurDataURL: string | null;
}

export interface CaseStudy {
  slug: CaseSlug;
  name: string;
  /** Full H1 text (may include a tagline after an em dash). */
  title: string;
  /** First paragraph under the H1 — used as the lede. */
  lede: string;
  facts: CaseFacts;
  proofChips: string[];
  bodyHtml: string;
  accent: AccentName;
  accentVar: string;
  /** AA-safe darkened accent for use as text inside the light band. */
  accentTextVar: string;
  order: number;
  images: CaseImage[];
  /** Dark-theme screenshots, if the case has a dark-ui manifest (RosterBay).
   *  Used where the case is shown on a dark band. Empty otherwise. */
  darkImages: CaseImage[];
  /** Which normalized fields came back empty — surfaced in the build report. */
  warnings: string[];
}

// ---------------------------------------------------------------------------
// Facts-line normalization
// ---------------------------------------------------------------------------

const LABEL_RE = /^\*{0,2}\s*(role|timeline|stack|status|links?)\s*:\s*/i;

function extractLinks(line: string): CaseLink[] {
  const links: CaseLink[] = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line))) {
    links.push({ label: m[1].trim(), url: m[2].trim() });
  }
  return links;
}

function stripInline(s: string): string {
  return s
    .replace(/\*\*/g, "")
    .replace(/`/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .trim();
}

function splitStack(segments: string[]): string[] {
  const out: string[] = [];
  for (const seg of segments) {
    // Stack tokens may be joined by " + " or ", " within one segment.
    for (const part of seg.split(/\s\+\s|,\s+/)) {
      const t = part.trim();
      if (t) out.push(t);
    }
  }
  return out;
}

/** Parse the facts line into structured fields, tolerant of both the labeled
 *  and the unlabeled-positional shapes found across the six files. */
function parseFacts(line: string): CaseFacts {
  const raw = line.trim();
  const links = extractLinks(raw);

  // Strip whole-line/inline backticks, then split on the middot.
  const cleaned = raw.replace(/`/g, "");
  const segments = cleaned
    .split("·")
    .map((s) => s.trim())
    .filter(Boolean);

  const isLabeled = segments.some((s) => LABEL_RE.test(s));

  const facts: CaseFacts = {
    role: "",
    timeline: "",
    stack: [],
    status: "",
    links,
    raw,
  };

  if (isLabeled) {
    let field: keyof CaseFacts | null = null;
    const buckets: Record<string, string[]> = {
      role: [],
      timeline: [],
      stack: [],
      status: [],
      links: [],
    };
    const isPureLink = (s: string) => /^\[[^\]]+\]\([^)]+\)$/.test(s.trim());
    for (const seg of segments) {
      const lm = seg.match(LABEL_RE);
      if (lm) {
        const key = lm[1].toLowerCase();
        field = (key === "links" || key === "link" ? "links" : key) as keyof CaseFacts;
        const rest = stripInline(seg.replace(LABEL_RE, ""));
        if (rest && field !== "links" && !isPureLink(seg.replace(LABEL_RE, ""))) {
          buckets[field].push(rest);
        }
      } else if (field && field !== "links" && !isPureLink(seg)) {
        const v = stripInline(seg);
        if (v) buckets[field].push(v);
      }
    }
    facts.role = buckets.role.join(" · ");
    facts.timeline = buckets.timeline.join(" · ");
    facts.status = buckets.status.join(" · ");
    facts.stack = splitStack(buckets.stack);
  } else {
    // Unlabeled positional — classify each segment.
    const stack: string[] = [];
    for (const segRaw of segments) {
      const seg = stripInline(segRaw);
      if (!seg) continue;
      // A pure link segment is captured via `links` already.
      if (/^\[[^\]]+\]\([^)]+\)$/.test(segRaw.trim())) continue;
      if (/(19|20)\d{2}|\b(week|month|year)s?\b|–|—/.test(seg) && !facts.timeline) {
        facts.timeline = seg;
      } else if (/production|pilot|live|demo|shipped|beta|in use/i.test(seg)) {
        facts.status = facts.status ? `${facts.status} · ${seg}` : seg;
      } else if (/developer|engineer|full[-\s]?stack|\bsolo\b|\bsole\b/i.test(seg) && !facts.role) {
        facts.role = seg;
      } else {
        stack.push(seg);
      }
    }
    facts.stack = splitStack(stack);
  }

  return facts;
}

// ---------------------------------------------------------------------------
// Body parsing
// ---------------------------------------------------------------------------

interface ParsedBody {
  title: string;
  lede: string;
  facts: CaseFacts;
  proofChips: string[];
  bodyMarkdown: string;
  internalStripped: boolean;
}

function parseMarkdown(slug: string, source: string): ParsedBody {
  const { content } = matter(source);
  const lines = content.split("\n");

  // H1
  const h1Index = lines.findIndex((l) => /^#\s+/.test(l));
  const title = h1Index >= 0 ? lines[h1Index].replace(/^#\s+/, "").trim() : DISPLAY_NAME[slug as CaseSlug];

  // Everything before the first `## ` heading is the header region.
  const bodyStart = lines.findIndex((l) => /^##\s+/.test(l));
  const headerLines = (bodyStart >= 0 ? lines.slice(h1Index + 1, bodyStart) : lines.slice(h1Index + 1))
    .map((l) => l.trim());

  // Lede = first non-empty prose paragraph after the H1.
  const lede = headerLines.find((l) => l && !l.startsWith("---") && !l.startsWith("#")) ?? "";

  // Facts line = first line after the lede that reads like metadata (contains a
  // middot and either a label, a repo/link, or a date).
  const factsLine =
    headerLines.find(
      (l) =>
        l !== lede &&
        l.includes("·") &&
        (LABEL_RE.test(l) || /\[[^\]]+\]\([^)]+\)/.test(l) || /(19|20)\d{2}/.test(l) || /`/.test(l)),
    ) ?? "";
  const facts = parseFacts(factsLine);

  // Proof chips = list items / bold spans / code spans in the header region,
  // excluding the lede, facts line, separators, and screenshot markers.
  const proofChips: string[] = [];
  for (const l of headerLines) {
    if (!l || l === lede || l === factsLine.trim()) continue;
    if (l.startsWith("---") || /^>\s*\[SCREENSHOT/i.test(l)) continue;
    if (/^[-*]\s+/.test(l)) {
      proofChips.push(stripInline(l.replace(/^[-*]\s+/, "")));
    } else if (/\*\*[^*]+\*\*|`[^`]+`/.test(l)) {
      // one line of bold/code spans separated by middots
      for (const part of l.split("·")) {
        const t = stripInline(part);
        if (t) proofChips.push(t);
      }
    }
  }

  // Body = from the first `## ` onward. Each case file ends with internal
  // production notes that must never be published: `## GAPS` (author queries to
  // Rajanna) and `## CAPTURE LIST` (screenshot shot lists). Truncate the body at
  // the first such heading, dropping any trailing `---` immediately before it.
  let bodyLines = bodyStart >= 0 ? lines.slice(bodyStart) : [];
  const internalRe = /^#{1,6}\s+(GAPS|CAPTURE\s+LIST|CAPTURE|OPEN\s+QUESTIONS|NOTES?|TODO)\b/i;
  const cutAt = bodyLines.findIndex((l) => internalRe.test(l.trim()));
  let internalStripped = false;
  if (cutAt >= 0) {
    internalStripped = true;
    bodyLines = bodyLines.slice(0, cutAt);
    while (bodyLines.length && bodyLines[bodyLines.length - 1].trim() === "") bodyLines.pop();
    if (bodyLines.length && bodyLines[bodyLines.length - 1].trim() === "---") bodyLines.pop();
  }

  // Remove any embedded `> [SCREENSHOT: …]` placement markers.
  const bodyMarkdown = bodyLines
    .filter((l) => !/^>\s*\[SCREENSHOT/i.test(l.trim()))
    .join("\n");

  return { title, lede, facts, proofChips, bodyMarkdown, internalStripped };
}

// ---------------------------------------------------------------------------
// Image manifest normalization
// ---------------------------------------------------------------------------

interface RawImage {
  fileNameBase: string;
  formats: { avif: string; webp: string };
  rank: number;
  isShortlisted: boolean;
  platform: string;
  description: string;
  altText: string;
  tags: string[];
  suggestedUse: string;
  // Present in the dark-ui manifest; absent in the main (light) manifest.
  width?: number;
  height?: number;
}

interface RawManifest {
  case: string;
  images: RawImage[];
}

const FRAME_MAP: Record<string, ImageFrame> = {
  web: "browser",
  "desktop-terminal": "browser",
  mobile: "phone",
};

const USE_MAP: Record<string, ImageUse> = {
  hero: "hero",
  "feature-highlight": "featured",
  "before-after": "comparison",
  "detail-shot": "inline-proof",
  "mobile-showcase": "mobile-pair",
  gallery: "gallery",
};

const dims = dimensions as Record<string, number[]>;
const blurs = blur as Record<string, string>;

function normalizeImages(
  slug: string,
  manifest: RawManifest,
  theme: ImageTheme = "light",
): CaseImage[] {
  // Dark screenshots are copied to public/cases/<slug>/dark/ and keyed under a
  // "<slug>/dark/" namespace in the dimensions/blur maps.
  const dir = theme === "dark" ? `/cases/${slug}/dark` : `/cases/${slug}`;
  const ns = theme === "dark" ? `${slug}/dark` : slug;

  return manifest.images
    .map((img): CaseImage => {
      const key = `${ns}/${img.fileNameBase}`;
      // Dark manifest carries width/height inline; light uses the dims map.
      const width = img.width ?? dims[key]?.[0] ?? 0;
      const height = img.height ?? dims[key]?.[1] ?? 0;
      return {
        file: img.fileNameBase,
        avif: `${dir}/${img.fileNameBase}.avif`,
        webp: `${dir}/${img.fileNameBase}.webp`,
        width,
        height,
        rank: img.rank,
        shortlisted: Boolean(img.isShortlisted),
        frame: FRAME_MAP[img.platform] ?? "browser",
        bestUsedFor: USE_MAP[img.suggestedUse] ?? "gallery",
        alt: img.altText ?? "",
        caption: img.description ?? "",
        proves: "", // human-authored, not present in case-images.json
        url: "", // human-authored, not present in case-images.json
        blurDataURL: blurs[key] ?? null,
      };
    })
    .sort((a, b) => a.rank - b.rank);
}

/** Read the optional dark-theme manifest (cases/<slug>/dark-ui/case-images.json). */
function readDarkImages(slug: string): CaseImage[] {
  const path = join(CASES_DIR, slug, "dark-ui", "case-images.json");
  if (!existsSync(path)) return [];
  const manifest = JSON.parse(readFileSync(path, "utf8")) as RawManifest;
  return normalizeImages(slug, manifest, "dark");
}

// ---------------------------------------------------------------------------
// Assembly
// ---------------------------------------------------------------------------

function readCase(slug: CaseSlug): CaseStudy {
  const mdPath = join(CASES_DIR, slug, `${slug}.md`);
  const source = readFileSync(mdPath, "utf8");
  const { title, lede, facts, proofChips, bodyMarkdown, internalStripped } = parseMarkdown(
    slug,
    source,
  );

  const manifest = JSON.parse(
    readFileSync(join(CASES_DIR, slug, "case-images.json"), "utf8"),
  ) as RawManifest;
  const images = normalizeImages(slug, manifest);
  const darkImages = readDarkImages(slug);

  const warnings: string[] = [];
  if (!facts.role) warnings.push("facts.role empty");
  if (!facts.timeline) warnings.push("facts.timeline empty");
  if (!facts.stack.length) warnings.push("facts.stack empty");
  if (!facts.status) warnings.push("facts.status empty");
  if (!facts.links.length) warnings.push("facts.links empty");
  if (!proofChips.length) warnings.push("proofChips empty");
  const missingDims = images.filter((i) => !i.width || !i.height);
  if (missingDims.length) warnings.push(`${missingDims.length} image(s) missing dimensions`);
  if (internalStripped) warnings.push("internal GAPS/CAPTURE LIST section stripped from body");

  const accent = ACCENT[slug];

  return {
    slug,
    name: DISPLAY_NAME[slug],
    title,
    lede,
    facts,
    proofChips,
    bodyHtml: marked.parse(bodyMarkdown, { async: false }) as string,
    accent,
    accentVar: ACCENT_VAR[accent],
    accentTextVar: ACCENT_TEXT[accent],
    order: CASE_ORDER.indexOf(slug),
    images,
    darkImages,
    warnings,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

let cache: CaseStudy[] | null = null;

export function getAllCases(): CaseStudy[] {
  if (!cache) {
    cache = CASE_ORDER.map(readCase).sort((a, b) => a.order - b.order);
  }
  return cache;
}

export function getCase(slug: string): CaseStudy | undefined {
  return getAllCases().find((c) => c.slug === slug);
}

export function getShortlisted(slug: string, theme: ImageTheme = "light"): CaseImage[] {
  const c = getCase(slug);
  if (!c) return [];
  const pool = theme === "dark" && c.darkImages.length ? c.darkImages : c.images;
  return pool.filter((i) => i.shortlisted);
}

export function getImageByUse(
  slug: string,
  use: ImageUse,
  theme: ImageTheme = "light",
): CaseImage | undefined {
  const shortlisted = getShortlisted(slug, theme);
  return shortlisted.find((i) => i.bestUsedFor === use) ?? shortlisted[0];
}

export function getCaseAccent(slug: string): { name: AccentName; cssVar: string } {
  const c = getCase(slug);
  const name = c?.accent ?? "violet";
  return { name, cssVar: ACCENT_VAR[name] };
}

/** Prev/next in canonical order (wraps). */
export function getCaseNeighbors(slug: string): { prev: CaseStudy; next: CaseStudy } {
  const all = getAllCases();
  const i = all.findIndex((c) => c.slug === slug);
  return {
    prev: all[(i - 1 + all.length) % all.length],
    next: all[(i + 1) % all.length],
  };
}
