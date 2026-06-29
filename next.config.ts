import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  async rewrites() {
    // In Docker Compose, "backend" is the service name — reachable internally without CORS.
    // Override with BACKEND_URL for local dev (e.g. http://localhost:5000).
    const backendUrl = process.env.BACKEND_URL || 'http://backend:5000';
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
