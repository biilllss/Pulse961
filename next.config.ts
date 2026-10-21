import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // The preview panel proxies the dev server from *.space-z.ai origins.
  allowedDevOrigins: ["*.space-z.ai", "space-z.ai"],
  images: {
    // Unsplash hosts all site photography — swap photo IDs in src/lib/images.ts
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
    // Cap the srcset so phones never pull huge files: 3840 removed from
    // the default device list — the largest candidate is now 2048px wide.
    deviceSizes: [640, 750, 832, 1080, 1200, 1920, 2048],
  },
};

export default nextConfig;
