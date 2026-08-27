import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Every route in this site is statically prerendered. We do not use
  // `output: 'export'` (it would disable the image optimizer we may want in
  // later phases), but nothing here opts into dynamic rendering either.
  poweredByHeader: false,
  compress: true,
  images: {
    // Case screenshots are served as pre-encoded <picture> AVIF/WebP (see
    // DeviceFrame + DECISIONS.md). These formats still apply to any use of
    // next/image elsewhere.
    formats: ["image/avif", "image/webp"],
  },
  // Keep production client bundles free of source maps.
  productionBrowserSourceMaps: false,
};

export default nextConfig;
