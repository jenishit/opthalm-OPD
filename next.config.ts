import type { NextConfig } from "next";

const backendUrl = process.env.BACKEND_URL ?? "http://localhost:8082";

const isDev = process.env.NODE_ENV === "development";

// Next.js inline bootstrap scripts need 'unsafe-inline' without a nonce setup;
// tighten to nonces via proxy.ts later if inline-script risk needs to go to 0.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  // Product photos are linked from any public https host (the inventory "image link" field).
  "img-src 'self' blob: data: https:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=(), payment=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      // The worker script must always be revalidated so updates roll out.
      { source: "/sw.js", headers: [{ key: "Cache-Control", value: "no-cache, no-store, must-revalidate" }] },
      // Patient data must never be cached by browsers or shared proxies.
      { source: "/api/:path*", headers: [{ key: "Cache-Control", value: "no-store" }] },
    ];
  },
  async redirects() {
    // The old mock registration wizard was retired — the real form lives at /patients/register.
    return [{ source: "/patients/new", destination: "/patients/register", permanent: true }];
  },
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
