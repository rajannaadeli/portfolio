import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

/*
  Shared Open Graph card renderer.

  Every shared link — an Upwork proposal, a WhatsApp message, a LinkedIn post —
  unfurls through this. Rendered at build time by Satori, so it costs nothing at
  request time and works under a static export.

  Satori cannot read WOFF2, so the display face is loaded from the TTF. If that
  read ever fails the card still renders in the fallback sans rather than
  throwing and taking the whole build down with it.
*/

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

const ACCENT_HEX: Record<string, string> = {
  violet: "#8267ff",
  orange: "#ff4a1c",
  pink: "#ff3d8b",
  lime: "#d8ff4a",
};

async function displayFont() {
  try {
    const data = await readFile(join(process.cwd(), "public/fonts/out-sans.ttf"));
    return [{ name: "Display", data, weight: 600 as const, style: "normal" as const }];
  } catch {
    return undefined;
  }
}

export interface OgCard {
  /** Small mono line above the headline — e.g. "CASE 01 / WORKFORCE". */
  eyebrow: string;
  /** The headline. Kept to roughly 60 characters so it never needs to shrink. */
  title: string;
  /** One supporting line under the headline. */
  subtitle: string;
  /** Mono facts along the bottom — role, timeline, stack. */
  facts?: string[];
  accent?: keyof typeof ACCENT_HEX | string;
}

export async function renderOgCard({ eyebrow, title, subtitle, facts = [], accent = "orange" }: OgCard) {
  const hex = ACCENT_HEX[accent] ?? accent;
  const fonts = await displayFont();

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#000000",
          color: "#ffffff",
          padding: "72px 80px",
          fontFamily: "Display, sans-serif",
          position: "relative",
        }}
      >
        {/* Accent edge — the one piece of brand that survives a 300px thumbnail. */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 14,
            background: hex,
            display: "flex",
          }}
        />
        {/* Soft accent bloom, mirroring the site's frame halo. */}
        <div
          style={{
            position: "absolute",
            right: -180,
            top: -180,
            width: 620,
            height: 620,
            borderRadius: 620,
            background: hex,
            opacity: 0.16,
            display: "flex",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 68,
              height: 68,
              borderRadius: 18,
              border: "1px solid #2a2a30",
              background: "#111114",
              fontSize: 32,
            }}
          >
            RA
          </div>
          <div style={{ display: "flex", fontSize: 22, letterSpacing: 3, color: hex }}>
            {eyebrow.toUpperCase()}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ display: "flex", fontSize: 66, lineHeight: 1.05, letterSpacing: -2, maxWidth: 960 }}>
            {title}
          </div>
          <div style={{ display: "flex", fontSize: 28, lineHeight: 1.35, color: "#a1a1aa", maxWidth: 880 }}>
            {subtitle}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", maxWidth: 820 }}>
            {facts.slice(0, 4).map((f) => (
              <div
                key={f}
                style={{
                  display: "flex",
                  border: "1px solid #2a2a30",
                  borderRadius: 999,
                  padding: "8px 18px",
                  fontSize: 19,
                  color: "#8a8a93",
                }}
              >
                {f}
              </div>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              background: hex,
              color: "#0a0a0a",
              padding: "10px 22px",
              borderRadius: 999,
              fontSize: 22,
            }}
          >
            rajanna.dev
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE, ...(fonts ? { fonts } : {}) },
  );
}
