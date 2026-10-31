import type { NextConfig } from "next";

const backendUrl = process.env.BACKEND_URL ?? "http://localhost:8082";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        // Everything under /api/* proxies to the backend EXCEPT /api/nextauth/*,
        // which is the NextAuth (Auth.js) catch-all (app/api/nextauth/[...nextauth]).
        // afterFiles rewrites are checked before dynamic routes, so the exclusion
        // must live in the source via a negative lookahead.
        source: "/api/:path((?!nextauth(?:/|$)).*)",
        destination: `${backendUrl}/api/:path`,
      },
      {
        // Local-disk uploads (e.g. the payment QR code) are served by the
        // backend at /uploads/..., public and unauthenticated — proxied the
        // same way as /api/* so relative URLs the backend returns (e.g.
        // qr_code_url) just work, regardless of BACKEND_URL per environment.
        source: "/uploads/:path*",
        destination: `${backendUrl}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
