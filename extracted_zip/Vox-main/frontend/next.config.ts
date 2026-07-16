import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configured in Next.js 15+ to use Tailwind v4 correctly with PostCSS
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: "http://127.0.0.1:8000/api/v1/:path*", // Proxy to Backend
      },
    ];
  },
  // Ensure standalone output for Docker
  output: "standalone",
};

export default nextConfig;
