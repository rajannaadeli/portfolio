import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

// Rendered once at build. `force-static` is required by `output: "export"`,
// and is correct regardless: nothing here depends on the request.
export const dynamic = "force-static";

/*
  Web app manifest. Not a PWA play — it exists so Android "add to home screen",
  Chrome's install surface, and several link-preview parsers have a canonical
  name, colour, and icon to read instead of guessing from the favicon.
*/
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Rajanna Adeli — Workforce & Operations Software Developer",
    short_name: "Rajanna Adeli",
    description: SITE.positioning,
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    lang: "en",
    categories: ["business", "productivity", "developer"],
    icons: [
      { src: "/favicon.ico", sizes: "any", type: "image/x-icon" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
