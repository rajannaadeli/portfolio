import { ImageResponse } from "next/og";

// Apple's touch icon must be a raster; Safari ignores SVG here. Generated at
// build so there is no binary asset to keep in sync with the brand.
// Rendered once at build. `force-static` is required by `output: "export"`,
// and is correct regardless: nothing here depends on the request.
export const dynamic = "force-static";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#000000",
          color: "#ffffff",
          fontSize: 78,
          fontWeight: 600,
          letterSpacing: -2,
          borderLeft: "8px solid #ff4a1c",
        }}
      >
        RA
      </div>
    ),
    size,
  );
}
