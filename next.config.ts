import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Disable the X-Powered-By header for security
  poweredByHeader: false,

  async headers() {
    // Only apply security headers in production
    if (process.env.NODE_ENV !== 'production') {
      return [];
    }

    return [
      {
        // Static security headers applied at build-time for better performance
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
