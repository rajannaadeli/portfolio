import { ImageResponse } from "next/og";

// Site OG image, generated at build. Per-case OG images are Phase 3.
export const alt = "Rajanna Adeli — Workforce & operations software";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
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
          padding: "80px",
          color: "#ffffff",
        }}
      >
        <div style={{ display: "flex", fontSize: 40, letterSpacing: -1, fontWeight: 600 }}>RA</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 60, lineHeight: 1.05, letterSpacing: -2, maxWidth: 900 }}>
            Workforce & operations software for teams that run on deskless work.
          </div>
          <div style={{ fontSize: 28, color: "#8a8a93" }}>
            Rajanna Adeli · rostering · GPS time-tracking · compliance · field apps
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignSelf: "flex-start",
            background: "#ff4a1c",
            color: "#000000",
            padding: "10px 22px",
            borderRadius: 999,
            fontSize: 24,
          }}
        >
          rajanna.dev
        </div>
      </div>
    ),
    size,
  );
}
