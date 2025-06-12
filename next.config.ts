import type { NextConfig } from 'next';

/**
 * Next.js configuration with security-focused headers
 */
const nextConfig: NextConfig = {
  // Disable the X-Powered-By header for security
  poweredByHeader: false,

  async headers() {
    return Promise.resolve([
      {
        source: '/(.*)',
        headers: [
          {
            // HSTS: Force HTTPS only, include subdomains, preload in browser lists
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            // Enable DNS prefetching for performance
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            // Opener policy: Prevent window.opener attacks
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            // Embedder policy: Control which resources can be embedded
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            // Resource policy: Restrict resource loading to same origin
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-origin',
          },
          {
            // Permissions policy: Restrict access to sensitive features
            key: 'Permissions-Policy',
            value:
              'camera=(), microphone=(), geolocation=(), browsing-topics=()',
          },
          {
            // Content-Type sniffing protection
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            // Referrer policy: Limit referrer information in requests
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            // Frame options: Prevent framing (clickjacking protection)
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            // Browser thread isolation hint for performance/security
            key: 'Origin-Agent-Cluster',
            value: '?1',
          },
          {
            // Block Flash/PDF/Silverlight cross-domain policies
            key: 'X-Permitted-Cross-Domain-Policies',
            value: 'none',
          },
        ],
      },
    ]);
  },
};

export default nextConfig;
