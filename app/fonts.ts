import localFont from "next/font/local";

// Self-hosted, subset, display: swap. Exposed as CSS variables consumed by the
// Tailwind theme (--font-display / --font-body / --font-mono).

// Display — General Sans (Fontshare). Weights 500 / 600 only.
export const generalSans = localFont({
  src: [
    { path: "../public/fonts/out-sans.ttf", weight: "500", style: "normal" },
    { path: "../public/fonts/out-sans.ttf", weight: "600", style: "normal" },
  ],
  variable: "--font-general-sans",
  display: "swap",
  preload: true,
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

// Body — Inter. Weights 400 / 500.
export const inter = localFont({
  src: [
    { path: "../public/fonts/inter-400.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/inter-500.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-inter",
  display: "swap",
  preload: true,
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

// Numerals / meta / labels — JetBrains Mono. Weights 400 / 500.
export const jetbrainsMono = localFont({
  src: [
    { path: "../public/fonts/jbmono-400.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/jbmono-500.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-jetbrains",
  display: "swap",
  preload: true,
  fallback: ["ui-monospace", "SFMono-Regular", "monospace"],
});
