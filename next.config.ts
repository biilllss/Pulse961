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
  },
};

export default nextConfig;
