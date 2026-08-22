import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ["192.168.1.102"],
  // Only proxy /api/* to the local backend during development.
  // In production (Vercel), the top-level vercel.json rewrites handle
  // routing /api/backend/* to the backend service — Next.js must not
  // intercept those requests or they will be sent to a non-existent localhost.
  async rewrites() {
    if (!isDev) return [];
    return [
      {
        source: "/api/:path*",
        destination: "http://127.0.0.1:8000/api/:path*",
      },
    ];
  },
};

export default nextConfig;
