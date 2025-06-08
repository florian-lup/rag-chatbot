import type { NextConfig } from 'next';

// Determine if we are running `next dev` (development) or a production build
const isDev = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  // Disable the X-Powered-By header for security
  poweredByHeader: false,
  
  // Enable Lightning CSS optimization
  experimental: {
    optimizeCss: true,
  },

  async headers() {
    // Base security-related headers that we always want
    const headers: { key: string; value: string }[] = [
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=()',
      },
    ];

    // Add the Content-Security-Policy header ONLY in production
    if (!isDev) {
      headers.push({
        key: 'Content-Security-Policy',
        value:
          "default-src 'self'; img-src 'self' data: https:; script-src 'self' https://va.vercel-scripts.com; style-src 'self';",
      });
    }

    return [
      {
        source: '/(.*)',
        headers,
      },
    ];
  },
};

export default nextConfig;
