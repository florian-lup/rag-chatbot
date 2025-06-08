import type { MetadataRoute } from 'next';

const baseUrl = process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://localhost:3000';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/private/',
        '/api/',
        '/_next/',
        '/admin/',
        '/login',
        '/auth/',
        '/*.json',
        '/*?*',
        '/tests/',
        '/scripts/',
        '/documents/',
        '/*.log',
        '/*.bak',
        '/*.tmp',
        '/*.env',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
