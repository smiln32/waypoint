import type { NextConfig } from "next";

/**
 * Baseline security headers applied to every response. These are safe,
 * non-breaking defaults (no Content-Security-Policy yet — a strict CSP needs
 * testing against Next's inline styles/scripts and font loading before it can
 * ship without breaking the app). Clickjacking is closed with X-Frame-Options.
 */
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
